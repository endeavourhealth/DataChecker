import {UIResource} from "../UIResource";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UIEncounter} from "./UIEncounter";
import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIDate} from "../../types/UIDate";
import {UIInvestigation} from "./UIInvestigation";
import {UIObservationRelation} from "./UIObservationRelation";
import {UIQuantity} from "../../types/UIQuantity";
import {UISimpleEvent} from "../UISimpleEvent";
import {UITest} from "./UITest";

export class UIDiagnosticOrder extends UIResource implements UITest {
	effectiveDate : UIDate;
	recordingPractitioner : UIInternalIdentifier;
	encounter : UIEncounter;
	code : UICodeableConcept;
	events : UISimpleEvent[];
	status : UISimpleEvent;
}
