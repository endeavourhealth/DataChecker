import {UIAddress} from "../../types/UIAddress";
import {UIHumanName} from "../../types/UIHumanName";
import {UIDate} from "../../types/UIDate";
import {UIResource} from "../UIResource";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";
import {UICodeableConcept} from "../../types/UICodeableConcept";
import {UIContact} from "./UIContact";
import {UIContactPoint} from "./UIContactPoint";
import {UIOrganisation} from "./UIOrganisation";
import {UIPractitioner} from "./UIPractitioner";

export class UIPerson extends UIResource {
	nhsNumber: string;
	name: UIHumanName;
	dateOfBirth: UIDate;
	dateOfDeath: UIDate;
	gender: string;
	homeAddress: UIAddress;
	ethnicity : UICodeableConcept;
	contacts : UIContact[];
	telecoms : UIContactPoint[];
	localPatientIdentifier : string;
	managingOrganisation : UIOrganisation;
	maritalStatus : UICodeableConcept;
	language : UICodeableConcept;
	religion : UICodeableConcept;
	carerOrganisations : UIOrganisation[];
	carerPractitioners : UIPractitioner[];
}
