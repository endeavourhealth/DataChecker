package org.endeavourhealth.patientexplorer.models;

import org.endeavourhealth.core.database.dal.coding.models.Concept;

public final class JsonConcept {
    private String id;
    private String preferredTerm;

    public JsonConcept(Concept conceptEntity) {
        this.id = conceptEntity.getCode();
        this.preferredTerm = conceptEntity.getDisplay();
    }

    /**
     * gets/sets
     */


    public String getPreferredTerm() {
        return preferredTerm;
    }

    public void setPreferredTerm(String preferredTerm) {
        this.preferredTerm = preferredTerm;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
