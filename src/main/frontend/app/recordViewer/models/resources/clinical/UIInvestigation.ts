import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIDate} from "../../types/UIDate";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UIEncounter} from "./UIEncounter";
import {UIObservationRelation} from "./UIObservationRelation";
import {UIQuantity} from "../../types/UIQuantity";

export interface UIInvestigation {
	id : string;
	code : UICodeableConcept;
	recordingPractitioner : UIInternalIdentifier;
	effectiveDate : UIDate;
	encounter : UIEncounter;
	related : UIObservationRelation[];
	value? : UIQuantity;
	status : string;
}