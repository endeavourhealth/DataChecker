package org.endeavourhealth.patientexplorer.database;

import com.fasterxml.jackson.databind.JsonNode;
import org.endeavourhealth.common.config.ConfigManager;
import org.endeavourhealth.core.database.dal.DalProvider;
import org.endeavourhealth.core.database.dal.admin.LibraryDalI;
import org.endeavourhealth.core.database.dal.admin.ServiceDalI;
import org.endeavourhealth.core.database.dal.admin.models.ActiveItem;
import org.endeavourhealth.core.database.dal.admin.models.Item;
import org.endeavourhealth.core.database.dal.admin.models.Service;
import org.endeavourhealth.core.database.dal.reference.models.Concept;
import org.endeavourhealth.core.xml.QueryDocument.LibraryItem;
import org.endeavourhealth.core.xml.QueryDocument.QueryDocument;
import org.endeavourhealth.core.xml.QueryDocumentSerializer;
import org.endeavourhealth.patientexplorer.models.JsonPractitioner;
import org.postgresql.util.PSQLException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.datatype.DatatypeFactory;
import java.io.IOException;
import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

public class CountReportJdbcProvider implements CountReportProvider {
	private static final Logger LOG = LoggerFactory.getLogger(CountReportJdbcProvider.class);
	private static Connection _conn = null;

	@Override
	public LibraryItem runReport(UUID userUuid, UUID reportUuid, Map<String, String> reportParams) throws Exception {
		ServiceDalI svcRepo = DalProvider.factoryServiceDal();
		Service svc = svcRepo.getById(UUID.fromString(reportParams.get("OrganisationUuid")));
		String odsCode = svc.getLocalId();

		LOG.trace("GettingLibraryItem for UUID {}", reportUuid);
		LibraryDalI repository = DalProvider.factoryLibraryDal();
		ActiveItem activeItem = repository.getActiveItemByItemId(reportUuid);
		Item item = repository.getItemByKey(activeItem.getItemId(), activeItem.getAuditId());
		LibraryItem countReport = QueryDocumentSerializer.readLibraryItemFromXml(item.getXmlContent());

		// Parse the run date from the report params
		java.util.Date rundate = new SimpleDateFormat("dd/MM/yyyy").parse(reportParams.get("RunDate").replace("'",""));
		GregorianCalendar c = new GregorianCalendar();
		c.setTime(rundate);
		countReport.getCountReport().setLastRun(DatatypeFactory.newInstance().newXMLGregorianCalendar(c));

		countReport.getCountReport().setStatus("Running...");
		saveCountReport(repository, item, countReport);
		try {
			Connection conn = getConnection();
			PreparedStatement statement = null;

			// Clear old results
			String tablename = getTableName(userUuid, reportUuid);
			dropReportTable(conn, tablename);

			// Build query
			createReportTable(reportParams, odsCode, countReport, conn, tablename);

			int rowCount = getReportItemCount(countReport, conn, statement, tablename);

			// Update library item
			countReport.getCountReport().setCount(rowCount);
			countReport.getCountReport().setStatus("Completed");
			saveCountReport(repository, item, countReport);

		} catch (SQLException e) {
			LOG.error("Error running report", e);
			countReport.getCountReport().setStatus("Error");
			saveCountReport(repository, item, countReport);
			throw e;
		}

		return countReport;
	}

	private int getReportItemCount(LibraryItem countReport, Connection conn, PreparedStatement statement, String tablename) throws SQLException {
		try {
			// Get results count
			LOG.debug("Getting result count");
			statement = conn.prepareStatement("SELECT COUNT(*) FROM " + tablename);
			ResultSet resultSet = statement.executeQuery();
			resultSet.next();
			int rowCount = resultSet.getInt(1);
			LOG.debug("Rows Affected : " + rowCount);
			return rowCount;
		} finally {
			statement.close();
		}
	}

