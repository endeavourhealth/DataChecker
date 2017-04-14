package org.endeavourhealth.patientexplorer.database;

import org.endeavourhealth.patientexplorer.database.models.TableMetaEntity;

import java.util.List;

public interface SqlEditorProvider {
	List<List<String>> runQuery(String sql) throws Exception;

	List<TableMetaEntity> getTableData() throws Exception;
}
