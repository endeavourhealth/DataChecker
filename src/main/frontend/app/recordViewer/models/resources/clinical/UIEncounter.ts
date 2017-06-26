import {UIPractitioner} from "../admin/UIPractitioner";
import {UICode} from "../../types/UICode";
import {UIPeriod} from "../../types/UIPeriod";
import {UIResource} from "../UIResource";
import {UIOrganisation} from "../admin/UIOrganisation";
import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UILocation} from "../admin/UILocation";
import {UIDate} from "../../types/UIDate";

export class UIEncounter extends UIResource {
    status: string;
    class_ : string;
    types : UICodeableConcept[];
    performedBy: UIPractitioner;
    enteredBy: UIPractitioner;
    reason: UICodeableConcept[];
    period: UIPeriod;
    serviceProvider : UIOrganisation;
    encounterSource : UICodeableConcept;
    location : UILocation;
    referredBy : UIPractitioner;
    messageType : UICodeableConcept;
    episodeOfCare : string;
    admitted : UIPeriod;
    discharged : UIPeriod;
    dischargeLocation : UILocation;
    dischargeDisposition : UICodeableConcept;
}
