package org.endeavourhealth.patientexplorer.database;

import com.fasterxml.jackson.databind.JsonNode;
import org.endeavourhealth.common.config.ConfigManager;
import org.endeavourhealth.patientexplorer.database.models.FieldMetaEntity;
import org.endeavourhealth.patientexplorer.database.models.TableMetaEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SqlEditorJdbcProvider implements SqlEditorProvider {
	private static final Logger LOG = LoggerFactory.getLogger(SqlEditorJdbcProvider.class);
	private static Connection _conn = null;

	@Override
	public List<List<String>> runQuery(String sql) throws Exception {
		Connection conn = getConnection();
		PreparedStatement statement = conn.prepareStatement(sql);

		return SqlUtils.getStatementResultsAsCSV(statement);
	}

	@Override
	public List<TableMetaEntity> getTableData() throws Exception {
		LOG.debug("Fetching enterprise-lite table data");
		List<TableMetaEntity> tables = new ArrayList<>();

		Connection conn = getConnection();
		DatabaseMetaData meta = conn.getMetaData();

		ResultSet tableResultSet = meta.getTables(null, "public", "%", new String[]{"TABLE"});
		buildTableFieldData(tables, meta, tableResultSet);
		tableResultSet.close();

		tableResultSet = meta.getTables(null, "workspace", "%", new String[]{"TABLE"});
		buildTableFieldData(tables, meta, tableResultSet);
		tableResultSet.close();

		return tables;
	}

	private void buildTableFieldData(List<TableMetaEntity> tables, DatabaseMetaData meta, ResultSet tableResultSet) throws SQLException {
		while (tableResultSet.next()) {
			String schemaName = tableResultSet.getString(2);
			String tableName = tableResultSet.getString(3);

			// Exclude enterprise lite reporting tables
			if (!tableName.startsWith("rep_")) {
				TableMetaEntity table = new TableMetaEntity();
				table.setName(schemaName + "." + tableName);

				ResultSet fieldResultSet = meta.getColumns(null, schemaName, tableName, "%");
				while (fieldResultSet.next()) {
					FieldMetaEntity field = new FieldMetaEntity();
					field.setName(fieldResultSet.getString(4));
					table.getFields().add(field);
				}
				tables.add(table);
			}
		}
	}

	private static Connection getConnection() throws SQLException, IOException {
		if (_conn == null) {
			JsonNode config = ConfigManager.getConfigurationAsJson("enterprise-lite");
			String url = config.get("url").asText();
			String username = config.get("ui-username").asText();
			String password = config.get("ui-password").asText();

			_conn = DriverManager.getConnection(url, username, password);
		}
		return _conn;
	}
}
