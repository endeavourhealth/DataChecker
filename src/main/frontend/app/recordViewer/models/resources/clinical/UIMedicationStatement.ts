import {UIResource} from "../UIResource";
import {UIDate} from "../../types/UIDate";
import {UIMedication} from "./UIMedication";
import {UIQuantity} from "../../types/UIQuantity";
import {UICode} from "../../types/UICode";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";

export class UIMedicationStatement extends UIResource {
    dateAuthorised: UIDate;
    prescriber: UIInternalIdentifier;
    medication : UIMedication;
    dosage: string;
    status: string;
    mostRecentIssue: UIDate;
    authorisationType : UICode;
    authorisedQuantity: UIQuantity;
    repeatsAllowed: number;
    repeatsIssued: number;
}
