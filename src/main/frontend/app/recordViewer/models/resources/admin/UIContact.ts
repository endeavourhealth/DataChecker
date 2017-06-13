import {UIAddress} from "../../types/UIAddress";
import {UIHumanName} from "../../types/UIHumanName";
import {UIDate} from "../../types/UIDate";
import {UIResource} from "../UIResource";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UICodeableConcept} from "../../types/UICodeableConcept";

export class UIContact extends UIResource {
	name: UIHumanName;
	dateOfBirth: UIDate;
	homeAddress: UIAddress;
	relationships : UICodeableConcept;
}
