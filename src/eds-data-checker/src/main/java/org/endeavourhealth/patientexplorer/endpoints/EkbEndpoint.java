package org.endeavourhealth.patientexplorer.endpoints;

import org.endeavourhealth.core.data.audit.UserAuditRepository;
import org.endeavourhealth.core.data.audit.models.AuditModule;
import org.endeavourhealth.coreui.endpoints.AbstractEndpoint;
import org.endeavourhealth.patientexplorer.database.EkbPostgresProvider;
import org.endeavourhealth.patientexplorer.database.EkbProvider;
import org.endeavourhealth.patientexplorer.database.models.ConceptEntity;
import org.endeavourhealth.patientexplorer.models.JsonCodeSetValue;
import org.endeavourhealth.patientexplorer.models.JsonConcept;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.util.List;
import java.util.stream.Collectors;

@Path("/ekb")
public final class EkbEndpoint extends AbstractEndpoint {
	private static final Logger LOG = LoggerFactory.getLogger(EkbEndpoint.class);
	private UserAuditRepository userAudit = new UserAuditRepository(AuditModule.EdsUiModule.Ekb);
	private EkbProvider ekbProvider = EkbPostgresProvider.INSTANCE;


	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/search/sct")
	public Response search(@Context SecurityContext sc, @QueryParam("term") String term, @QueryParam("maxResultsSize") int maxResultsSize, @QueryParam("start") int start) throws Exception {
		super.setLogbackMarkers(sc);
		// userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load);

		List<ConceptEntity> concepts = ekbProvider.search(term, maxResultsSize, start);
		List<JsonCodeSetValue> ret = concepts.stream().map(JsonCodeSetValue::new).collect(Collectors.toList());

		clearLogbackMarkers();

		return Response
				.ok()
				.entity(ret)
				.build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/concepts/{code}")
	public Response getConcept(@Context SecurityContext sc, @PathParam("code") String code) throws Exception {
		super.setLogbackMarkers(sc);
		// userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load);

		ConceptEntity concept = ekbProvider.getConcept(code);
		JsonConcept ret = new JsonConcept(concept);

		clearLogbackMarkers();

		return Response
				.ok()
				.entity(ret)
				.build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/hierarchy/{code}/childHierarchy")
	public Response getChildren(@Context SecurityContext sc, @PathParam("code") String code) throws Exception {
		super.setLogbackMarkers(sc);
		// userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load);

		List<ConceptEntity> concepts = ekbProvider.getChildren(code);
		List<JsonCodeSetValue> ret = concepts.stream().map(JsonCodeSetValue::new).collect(Collectors.toList());

		clearLogbackMarkers();

		return Response
				.ok()
				.entity(ret)
				.build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/hierarchy/{code}/parentHierarchy")
	public Response getParents(@Context SecurityContext sc, @PathParam("code") String code) throws Exception {
		super.setLogbackMarkers(sc);
		// userAudit.save(SecurityUtils.getCurrentUserId(sc), getOrganisationUuidFromToken(sc), AuditAction.Load);

		List<ConceptEntity> concepts = ekbProvider.getParents(code);
		List<JsonCodeSetValue> ret = concepts.stream().map(JsonCodeSetValue::new).collect(Collectors.toList());

		clearLogbackMarkers();

		return Response
				.ok()
				.entity(ret)
				.build();
	}}
