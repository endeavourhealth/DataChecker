package org.endeavourhealth.patientexplorer.database;

import org.endeavourhealth.core.xml.QueryDocument.LibraryItem;
import org.endeavourhealth.patientexplorer.database.models.ConceptEntity;
import org.endeavourhealth.patientexplorer.models.JsonPractitioner;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CountReportProvider {
	LibraryItem runReport(UUID userUuid, UUID reportUuid, Map<String, String> reportParams) throws Exception;

	List<List<String>> getNHSExport(UUID userUuid, UUID reportUuid) throws Exception;

	List<List<String>> getDataExport(UUID userUuid, UUID reportUuid) throws Exception;

	List<ConceptEntity> getEncounterTypes() throws Exception;

	List<ConceptEntity> getReferralTypes() throws Exception;

	List<ConceptEntity> getReferralPriorities() throws Exception;

	List<JsonPractitioner> searchPractitioner(String searchData, UUID organisationUuid) throws Exception;
}