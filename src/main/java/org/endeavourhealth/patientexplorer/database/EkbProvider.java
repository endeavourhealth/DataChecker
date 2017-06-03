package org.endeavourhealth.patientexplorer.database;

import org.endeavourhealth.patientexplorer.database.models.ConceptEntity;

import java.util.List;

public interface EkbProvider {
	List<ConceptEntity> search(String term, int maxResultsSize, int start);
	ConceptEntity getConcept(String code);
	List<ConceptEntity> getChildren(String code);
	List<ConceptEntity> getParents(String code);
}
