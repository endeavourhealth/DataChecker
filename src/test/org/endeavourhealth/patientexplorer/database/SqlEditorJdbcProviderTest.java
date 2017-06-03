package org.endeavourhealth.patientexplorer.database;

import org.endeavourhealth.common.config.ConfigManager;
import org.junit.Test;

public class SqlEditorJdbcProviderTest {
	@Test
	public void getTableData() throws Exception {
		ConfigManager.Initialize("eds-patient-explorer");
		SqlEditorProvider prov = new SqlEditorJdbcProvider();
		prov.getTableData();
	}

}