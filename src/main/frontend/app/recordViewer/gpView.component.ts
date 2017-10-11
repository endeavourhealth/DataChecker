import {UIEncounter} from "./models/resources/clinical/UIEncounter";
import {RecordViewerService} from "./recordViewer.service";
import {UIProblem} from "./models/resources/clinical/UIProblem";
import {linq} from "eds-common-js";
import {UIPersonRecord} from "./models/UIPersonRecord";
import {UIDiary} from "./models/resources/clinical/UIDiary";
import {UIObservation} from "./models/resources/clinical/UIObservation";
import {Component, ViewChild, Input, OnInit, AfterViewInit} from "@angular/core";
import {UIAllergy} from "./models/resources/clinical/UIAllergy";
import {UIImmunisation} from "./models/resources/clinical/UIImmunisation";
import {UIFamilyHistory} from "./models/resources/clinical/UIFamilyHistory";
import {UIMedicationStatement} from "./models/resources/clinical/UIMedicationStatement";
import {LoggerService} from "eds-common-js";
import {Observable} from "rxjs";
import {UIMedicationOrder} from "./models/resources/clinical/UIMedicationOrder";
import {UIEpisodeOfCare} from "./models/resources/clinical/UIEpisodeOfCare";
import {UIDiagnosticReport} from "./models/resources/clinical/UIDiagnosticReport";
import {UIDiagnosticOrder} from "./models/resources/clinical/UIDiagnosticOrder";
import {UIReferral} from "./models/resources/clinical/UIReferral";
import {UISpecimen} from "./models/resources/clinical/UISpecimen";
import {UIProcedure} from "./models/resources/clinical/UIProcedure";
import {UICondition} from "./models/resources/clinical/UICondition";

@Component({
	selector : 'gpView',
	template : require('./gpView.html')
})
export class GPViewComponent implements AfterViewInit {
	@ViewChild('recordTabs') recordTabs: any;
	private activeId : string = "summary";
	@Input()
	private episodes: UIEpisodeOfCare[];
	@Input()
	private filterEpisode : UIEpisodeOfCare;

	private _person: UIPersonRecord;

	@Input()
	set personRecord(person: UIPersonRecord) {
		this._person = person;

		if (this._person != null)
			this.loadDataForTab(this.activeId);
	}
	get personRecord() : UIPersonRecord { return this._person; }

	constructor(protected logger: LoggerService,
							protected recordViewerService: RecordViewerService) {
	}

	ngAfterViewInit() {
		if (this.filterEpisode) {
			console.info(this.filterEpisode);
			let ctrl = this;

			let observers : Observable<UIEncounter[]>[] = linq(ctrl._person.patients)
				.Select(p => ctrl.recordViewerService.getEncounters(p.patientId))
				.ToArray();

			Observable.forkJoin(observers)
				.subscribe(
					(result) =>
						{
							ctrl._person.encounters = result.reduce((a,b) => a.concat(b));
							ctrl.recordTabs.select("consultations");
						}
				);
		}
	}

	loadDataForTab(tabId: string) {
		this.activeId = tabId;
		switch (tabId) {
			case 'consultations' :
				this.loadConsultations();
				break;
			case 'medication' :
				this.loadMedication();
				this.loadMedicationOrders();
				break;
			case 'problems' :
				this.loadProblems();
				break;
			case 'conditions' :
				this.loadConditions();
				break;
			case 'investigations' :
				this.loadDiagnosticReports();
				this.loadObservations();
				break;
			case 'careHistory' :
				this.loadObservations();
				break;
			case 'diary' :
				this.loadDiary();
				break;
			case 'allergies' :
				this.loadAllergies();
				break;
			case 'immunisations' :
				this.loadImmunisations();
				break;
			case 'familyHistory' :
				this.loadFamilyHistory();
				break;
			case 'summary' :
				this.loadProblems();
				this.loadAllergies();
				this.loadMedication();
				this.loadImmunisations();
				break;
			case 'tests' :
				this.loadTestRequests();
				this.loadSpecimens();
				break;
			case 'referrals' :
				this.loadReferrals();
				break;
			case 'procedures' :
				this.loadProcedures();
				break;
		}
	}

	public loadConsultations(): void {
		if (this._person.encounters != null)
			return;

		let ctrl = this;

		let observers : Observable<UIEncounter[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getEncounters(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.encounters = result.reduce((a,b) => a.concat(b))
			);
	}

	public loadMedication(): void {
		if (this._person.medication != null)
			return;

		let ctrl = this;
		let observers : Observable<UIMedicationStatement[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getMedication(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.medication = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.dateAuthorised.date)
					.ToArray()
			);
	}

	public loadMedicationOrders(): void {
		if (this._person.medicationOrder != null)
			return;

		let ctrl = this;
		let observers : Observable<UIMedicationOrder[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getMedicationOrders(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.medicationOrder = linq(result.reduce((a,b) => a.concat(b)))
//					.OrderByDescending(t => t.dateAuthorised.date)
					.ToArray()
			);
	}

	public loadProblems(): void {
		if (this._person.problems != null)
			return;

		let ctrl = this;
		let observers : Observable<UIProblem[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getProblems(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.problems = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadConditions(): void {
		if (this._person.conditions != null)
			return;

		let ctrl = this;
		let observers : Observable<UICondition[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getConditions(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.conditions = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}


	public loadObservations(): void {
		if (this._person.observations != null)
			return;

		let ctrl = this;
		let observers : Observable<UIObservation[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getObservations(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.observations = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadDiary(): void {
		if (this._person.diary != null)
			return;

		let ctrl = this;
		let observers : Observable<UIDiary[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getDiary(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.diary = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadAllergies(): void {
		if (this._person.allergies != null)
			return;

		let ctrl = this;
		let observers : Observable<UIAllergy[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getAllergies(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.allergies = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}


	public loadDiagnosticReports(): void {
		if (this._person.diagnosticReports != null)
			return;

		let ctrl = this;
		let observers : Observable<UIDiagnosticReport[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getDiagnosticReports(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.diagnosticReports = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadImmunisations(): void {
		if (this._person.immunisations != null)
			return;

		let ctrl = this;
		let observers : Observable<UIImmunisation[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getImmunisations(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.immunisations = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadFamilyHistory(): void {
		if (this._person.familyHistory != null)
			return;

		let ctrl = this;
		let observers : Observable<UIFamilyHistory[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getFamilyHistory(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.familyHistory = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.recordedDate.date)
					.ToArray()
			);
	}

	public loadTestRequests(): void {
		if (this._person.testRequests != null)
			return;

		let ctrl = this;
		let observers : Observable<UIDiagnosticOrder[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getTestRequests(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.testRequests = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadSpecimens(): void {
		if (this._person.specimens != null)
			return;

		let ctrl = this;
		let observers : Observable<UISpecimen[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getSpecimens(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.specimens = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadReferrals(): void {
		if (this._person.referrals != null)
			return;

		let ctrl = this;
		let observers : Observable<UIReferral[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getReferralRequests(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.referrals = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

	public loadProcedures(): void {
		if (this._person.procedures != null)
			return;

		let ctrl = this;
		let observers : Observable<UIProcedure[]>[] = linq(ctrl._person.patients)
			.Select(p => ctrl.recordViewerService.getProcedures(p.patientId))
			.ToArray();

		Observable.forkJoin(observers)
			.subscribe(
				(result) => ctrl._person.procedures = linq(result.reduce((a,b) => a.concat(b)))
					.OrderByDescending(t => t.effectiveDate.date)
					.ToArray()
			);
	}

}
