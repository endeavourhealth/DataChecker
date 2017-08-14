import {Component, Input, OnInit} from "@angular/core";
import {UIMedicationOrder} from "../models/resources/clinical/UIMedicationOrder";
import {UIMedicationStatement} from "../models/resources/clinical/UIMedicationStatement";
import {linq} from "eds-common-js";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {MedicationIssuesDialog} from "./medicationIssues.dialog";
import {List} from "linqts/dist/linq";
import {UIHumanName} from "../models/types/UIHumanName";
import {AdminCacheService} from "../adminCache.service";
import {AdminCacheBaseComponent} from "./adminCacheBaseComponent";
import {UIDate} from "../models/types/UIDate";

@Component({
	selector : 'medication',
	template : require('./medication.html')
})
export class MedicationComponent extends AdminCacheBaseComponent {
	@Input() medication : UIMedicationStatement[];
	@Input() medicationOrders : UIMedicationOrder[];
	@Input() placeholder : string;
	private blockHide : boolean = false;
	private viewMode : string = 'current';

	constructor(adminCache : AdminCacheService, protected $modal : NgbModal) {
		super(adminCache);
	}

	toggleDetail(med : any) {
		if (!this.blockHide)
			med.showDetail = !med.showDetail;

		this.blockHide = false;
	}

	getPrescriber(med : UIMedicationStatement) : UIHumanName {
		let latestOrder : UIMedicationOrder = this.getMedicationIssues(med.id).FirstOrDefault();

		if (latestOrder && latestOrder.prescriber)
			return this.getPractitionerName(latestOrder.prescriber);

		if (med.prescriber)
			return this.getPractitionerName(med.prescriber);

		return null;
	}

	private showIssues(medicationId : String) {
		this.blockHide = true;
		let statementOrders = this.getMedicationIssues(medicationId).ToArray();
		console.info("Medication Orders:" + statementOrders.length.toString());
		MedicationIssuesDialog.open(this.$modal, statementOrders);
	}

	private getMedicationIssues(medicationId : String) : List<UIMedicationOrder> {
		return linq(this.medicationOrders)
			.Where(o => o.medicationStatement && o.medicationStatement.id == medicationId)
			.OrderByDescending(o => o.date.date);
	}

	private getLastIssueDate(medicationStatement : UIMedicationStatement) : UIDate {
		// TODO : CHECK INBOUND DATA AND CALCULATE ON SAVE?
		if (!medicationStatement.mostRecentIssue && this.medicationOrders) {
			let latestOrder: UIMedicationOrder = linq(this.medicationOrders)
				.Where(o => o.medicationStatement && o.medicationStatement.id == medicationStatement.id)
				.OrderByDescending(o => o.date.date)
				.FirstOrDefault();

			if (latestOrder)
				medicationStatement.mostRecentIssue = latestOrder.date;
			else {
				medicationStatement.mostRecentIssue = new UIDate();
				medicationStatement.mostRecentIssue.date = null;
				medicationStatement.mostRecentIssue.precision = "unknown";
			}
		}

		return medicationStatement.mostRecentIssue;
	}

	public getAcuteMedication(): UIMedicationStatement[] {
		return linq(this.medication)
			.Where(t => t.status != 'Completed' && t.authorisationType.code == 'acute')
			.OrderByDescending(t => this.getMedicationName(t, 'ZZZZZZ'))
			.ToArray();
	}

	public getRepeatMedication(): UIMedicationStatement[] {
		return linq(this.medication)
			.Where(t => t.status != 'Completed' && t.authorisationType.code != 'acute')
			.OrderByDescending(t => this.getMedicationName(t, 'ZZZZZZ'))
			.ToArray();
	}

	private getMedicationName(medicationStatement : UIMedicationStatement, unknownValue : string = 'Unknown') : string {
		if (medicationStatement
			&& medicationStatement.medication
			&& medicationStatement.medication.code)
			return medicationStatement.medication.code.text;

		return unknownValue;
	}

	public getPastMedication(): UIMedicationStatement[] {
		let groupedMeds = linq(this.medication)
			.Where(t => t.status == 'Completed')
			.OrderByDescending(t => this.getMedicationOrderingDate(t))
			.GroupBy(t => this.getMedicationName(t), g => g);

		return linq(Object.keys(groupedMeds))
			.Select(key => groupedMeds[key][0])
			.ToArray();
	}

	private getMedicationOrderingDate(medicationStatement: UIMedicationStatement): Date {
		if (medicationStatement == null
			|| medicationStatement.mostRecentIssue == null)

			return null;

		return medicationStatement.mostRecentIssue.date;
	}

	private getIssues() : UIMedicationOrder[] {
		return linq(this.medicationOrders)
			.OrderByDescending(o => o.date.date)
			.ToArray();
	}

	private getIssueDrugName(issue : UIMedicationOrder) : string {
		return this.getMedicationName(issue.medicationStatement);

		/* if (!issue.medicationStatement || !issue.medicationStatement.id)
			return "Unknown";

		if (issue.medicationStatement.medication
		&& issue.medicationStatement.medication.code)
			return issue.medicationStatement.medication.code.text;

		let medicationStatement : UIMedicationStatement = linq(this.medication)
			.Where(ms => ms.id == issue.medicationStatement.id)
			.FirstOrDefault();

		if (medicationStatement) {
			issue.medicationStatement = medicationStatement;
			return medicationStatement.medication.code.text;
		}

		return "Unknown"; */
	}

}