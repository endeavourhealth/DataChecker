import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UIPatient} from "../models/resources/admin/UIPatient";
import {UICodeableConcept} from "../models/types/UICodeableConcept";
import {UIAddress} from "../models/types/UIAddress";
import {UIPractitioner} from "../models/resources/admin/UIPractitioner";
import {UIOrganisation} from "../models/resources/admin/UIOrganisation";

// enum KeyCodes {
// 		ReturnKey = 13,
// 		Escape = 27,
// 		LeftArrow = 37,
// 		UpArrow = 38,
// 		RightArrow = 39,
// 		DownArrow = 40
// }

@Component({
    selector: 'ngbd-modal-content',
    template: require('./demographics.html')
})
export class DemographicsDialog implements OnInit{
	@Input() person: UIPatient;
	usualGP : UIPractitioner;
	usualGPPractice : UIOrganisation;

	public static open(modalService: NgbModal, person: UIPatient) {
		const modalRef = modalService.open(DemographicsDialog, {backdrop: "static", size: 'lg'});
		modalRef.componentInstance.person = person;
		return modalRef;
	}

	constructor(protected activeModal: NgbActiveModal) {
	}

	ngOnInit() {
		// When patient is set, determine usual gp and org
		this.usualGP = null;
		this.usualGPPractice = null;
		if (!this.person)
			return;

		if (this.person.carerPractitioners && this.person.carerPractitioners.length > 0)
			this.usualGP = this.person.carerPractitioners[0];

		if (this.person.carerOrganisations && this.person.carerOrganisations.length > 0)
			this.usualGPPractice = this.person.carerOrganisations[0];
	}

	hasCarers() : boolean {
		if (this.usualGP || this.usualGPPractice)
			return true;

		return false;
	}

	formatRelationships(relationships: UICodeableConcept[]) {
		let result: string = '';
		for (let relationship of relationships) {
			if (result != '')
				result += ', ';
			result += relationship.text;
		}
		return result;
	}

	getPractitionerActiveText(isActive: boolean) {
		if (isActive)
			return 'Active';

		return 'Inactive';
	}

	ok() {
		this.activeModal.close(null);
	}
}
