import {Component, Input} from "@angular/core";
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UIMedicationOrder} from "../models/resources/clinical/UIMedicationOrder";
import {AdminCacheBaseComponent} from "./adminCacheBaseComponent";
import {AdminCacheService} from "../adminCache.service";

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
export class MedicationIssuesDialog extends AdminCacheBaseComponent {
	@Input() issues: UIMedicationOrder[];

	public static open(modalService: NgbModal, issues: UIMedicationOrder[]) {
		const modalRef = modalService.open(MedicationIssuesDialog, {backdrop: "static", size: 'lg'});
		modalRef.componentInstance.issues = issues;
		return modalRef;
	}

	constructor(adminCache : AdminCacheService, protected activeModal: NgbActiveModal) {
		super(adminCache);
	}

	close() {
		this.activeModal.close(null);
		console.log('Cancel Pressed');
	}
}
