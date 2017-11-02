package org.endeavourhealth.patientexplorer.endpoints;

import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Validate;
import org.endeavourhealth.common.fhir.ReferenceHelper;
import org.endeavourhealth.common.security.SecurityUtils;
import org.endeavourhealth.core.database.dal.DalProvider;
import org.endeavourhealth.core.database.dal.admin.ServiceDalI;
import org.endeavourhealth.core.database.dal.admin.models.Service;
import org.endeavourhealth.core.database.dal.audit.UserAuditDalI;
import org.endeavourhealth.core.database.dal.audit.models.AuditAction;
import org.endeavourhealth.core.database.dal.audit.models.AuditModule;
import org.endeavourhealth.core.database.dal.eds.PatientSearchDalI;
import org.endeavourhealth.core.database.dal.eds.models.PatientSearch;
import org.endeavourhealth.coreui.endpoints.AbstractEndpoint;
import org.endeavourhealth.patientexplorer.utility.ResourceFetcher;
import org.endeavourhealth.patientexplorer.utility.SearchTermsParser;
import org.endeavourhealth.transform.ui.helpers.ReferencedResources;
import org.endeavourhealth.transform.ui.models.resources.UIResource;
import org.endeavourhealth.transform.ui.models.resources.admin.UIPatient;
import org.endeavourhealth.transform.ui.models.resources.clinicial.*;
import org.endeavourhealth.transform.ui.models.types.*;
import org.endeavourhealth.transform.ui.transforms.UITransform;
import org.endeavourhealth.transform.ui.transforms.admin.UILocationTransform;
import org.endeavourhealth.transform.ui.transforms.admin.UIOrganisationTransform;
import org.endeavourhealth.transform.ui.transforms.admin.UIPractitionerTransform;
import org.endeavourhealth.transform.ui.transforms.clinical.UIClinicalTransform;
import org.hl7.fhir.instance.model.*;
import org.keycloak.representations.AccessToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.util.*;
import java.util.stream.Collectors;

@Path("/recordViewer")
public final class RecordViewerEndpoint extends AbstractEndpoint {

