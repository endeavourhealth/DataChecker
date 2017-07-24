import {UIResource} from "../UIResource";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIDate} from "../../types/UIDate";

export class UIReferral extends UIResource {
	effectiveDate : UIDate;
	recordingPractitioner : UIInternalIdentifier;
	code : UICodeableConcept;
}
