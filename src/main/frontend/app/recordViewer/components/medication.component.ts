import {Component, Input} from "@angular/core";
import {UIMedicationOrder} from "../models/resources/clinical/UIMedicationOrder";
import {UIMedicationStatement} from "../models/resources/clinical/UIMedicationStatement";
import {linq} from "eds-common-js";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {MedicationIssuesDialog} from "./medicationIssues.dialog";
import {List} from "linqts/dist/linq";
import {UIHumanName} from "../models/types/UIHumanName";
import {AdminCacheService} from "../adminCache.service";
import {AdminCacheBaseComponent} from "./adminCacheBaseComponent";

@Component({
	selector : 'medication',
	template : require('./medication.html')
})
export class MedicationComponent extends AdminCacheBaseComponent {
	@Input() title : string;
	@Input() medication : UIMedicationStatement[];
	@Input() medicationOrders : UIMedicationOrder[];
	@Input() showDateEnded : boolean = false;
	@Input() placeholder : string;
	private blockHide : boolean = false;

	constructor(adminCache : AdminCacheService, protected $modal : NgbModal) {
		super(adminCache);
	}

	toggleDetail(med : any) {
		if (!this.blockHide)
			med.showDetail = !med.showDetail;

		this.blockHide = false;
	}

	getPrescriber(med : UIMedicationStatement) : UIHumanName {
		let latestOrder : UIMedicationOrder = this.getIssues(med.id).FirstOrDefault();

		if (latestOrder && latestOrder.prescriber)
			return this.getPractitionerName(latestOrder.prescriber);

		if (med.prescriber)
			return this.getPractitionerName(med.prescriber);

		return null;
	}

	private showIssues(medicationId : String) {
		this.blockHide = true;
		let statementOrders = this.getIssues(medicationId).ToArray();
		console.info("Medication Orders:" + statementOrders.length.toString());
		MedicationIssuesDialog.open(this.$modal, statementOrders);
	}

	private getIssues(medicationId : String) : List<UIMedicationOrder> {
		return linq(this.medicationOrders)
			.Where(o => o.medicationStatement && o.medicationStatement.id == medicationId)
			.OrderByDescending(o => o.date);
	}
}