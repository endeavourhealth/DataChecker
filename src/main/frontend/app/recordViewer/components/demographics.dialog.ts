import {Component, Input} from "@angular/core";
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UIPatient} from "../models/resources/admin/UIPatient";
import {UICodeableConcept} from "../models/types/UICodeableConcept";
import {UIAddress} from "../models/types/UIAddress";

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
export class DemographicsDialog {
	@Input() person: UIPatient;

	public static open(modalService: NgbModal, person: UIPatient) {
		const modalRef = modalService.open(DemographicsDialog, {backdrop: "static", size: 'lg'});
		modalRef.componentInstance.person = person;
		return modalRef;
	}

	constructor(protected activeModal: NgbActiveModal) {

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

	hasCarers() {
		if (this.person.carerOrganisations && this.person.carerOrganisations.length > 0)
			return true;

		if (this.person.carerPractitioners && this.person.carerPractitioners.length > 0)
			return true;

		return false;
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