	private void  createReportTable(Map<String, String> reportParams, String odsCode, LibraryItem countReport, Connection conn, String tablename) throws Exception {
		String query = "SELECT "+ reportParams.get("RunDate") +" as run_date, p.id as internal_patient_id, p.nhs_number\n";

		if (!countReport.getCountReport().getFields().equals(""))
			query += "," + countReport.getCountReport().getFields();

		query += " FROM patient p JOIN episode_of_care eoc ON eoc.patient_id = p.id \n";
		query += " JOIN organization org ON org.id = p.organization_id \n";
		if (countReport.getCountReport().getTables() != null)
			query += countReport.getCountReport().getTables();

		query += " WHERE eoc.date_registered < :RunDate::date \nAND (eoc.date_registered_end IS NULL OR eoc.date_registered_end >= :RunDate::date) \n";
		query += " AND (p.date_of_death IS NULL OR p.date_of_death >= COALESCE(:DateOfDeath::date, p.date_of_death))\n";
		query += " AND org.ods_code = '" + odsCode + "' \n";
		if (countReport.getCountReport().getQuery() != null)
			query += countReport.getCountReport().getQuery();

		query = "CREATE TABLE " + tablename + " AS \n" + query;
		PreparedStatement statement = null;
		try {
			statement = setParameters(conn, reportParams, query);

			statement.execute();
		} finally {
			if (statement != null)
				statement.close();
		}
	}

	private PreparedStatement setParameters(Connection conn, Map<String, String> reportParams, String query) throws SQLException, ParseException {
		// Build ordered list of param positions
		TreeMap<Integer, String> params = new TreeMap<>();

		for (String paramName : reportParams.keySet()) {
			int pos = query.indexOf(":" + paramName);
			while (pos > -1) {
				params.put(pos, paramName);
				pos = query.indexOf(":" + paramName, pos+1);
			}
		}

		// Replace parameter names
		for (String paramName : reportParams.keySet()) {
			query = query.replace(":" + paramName, "?");
		}

		LOG.debug("Preparing SQL " + query);

		// Prepare statement
		PreparedStatement statement = conn.prepareStatement(query);

		// Set parameters
		int index = 1;
		for (Map.Entry<Integer, String> param : params.entrySet()) {
			String value = reportParams.get(param.getValue());
			if ("null".equals(value))
				value = null;

			switch (param.getValue()) {
				case "RunDate":
				case "EffectiveDate":
				case "DobMin":
				case "DobMax":
					if (value == null)
						statement.setNull(index++, Types.DATE);
					else
						statement.setDate(index++, SqlUtils.sqlDateFromString(value));
					break;
				case "SnomedCode":
				case "EncounterType":
				case "ReferralSnomedCode":
					if (value == null)
						statement.setNull(index++, Types.INTEGER);
					else
						statement.setLong(index++, Long.parseLong(value));
					break;
				case "ValueMin":
				case "ValueMax":
					if (value == null)
						statement.setNull(index++, Types.DOUBLE);
					else
						statement.setDouble(index++, Double.parseDouble(value));
					break;
				case "RegistrationType":
				case "Gender":
				case "AuthType":
				case "ReferralType":
				case "ReferralPriority":
					if (value == null)
						statement.setNull(index++, Types.SMALLINT);
					else
						statement.setByte(index++, Byte.parseByte(value));
					break;
				case "Practitioner":
					if (value == null)
						statement.setNull(index++, Types.INTEGER);
					else
						statement.setInt(index++, Integer.parseInt(value));
					break;
				case "OriginalCode":
					if (value == null)
						statement.setNull(index++, Types.VARCHAR);
					else
						statement.setString(index++, value);
					break;
				default:
					if (value == null)
						statement.setNull(index++, Types.VARCHAR);
					else
						statement.setString(index++, value);
			}
		}

		return statement;
	}

	private void dropReportTable(Connection conn, String tablename) throws SQLException {
		LOG.debug("Clearing table " + tablename);
		PreparedStatement statement = null;
		try {
			statement = conn.prepareStatement("drop table if exists " + tablename);
			statement.execute();
		} catch (PSQLException p) {
			LOG.debug(p.getMessage());
			throw p;
		} finally {
			if (statement != null)
				statement.close();
		}
	}

