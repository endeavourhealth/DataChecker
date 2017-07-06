import {Component, Input, OnInit} from "@angular/core";
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UIPatient} from "../models/resources/admin/UIPatient";
import {UICodeableConcept} from "../models/types/UICodeableConcept";
import {UIPractitioner} from "../models/resources/admin/UIPractitioner";
import {UIOrganisation} from "../models/resources/admin/UIOrganisation";
import {AdminCacheService} from "../adminCache.service";

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

	constructor(private adminCache : AdminCacheService, protected activeModal: NgbActiveModal) {
	}

	ngOnInit() {
		// When patient is set, determine usual gp and org
		this.usualGP = null;
		this.usualGPPractice = null;
		if (!this.person)
			return;

		if (this.person.carerPractitioners && this.person.carerPractitioners.length > 0)
			this.usualGP = this.adminCache.getPractitioner(this.person.carerPractitioners[0]);

		if (this.person.carerOrganisations && this.person.carerOrganisations.length > 0)
			this.usualGPPractice = this.person.carerOrganisations[0];
	}

	formatRelationships(relationships: UICodeableConcept[]) : string {
		let result: string = '';
		for (let relationship of relationships) {
			if (result != '')
				result += ', ';
			result += relationship.text;
		}
		return result;
	}

	getLocalIdsAsCSV() : string {
		if (!this.person.localPatientIdentifiers || this.person.localPatientIdentifiers.length == 0)
			return '';

		return this.person.localPatientIdentifiers.join(', ');
	}

	ok() {
		this.activeModal.close(null);
	}
}
