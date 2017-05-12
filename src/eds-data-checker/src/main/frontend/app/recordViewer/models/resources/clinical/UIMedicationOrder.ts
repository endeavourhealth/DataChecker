import {UIResource} from "../UIResource";
import {UIMedicationStatement} from "./UIMedicationStatement";
import {UIPractitioner} from "../admin/UIPractitioner";
import {UIQuantity} from "../../types/UIQuantity";

export class UIMedicationOrder extends UIResource {
	medicationStatement : UIMedicationStatement;
	date : Date;
	prescriber : UIPractitioner;
	quantity : UIQuantity;
	expectedDuration : String;
}
