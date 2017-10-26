package org.endeavourhealth.patientexplorer.models;

import org.endeavourhealth.core.database.dal.coding.models.Concept;

public final class JsonCodeSetValue {
    private String code;

    public JsonCodeSetValue(Concept conceptEntity) {
        this.code =conceptEntity.getCode();
    }

    /**
     * gets/sets
     */

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
