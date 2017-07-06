import {UIResource} from "../UIResource";
import {UIMedicationStatement} from "./UIMedicationStatement";
import {UIQuantity} from "../../types/UIQuantity";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";

export class UIMedicationOrder extends UIResource {
	medicationStatement : UIMedicationStatement;
	date : Date;
	prescriber : UIInternalIdentifier;
	quantity : UIQuantity;
	expectedDuration : String;
}