	@Override
	public List<List<String>> getNHSExport(UUID userUuid, UUID reportUuid) throws Exception {
		return getResults(userUuid, reportUuid, "run_date, internal_patient_id, nhs_number");
	}

	@Override
	public List<List<String>> getDataExport(UUID userUuid, UUID reportUuid) throws Exception {
		return getResults(userUuid, reportUuid, "*");
	}

	private List<List<String>> getResults(UUID userUuid, UUID reportUuid, String fields) throws Exception {
		String tablename = getTableName(userUuid, reportUuid);

		Connection conn = getConnection();
		PreparedStatement statement = conn.prepareStatement("SELECT "+fields+" FROM " + tablename);

		return SqlUtils.getStatementResultsAsCSV(statement);
	}

	@Override
	public List<Concept> getEncounterTypes() throws Exception {
		Connection conn = getConnection();

		PreparedStatement statement = conn.prepareStatement("SELECT DISTINCT snomed_concept_id, original_term FROM encounter");
		try {
			ResultSet resultSet = statement.executeQuery();
			return buildConceptEntityList(resultSet);
		} finally {
			statement.close();
		}
	}

	@Override
	public List<Concept> getReferralTypes() throws Exception {
		Connection conn = getConnection();

		PreparedStatement statement = conn.prepareStatement("SELECT id, value FROM referral_request_type");
		try {
			ResultSet resultSet = statement.executeQuery();
			return buildConceptEntityList(resultSet);
		} finally {
			statement.close();
		}
	}

	@Override
	public List<Concept> getReferralPriorities() throws Exception {
		Connection conn = getConnection();

		PreparedStatement statement = conn.prepareStatement("SELECT id, value FROM referral_request_priority");
		try {
			ResultSet resultSet = statement.executeQuery();
			return buildConceptEntityList(resultSet);
		} finally {
			statement.close();
		}
	}

	@Override
	public List<JsonPractitioner> searchPractitioner(String searchData, UUID organisationUuid) throws Exception {
		ServiceDalI svcRepo = DalProvider.factoryServiceDal();
		Service svc = svcRepo.getById(organisationUuid);
		String odsCode = svc.getLocalId();

		List<JsonPractitioner> result = new ArrayList<>();
		Connection conn = getConnection();

		PreparedStatement statement = conn.prepareStatement("SELECT p.id, p.name FROM practitioner p JOIN organization o ON o.id = p.organization_id WHERE o.ods_code = ? AND p.name LIKE ?");

		try {
			statement.setString(1, odsCode);
			statement.setString(2, "%" + searchData + "%");
			ResultSet resultSet = statement.executeQuery();

			while (resultSet.next()) {
				JsonPractitioner practitioner = new JsonPractitioner();
				practitioner.setId(resultSet.getInt(1));
				practitioner.setName(resultSet.getString(2));
				result.add(practitioner);
			}
		} finally {
			statement.close();
		}

		return result;
	}

	private List<Concept> buildConceptEntityList(ResultSet resultSet) throws SQLException {
		List<Concept> result = new ArrayList<>();

		while (resultSet.next()) {
			Concept concept = new Concept();
			concept.setCode(resultSet.getString(1));
			if (resultSet.getString(2) == null)
				concept.setDisplay("[NULL]");
			else
				concept.setDisplay(resultSet.getString(2));
			result.add(concept);
		}

		return result;
	}

	private void saveCountReport(LibraryDalI repository, Item item, LibraryItem libraryItem) throws Exception {
		LOG.debug("Saving count report " + libraryItem.getUuid());
		QueryDocument doc = new QueryDocument();
		doc.getLibraryItem().add(libraryItem);
		item.setXmlContent(QueryDocumentSerializer.writeToXml(doc));
		List<Object> toSave = new ArrayList<>();
		toSave.add(item);
		repository.save(toSave);
	}

	private String getTableName(UUID userUuid, UUID reportUuid) {
		return "workspace.rep_" + userUuid.toString().replace("-","") + "_" + reportUuid.toString().replace("-","");
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
