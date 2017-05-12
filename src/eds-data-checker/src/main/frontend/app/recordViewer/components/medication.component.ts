import {Component, Input} from "@angular/core";
import {UIMedicationOrder} from "../models/resources/clinical/UIMedicationOrder";
import {UIMedicationStatement} from "../models/resources/clinical/UIMedicationStatement";
import {linq, LoggerService, MessageBoxDialog} from "eds-common-js";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {MedicationIssuesDialog} from "./medicationIssues.dialog";

@Component({
	selector : 'medication',
	template : require('./medication.html')
})
export class MedicationComponent {
	@Input() title : string;
	@Input() medication : UIMedicationStatement[];
	@Input() medicationOrders : UIMedicationOrder[];
	@Input() showDateEnded : boolean = false;
	@Input() placeholder : string;
	private blockHide : boolean = false;

	constructor(protected $modal : NgbModal) {
	}

	toggleDetail(med : any) {
		if (!this.blockHide)
			med.showDetail = !med.showDetail;

		this.blockHide = false;
	}

	private showIssues(medicationId : String) {
		this.blockHide = true;
		let statementOrders = linq(this.medicationOrders)
			.Where(o => o.medicationStatement && o.medicationStatement.id == medicationId)
			.OrderByDescending(o => o.date)
			.ToArray();
		console.info("Medication Orders:" + statementOrders.length.toString());
		MedicationIssuesDialog.open(this.$modal, statementOrders);
	}
}