import {UIAddress} from "../../types/UIAddress";
import {UIHumanName} from "../../types/UIHumanName";
import {UIDate} from "../../types/UIDate";
import {UIResource} from "../UIResource";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UICodeableConcept} from "../../types/UICodeableConcept";

export class UIContactPoint extends UIResource {
	system : string;
	use : string;
	value : string;
}
