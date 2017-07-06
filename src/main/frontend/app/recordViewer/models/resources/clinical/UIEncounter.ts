import {UIPeriod} from "../../types/UIPeriod";
import {UIResource} from "../UIResource";
import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIDate} from "../../types/UIDate";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";

export class UIEncounter extends UIResource {
    status: string;
    class_ : string;
    types : UICodeableConcept[];
    performedBy: UIInternalIdentifier;
    enteredBy: UIInternalIdentifier;
    reason: UICodeableConcept[];
    period: UIPeriod;
    serviceProvider : UIInternalIdentifier;
    encounterSource : UICodeableConcept;
    location : UIInternalIdentifier;
    referredBy : UIInternalIdentifier;
    messageType : UICodeableConcept;
    episodeOfCare : string;
    admitted : UIDate;
    discharged : UIDate;
    dischargeLocation : UIInternalIdentifier;
    dischargeDisposition : UICodeableConcept;
}