	private static final Logger LOG = LoggerFactory.getLogger(RecordViewerEndpoint.class);
	private static final UserAuditDalI userAudit = DalProvider.factoryUserAuditDal(AuditModule.EdsPatientExplorerModule.RecordViewer);
	private static final ServiceDalI serviceRepository = DalProvider.factoryServiceDal();
	private static final PatientSearchDalI patientSearchDal = DalProvider.factoryPatientSearchDal();
	//private static final PatientIdentifierRepository identifierRepository = new PatientIdentifierRepository();

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getServices")
	public Response getServices(@Context SecurityContext sc) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load, "Service List");
		LOG.debug("getServices");

		List<UIService> uiServices = UITransform.transformServices(serviceRepository.getAll());

		return buildResponse(uiServices);
	}

	@GET
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/getServiceName")
	public Response getServiceName(@Context SecurityContext sc, @QueryParam("serviceId") UUID serviceId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Service Name",
				"ServiceId", serviceId);
		LOG.debug("getServiceName");

		List<Service> services = serviceRepository.getAll();
		Optional<Service> service = services.stream()
				.filter(s -> s.getId().equals(serviceId))
				.findFirst();

		if (service.isPresent())
			return buildResponse(service.get().getName());

		return buildResponse(null);
	}

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getPerson")
    public Response getPerson(@Context SecurityContext sc, @QueryParam("nhsNumber") String nhsNumber) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Get person",
            "nhsNumber", nhsNumber);
        LOG.debug("getPerson");

        List<PatientSearch> patients = patientSearchDal.searchByNhsNumber(nhsNumber);

        if (patients.size() > 0) {
            List<UIPatient> result = buildPatientResultList(sc, patients);
            if (result.size() > 0)
                return buildResponse(result.get(0));
        }

        return buildResponse(null);
    }

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/findPerson")
	public Response findPerson(@Context SecurityContext sc, @QueryParam("searchTerms") String searchTerms) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Find person",
				"SearchTerm", searchTerms);
		//LOG.debug("findPerson");

		Set<String> userServiceAccessList = getUserAllowedOrganisations(sc); // SecurityUtils.getOrganisationRoles(sc).keySet();
		LOG.debug("findPerson in services " + String.join(", ", userServiceAccessList) + " for [" + searchTerms + "]");

		List<UIPatient> result = new ArrayList<>();

		if (!StringUtils.isEmpty(searchTerms)) {

			SearchTermsParser parser = new SearchTermsParser(searchTerms);

			List<PatientSearch> patientsFound = new ArrayList<>();

			if (parser.hasNhsNumber()) {
				patientsFound.addAll(patientSearchDal.searchByNhsNumber(userServiceAccessList, parser.getNhsNumber()));
				LOG.debug("After NHS number search, got results " + patientsFound.size());
			}

			if (parser.hasEmisNumber()) {
				patientsFound.addAll(patientSearchDal.searchByLocalId(userServiceAccessList, parser.getEmisNumber()));
				LOG.debug("After EMIS number search, got results " + patientsFound.size());
			}

			if (parser.hasDateOfBirth()) {
				patientsFound.addAll(patientSearchDal.searchByDateOfBirth(userServiceAccessList, parser.getDateOfBirth()));
				LOG.debug("After DoB search, got results " + patientsFound.size());
			}

			patientsFound.addAll(patientSearchDal.searchByNames(userServiceAccessList, parser.getNames()));
			LOG.debug("After name search, got results " + patientsFound.size());

			result = buildPatientResultList(sc, patientsFound);
			LOG.debug("Filtered down to " + result.size());
		}

		return buildResponse(result);
	}

	private List<UIPatient> buildPatientResultList(SecurityContext sc, List<PatientSearch> patientsFound) {
		Set<String> allowedOrgs = getUserAllowedOrganisations(sc);
		List<UIPatient> result = new ArrayList<>();
		Set<String> addedNhsNumbers = new HashSet<>();

		for (PatientSearch searchPatient : patientsFound) {

			// Exclude patients the user is not allowed to view
			//changing to handle the service ID being a UUID on the search result
			if (!allowedOrgs.contains(searchPatient.getServiceId().toString())) {
				continue;
			}
			/*if (allowedOrgs.stream().noneMatch(o -> o.equals(searchPatient.getServiceId())))
				continue;*/

			UUID serviceId = searchPatient.getServiceId();
			UUID systemId = searchPatient.getSystemId();
			UUID patientId = searchPatient.getPatientId();
			String nhsNumber = searchPatient.getNhsNumber();

			UIPatient patient;

			try {
				// Try load details
				patient = getPatient(serviceId, systemId, patientId);
			} catch (Exception e) {
				LOG.error("Error loading patient ", e);
				// If load fails, create basic patient with error message
				patient = new UIPatient()
						.setNhsNumber(nhsNumber)
						.setPatientId(new UIInternalIdentifier()
								.setServiceId(serviceId)
								.setSystemId(systemId)
								.setResourceId(patientId))
						.setName(new UIHumanName()
								.setFamilyName(searchPatient.getSurname())
								.setGivenNames(Collections.singletonList(searchPatient.getForenames())))
						.setHomeAddress(new UIAddress()
								.setLine1("Error loading patient details"))
						.setDateOfBirth(new UIDate().setDate(searchPatient.getDateOfBirth()));
			}

			patient.setId(searchPatient.getPatientId().toString());

			if (nhsNumber == null || nhsNumber.isEmpty())
				result.add(patient);
			else if (!addedNhsNumbers.contains(nhsNumber)) {
				result.add(patient);
				addedNhsNumbers.add(nhsNumber);
			}
		}

		return result;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/findPatient")
	public Response findPatient(@Context SecurityContext sc,
															@QueryParam("serviceId") UUID serviceId,
															@QueryParam("systemId") UUID systemId,
															@QueryParam("searchTerms") String searchTerms) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Find patient",
				"SearchTerm", searchTerms,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("findPatient");


		List<UIPatient> result = new ArrayList<>();

		if (!StringUtils.isEmpty(searchTerms)) {

			SearchTermsParser parser = new SearchTermsParser(searchTerms);

			List<PatientSearch> patientsFound = new ArrayList<>();

			if (parser.hasNhsNumber())
				patientsFound.addAll(patientSearchDal.searchByNhsNumber(serviceId, systemId, parser.getNhsNumber()));

			if (parser.hasEmisNumber())
				patientsFound.addAll(patientSearchDal.searchByLocalId(serviceId, systemId, parser.getEmisNumber()));

			if (parser.hasDateOfBirth())
				patientsFound.addAll(patientSearchDal.searchByDateOfBirth(serviceId, systemId, parser.getDateOfBirth()));


			patientsFound.addAll(patientSearchDal.searchByNames(serviceId, systemId, parser.getNames()));

			List<UIInternalIdentifier> uiInternalIdentifiers = patientsFound
					.stream()
					.map(t -> new UIInternalIdentifier()
							.setServiceId(t.getServiceId())
							.setSystemId(t.getSystemId())
							.setResourceId(t.getPatientId()))
					.distinct()
					.collect(Collectors.toList());

			Set<String> allowedOrgs = getUserAllowedOrganisations(sc);

			for (UIInternalIdentifier identifier : uiInternalIdentifiers) {
				if (!allowedOrgs.stream().anyMatch(o -> o.equals(identifier.getServiceId())))
					continue;

				result.add(getPatient(identifier.getServiceId(), identifier.getSystemId(), identifier.getResourceId()));
			}
		}

		return buildResponse(result);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getEpisodes")
	public Response getEpisodes(@Context SecurityContext sc,
															@QueryParam("nhsNumber") String nhsNumber,
															@QueryParam("patientId") String patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load, "Episodes");
		LOG.debug("getEpisodes");

		List<PatientSearch> patientSearches;
		// Get list of patients by NHS number
		if (nhsNumber != null && !nhsNumber.isEmpty())
			patientSearches = patientSearchDal.searchByNhsNumber(nhsNumber);
		else
			patientSearches = Collections.singletonList(patientSearchDal.searchByPatientId(UUID.fromString(patientId)));

		List<UIEpisodeOfCare> episodes = new ArrayList<>();

		Set<String> allowedOrgs = getUserAllowedOrganisations(sc);

		// Get episodes of care for each
		for (PatientSearch patientSearch : patientSearches) {
			if (!allowedOrgs.stream().anyMatch(o -> o.equals(patientSearch.getServiceId())))
				continue;

			try {
				UIPatient patient = getPatient(
						patientSearch.getServiceId(),
						patientSearch.getSystemId(),
						patientSearch.getPatientId()
				);

				List<UIEpisodeOfCare> episodesOfCare = getClinicalResources(
						patientSearch.getServiceId(),
						patientSearch.getSystemId(),
						patientSearch.getPatientId(),
						EpisodeOfCare.class,
						UIEpisodeOfCare.class
				);

				episodesOfCare.forEach(episode -> episode.setPatient(patient));

				episodes.addAll(episodesOfCare);
			} catch (Exception e) {
				LOG.error(e.getMessage(), patientSearch.getServiceId(), patientSearch.getSystemId(), patientSearch.getPatientId());
			}
		}

		return buildResponse(
				episodes.stream()
						.sorted(Comparator.comparing(f -> f.getPeriod().getStart().getDate()))
						.toArray()
		);

	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getPatient")
	public Response getPatient(@Context SecurityContext sc,
														 @QueryParam("serviceId") UUID serviceId,
														 @QueryParam("systemId") UUID systemId,
														 @QueryParam("patientId") UUID patientId) throws Exception {

		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Patient",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getPatient");

		validateIdentifiers(serviceId, systemId, patientId);

		UIPatient patient = getPatient(serviceId, systemId, patientId);
		return buildResponse(patient);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getMedicationStatements")
	public Response getMedicationStatements(@Context SecurityContext sc,
																					@QueryParam("serviceId") UUID serviceId,
																					@QueryParam("systemId") UUID systemId,
																					@QueryParam("patientId") UUID patientId) throws Exception {

		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Medication Statements",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getMedicationStatement");

		return getClinicalResourceResponse(serviceId, systemId, patientId, MedicationStatement.class, UIMedicationStatement.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getMedicationOrders")
	public Response getMedicationOrders(@Context SecurityContext sc,
																			@QueryParam("serviceId") UUID serviceId,
																			@QueryParam("systemId") UUID systemId,
																			@QueryParam("patientId") UUID patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Medication Orders",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getMedicationOrders");

		return getClinicalResourceResponse(serviceId, systemId, patientId, MedicationOrder.class, UIMedicationOrder.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getConditions")
	public Response getConditions(@Context SecurityContext sc,
																@QueryParam("serviceId") UUID serviceId,
																@QueryParam("systemId") UUID systemId,
																@QueryParam("patientId") UUID patientId) throws Exception {

		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Conditions",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getConditions");

		return getClinicalResourceResponse(serviceId, systemId, patientId, Condition.class, UICondition.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getProblems")
	public Response getProblems(@Context SecurityContext sc,
															@QueryParam("serviceId") UUID serviceId,
															@QueryParam("systemId") UUID systemId,
															@QueryParam("patientId") UUID patientId) throws Exception {

		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Problems",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getProblems");

		return getClinicalResourceResponse(serviceId, systemId, patientId, Condition.class, UIProblem.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getEncounters")
	public Response getEncounters(@Context SecurityContext sc,
																@QueryParam("serviceId") UUID serviceId,
																@QueryParam("systemId") UUID systemId,
																@QueryParam("patientId") UUID patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Encounters",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getEncounters");

		return getClinicalResourceResponse(serviceId, systemId, patientId, Encounter.class, UIEncounter.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getDiary")
	public Response getDiary(@Context SecurityContext sc,
													 @QueryParam("serviceId") UUID serviceId,
													 @QueryParam("systemId") UUID systemId,
													 @QueryParam("patientId") UUID patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Diaries",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getDiaries");

		return getClinicalResourceResponse(serviceId, systemId, patientId, ProcedureRequest.class, UIDiary.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getObservations")
	public Response getObservations(@Context SecurityContext sc,
																	@QueryParam("serviceId") UUID serviceId,
																	@QueryParam("systemId") UUID systemId,
																	@QueryParam("patientId") UUID patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Observations",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getObservations");

		return getClinicalResourceResponse(serviceId, systemId, patientId, Observation.class, UIObservation.class);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getAllergies")
	public Response getAllergies(@Context SecurityContext sc,
															 @QueryParam("serviceId") UUID serviceId,
															 @QueryParam("systemId") UUID systemId,
															 @QueryParam("patientId") UUID patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Allergies",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getAllergies");

		return getClinicalResourceResponse(serviceId, systemId, patientId, AllergyIntolerance.class, UIAllergyIntolerance.class);
	}

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getDiagnosticReports")
    public Response getDiagnosticReports(@Context SecurityContext sc,
                                 @QueryParam("serviceId") UUID serviceId,
                                 @QueryParam("systemId") UUID systemId,
                                 @QueryParam("patientId") UUID patientId) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Diagnostic Reports",
            "PatientId", patientId,
            "ServiceId", serviceId,
            "SystemId", systemId);
        LOG.debug("getDiagnosticReports");

        return getClinicalResourceResponse(serviceId, systemId, patientId, DiagnosticReport.class, UIDiagnosticReport.class);
    }

    @GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getImmunisations")
	public Response getImmunisations(@Context SecurityContext sc,
																	 @QueryParam("serviceId") UUID serviceId,
																	 @QueryParam("systemId") UUID systemId,
																	 @QueryParam("patientId") UUID patientId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Immunisations",
				"PatientId", patientId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getImmunisations");

		return getClinicalResourceResponse(serviceId, systemId, patientId, Immunization.class, UIImmunisation.class);
	}

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getFamilyHistory")
    public Response getFamilyHistory(@Context SecurityContext sc,
                                     @QueryParam("serviceId") UUID serviceId,
                                     @QueryParam("systemId") UUID systemId,
                                     @QueryParam("patientId") UUID patientId) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Family History",
            "PatientId", patientId,
            "ServiceId", serviceId,
            "SystemId", systemId);
        LOG.debug("getFamilyHistory");

        return getClinicalResourceResponse(serviceId, systemId, patientId, FamilyMemberHistory.class, UIFamilyMemberHistory.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getTestRequests")
    public Response getTestRequests(@Context SecurityContext sc,
                                     @QueryParam("serviceId") UUID serviceId,
                                     @QueryParam("systemId") UUID systemId,
                                     @QueryParam("patientId") UUID patientId) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Test Requests",
            "PatientId", patientId,
            "ServiceId", serviceId,
            "SystemId", systemId);
        LOG.debug("getTestRequests");

        return getClinicalResourceResponse(serviceId, systemId, patientId, DiagnosticOrder.class, UIDiagnosticOrder.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getSpecimens")
    public Response getSpecimens(@Context SecurityContext sc,
                                    @QueryParam("serviceId") UUID serviceId,
                                    @QueryParam("systemId") UUID systemId,
                                    @QueryParam("patientId") UUID patientId) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Specimens",
            "PatientId", patientId,
            "ServiceId", serviceId,
            "SystemId", systemId);
        LOG.debug("getSpecimens");

        return getClinicalResourceResponse(serviceId, systemId, patientId, Specimen.class, UISpecimen.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getReferralRequests")
    public Response getReferralRequests(@Context SecurityContext sc,
                                    @QueryParam("serviceId") UUID serviceId,
                                    @QueryParam("systemId") UUID systemId,
                                    @QueryParam("patientId") UUID patientId) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Referral Requests",
            "PatientId", patientId,
            "ServiceId", serviceId,
            "SystemId", systemId);
        LOG.debug("getReferralRequests");

        return getClinicalResourceResponse(serviceId, systemId, patientId, ReferralRequest.class, UIReferral.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getProcedures")
    public Response getProcedures(@Context SecurityContext sc,
                                 @QueryParam("serviceId") UUID serviceId,
                                 @QueryParam("systemId") UUID systemId,
                                 @QueryParam("patientId") UUID patientId) throws Exception {
        userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
            "Procedures",
            "PatientId", patientId,
            "ServiceId", serviceId,
            "SystemId", systemId);
        LOG.debug("getProcedures");

        return getClinicalResourceResponse(serviceId, systemId, patientId, Procedure.class, UIProcedure.class);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getPractitioner")
	public Response getPractitioner(@Context SecurityContext sc,
																	 @QueryParam("serviceId") UUID serviceId,
																	 @QueryParam("systemId") UUID systemId,
																	 @QueryParam("practitionerId") UUID practitionerId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Practitioner",
				"PractitionerId", practitionerId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getPractitioner");

		Practitioner practitioner = ResourceFetcher.getSingleResourceByService(serviceId, practitionerId, Practitioner.class);

		return buildResponse(UIPractitionerTransform.transform(practitioner));
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getOrganisation")
	public Response getOrganisation(@Context SecurityContext sc,
																	@QueryParam("serviceId") UUID serviceId,
																	@QueryParam("systemId") UUID systemId,
																	@QueryParam("organisationId") UUID organisationId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Organisation",
				"OrganisationId", organisationId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getOrganisation");

		Organization organization= ResourceFetcher.getSingleResourceByService(serviceId, organisationId, Organization.class);

		return buildResponse(UIOrganisationTransform.transform(organization));
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/getLocation")
	public Response getLocation(@Context SecurityContext sc,
																	@QueryParam("serviceId") UUID serviceId,
																	@QueryParam("systemId") UUID systemId,
																	@QueryParam("locationId") UUID locationId) throws Exception {
		userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load,
				"Location",
				"LocationId", locationId,
				"ServiceId", serviceId,
				"SystemId", systemId);
		LOG.debug("getLocation");

		Location location = ResourceFetcher.getSingleResourceByService(serviceId, locationId, Location.class);

		return buildResponse(UILocationTransform.transform(location));
	}	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



	private static void validateIdentifiers(UUID serviceId, UUID systemId, UUID patientId) {
		Validate.notNull(serviceId, "serviceId");
		Validate.notNull(systemId, "systemId");
		Validate.notNull(patientId, "patientId");
	}

	private static UIPatient getPatient(UUID serviceId, UUID systemId, UUID patientId) throws Exception {

		Patient patient = ResourceFetcher.getSingleResourceByPatient(serviceId, patientId, Patient.class);

		List<Reference> references = new ArrayList<Reference>();
		references.add(patient.getManagingOrganization());
		references.addAll(patient.getCareProvider());
		ReferencedResources referencedResources = getReferencedResources(serviceId, systemId, patientId, references);

		UIPatient uiPatient = UITransform.transformPatient(serviceId, systemId, patient, referencedResources);

		return uiPatient
				.setPatientId(new UIInternalIdentifier()
						.setServiceId(serviceId)
						.setSystemId(systemId)
						.setResourceId(patientId));
	}

	private <T extends Resource,
			U extends UIResource> Response getClinicalResourceResponse(UUID serviceId,
																																 UUID systemId,
																																 UUID patientId,
																																 Class<T> fhirResourceType,
																																 Class<U> uiResourceType) throws Exception {
		validateIdentifiers(serviceId, systemId, patientId);

		List<U> encounters = getClinicalResources(serviceId, systemId, patientId, fhirResourceType, uiResourceType);

		return buildResponse(encounters);
	}

	private <T extends Resource,
			U extends UIResource> List<U> getClinicalResources(UUID serviceId,
																												 UUID systemId,
																												 UUID patientId,
																												 Class<T> fhirResourceType,
																												 Class<U> uiResourceType) throws Exception {

		List<T> resources = ResourceFetcher.getResourceByPatient(serviceId, patientId, fhirResourceType);

		UIClinicalTransform transform = UITransform.getClinicalTransformer(uiResourceType);

		List<Reference> references = transform.getReferences(resources);
		ReferencedResources referencedResources = getReferencedResources(serviceId, systemId, patientId, references);

		return transform.transform(serviceId, systemId, resources, referencedResources);
	}

	private static ReferencedResources getReferencedResources(UUID serviceId, UUID systemId, UUID patientId, List<Reference> references) throws Exception {

		ReferencedResources referencedResources = new ReferencedResources();

		List<UUID> locationIds = getIdsOfType(references, ResourceType.Location);
		referencedResources.setLocations(ResourceFetcher.getResourcesByService(serviceId, locationIds, Location.class));

		List<UUID> organisationIds = getIdsOfType(references, ResourceType.Organization);
		referencedResources.setOrganisations(ResourceFetcher.getResourcesByService(serviceId, organisationIds, Organization.class));

		referencedResources.setMedications(ResourceFetcher.getResourceByPatient(serviceId, patientId, Medication.class));

		referencedResources.setMedicationStatements(serviceId, systemId, ResourceFetcher.getResourceByPatient(serviceId, patientId, MedicationStatement.class), referencedResources);

		referencedResources.setObservations(serviceId, systemId, ResourceFetcher.getResourceByPatient(serviceId, patientId, Observation.class), referencedResources);

		return referencedResources;
	}

	private static List<UUID> getIdsOfType(List<Reference> references, ResourceType resourceType) {
		return references
				.stream()
				.map(t -> ReferenceHelper.getReferenceId(t, resourceType))
				.filter(t -> StringUtils.isNotEmpty(t))
				.distinct()
				.map(t -> UUID.fromString(t.replace("{", "").replace("}", "")))
				.collect(Collectors.toList());
	}

	private Response buildResponse(Object entity) {
		return Response
				.ok()
				.entity(entity)
				.build();
	}

	private Set<String> getUserAllowedOrganisations(SecurityContext sc) {
		Set<String> orgs = new HashSet<>();

		AccessToken accessToken = SecurityUtils.getToken(sc);
		List<Map<String, Object>> orgGroups = (List)accessToken.getOtherClaims().getOrDefault("orgGroups", (Object)null);
		Iterator iterator = orgGroups.iterator();

		while(iterator.hasNext()) {
			Map<String, Object> orgGroup = (Map)iterator.next();
			String orgGroupOrganisationId = (String)orgGroup.getOrDefault("organisationId", (Object)null);
			if (orgGroupOrganisationId != null)
				orgs.add(orgGroupOrganisationId);
		}

		return orgs;
	}
}