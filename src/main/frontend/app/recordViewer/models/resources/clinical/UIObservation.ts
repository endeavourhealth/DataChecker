import {UIClinicalResource} from "./UIClinicalResource";
import {UIEncounter} from "./UIEncounter";
import {UIQuantity} from "../../types/UIQuantity";
import {UIObservationRelation} from "./UIObservationRelation";
import {UIInvestigation} from "./UIInvestigation";
import {UIDate} from "../../types/UIDate";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UICodeableConcept} from "../../types/UICodeableConcept";

export class UIObservation extends UIClinicalResource implements UIInvestigation {
    status: string;
    value: UIQuantity;
    referenceRangeLow: UIQuantity;
    referenceRangeHigh: UIQuantity;
    encounter: UIEncounter;
    related : UIObservationRelation[];
}
