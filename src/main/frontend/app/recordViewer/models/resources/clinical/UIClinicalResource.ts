import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIDate} from "../../types/UIDate";
import {UIResource} from "../UIResource";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";

export class UIClinicalResource extends UIResource {
    code: UICodeableConcept;
    effectivePractitioner: UIInternalIdentifier;
    effectiveDate: UIDate;
    recordingPractitioner: UIInternalIdentifier;
    recordedDate: UIDate;
    notes: String;
}