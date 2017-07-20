import {UIResource} from "../UIResource";
import {UIMedicationStatement} from "./UIMedicationStatement";
import {UIQuantity} from "../../types/UIQuantity";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UIDate} from "../../types/UIDate";

export class UIMedicationOrder extends UIResource {
	medicationStatement : UIMedicationStatement;
	date : UIDate;
	prescriber : UIInternalIdentifier;
	quantity : UIQuantity;
	expectedDuration : String;
}
