import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIDate} from "../../types/UIDate";
import {UISimpleEvent} from "../UISimpleEvent";

export interface UITest  {
	effectiveDate : UIDate;
	recordingPractitioner : UIInternalIdentifier;
	code : UICodeableConcept;
	status : UISimpleEvent;
}
