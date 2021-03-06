package org.endeavourhealth.patientexplorer.endpoints;

import org.endeavourhealth.core.database.dal.DalProvider;
import org.endeavourhealth.core.database.dal.audit.UserAuditDalI;
import org.endeavourhealth.common.security.SecurityUtils;
import org.endeavourhealth.core.database.dal.audit.models.AuditAction;
import org.endeavourhealth.core.database.dal.audit.models.AuditModule;
import org.endeavourhealth.coreui.endpoints.AbstractEndpoint;
import org.endeavourhealth.patientexplorer.database.SqlEditorJdbcProvider;
import org.endeavourhealth.patientexplorer.database.SqlEditorProvider;
import org.endeavourhealth.patientexplorer.database.models.TableMetaEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.util.List;
import java.util.UUID;

/**
 * REST API for count reports.  Provides all methods on the path "/countReport"
 */
@Path("/sqlEditor")
public final class SqlEditorEndpoint extends AbstractEndpoint {

    private static final Logger LOG = LoggerFactory.getLogger(SqlEditorEndpoint.class);
    private static final UserAuditDalI userAudit = DalProvider.factoryUserAuditDal(AuditModule.EdsPatientExplorerModule.SqlEditor);
    private static final SqlEditorProvider SQL_EDITOR_JDBC_PROVIDER = new SqlEditorJdbcProvider();

    /**
     * Get a list of tables and their field names (excluding enterprise report tables)
     * @param sc                Security context (provided)
     * @return  List of TableMetaEntities
     * @throws Exception
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getTableData")
    public Response getTableData(@Context SecurityContext sc) throws Exception {
        try {
            UUID userUuid = SecurityUtils.getCurrentUserId(sc);
            userAudit.save(userUuid, getOrganisationUuidFromToken(sc), AuditAction.Load, "Table Data");
            LOG.debug("getTableData");

            List<TableMetaEntity> ret = SQL_EDITOR_JDBC_PROVIDER.getTableData();

            return Response
                .ok(ret, MediaType.APPLICATION_JSON_TYPE)
                .build();
        } catch (Exception e) {
            LOG.error(e.getMessage());
            throw e;
        }
    }

    /**
     * Execute a sql statement and return the results (as CSV)
     * @param sc                Security context (provided)
     * @return  Query results as CSV (with headers)
     * @throws Exception
     */
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("runQuery")
    public Response runQuery(@Context SecurityContext sc, String sql) throws Exception {
        try {
            UUID userUuid = SecurityUtils.getCurrentUserId(sc);
            userAudit.save(userUuid, getOrganisationUuidFromToken(sc), AuditAction.Run, "Run Query",
                "SQL", sql);
            LOG.debug("runQuery");

            List<List<String>> ret = SQL_EDITOR_JDBC_PROVIDER.runQuery(sql);

            return Response
                .ok(ret, MediaType.APPLICATION_JSON_TYPE)
                .build();
        } catch (Exception e) {
            LOG.error(e.getMessage());
            return Response
                .status(Response.Status.INTERNAL_SERVER_ERROR)
                .type("text/plain")
                .entity(e.getMessage())
                .build();
        }
    }
}