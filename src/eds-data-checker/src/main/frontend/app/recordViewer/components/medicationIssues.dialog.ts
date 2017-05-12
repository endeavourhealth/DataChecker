import {Component, Input} from "@angular/core";
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UIMedicationOrder} from "../models/resources/clinical/UIMedicationOrder";

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
    template: require('./medicationIssues.html')
})
export class MedicationIssuesDialog {
	@Input() issues: UIMedicationOrder[];

	public static open(modalService: NgbModal, issues: UIMedicationOrder[]) {
		const modalRef = modalService.open(MedicationIssuesDialog, {backdrop: "static", size: 'lg'});
		modalRef.componentInstance.issues = issues;
		return modalRef;
	}

	constructor(protected activeModal: NgbActiveModal) {

	}

	close() {
		this.activeModal.close(null);
		console.log('Cancel Pressed');
	}
}
