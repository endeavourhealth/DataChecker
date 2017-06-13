import {Component, Input} from "@angular/core";
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UIPatient} from "../models/resources/admin/UIPatient";

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
	@Input() person : UIPatient;

    public static open(modalService: NgbModal, person : UIPatient) {
        const modalRef = modalService.open(DemographicsDialog, {backdrop: "static", size: 'lg'});
				modalRef.componentInstance.person = person;
        return modalRef;
    }

    constructor(protected activeModal: NgbActiveModal) {

    }

    ok() {
        this.activeModal.close(null);
    }
}
