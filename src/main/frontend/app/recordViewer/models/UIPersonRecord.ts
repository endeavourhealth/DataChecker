import {UIPatient} from "./resources/admin/UIPatient";
import {UIProblem} from "./resources/clinical/UIProblem";
import {UIEncounter} from "./resources/clinical/UIEncounter";
import {UICondition} from "./resources/clinical/UICondition";
import {linq} from "eds-common-js";
import {UIDiary} from "./resources/clinical/UIDiary";
import {UIObservation} from "./resources/clinical/UIObservation";
import {UIAllergy} from "./resources/clinical/UIAllergy";
import {UIImmunisation} from "./resources/clinical/UIImmunisation";
import {UIFamilyHistory} from "./resources/clinical/UIFamilyHistory";
import {UIMedicationStatement} from "./resources/clinical/UIMedicationStatement";
import {UIMedicationOrder} from "./resources/clinical/UIMedicationOrder";
import {UIDiagnosticReport} from "./resources/clinical/UIDiagnosticReport";
import {UIInvestigation} from "./resources/clinical/UIInvestigation";
import {UIDiagnosticOrder} from "./resources/clinical/UIDiagnosticOrder";
import {UIReferral} from "./resources/clinical/UIReferral";
import {UISpecimen} from "./resources/clinical/UISpecimen";
import {UITest} from "./resources/clinical/UITest";
import {UIProcedure} from "./resources/clinical/UIProcedure";

export class UIPersonRecord {
	patients: UIPatient[];
	conditions: UICondition[];
	problems: UIProblem[];
	encounters: UIEncounter[];
	observations: UIObservation[];
	diary: UIDiary[];
	medication: UIMedicationStatement[];
	medicationOrder: UIMedicationOrder[];
	allergies: UIAllergy[];
	immunisations: UIImmunisation[];
	familyHistory: UIFamilyHistory[];
	diagnosticReports: UIDiagnosticReport[];
	testRequests: UIDiagnosticOrder[];
	specimens: UISpecimen[];
	referrals: UIReferral[];
	procedures : UIProcedure[];

	constructor(patients: UIPatient[]) {
		this.patients = patients;
	}

	public getActiveProblems(): UIProblem[] {
		return linq(this.problems)
			.Where(t => (!t.hasAbated))
			.ToArray();
	}

	public hasActiveProblems(): boolean {
		if (this.getActiveProblems() == null)
			return false;

		return (this.getActiveProblems().length > 0);
	}

	public getPastProblems(): UIProblem[] {
		return linq(this.problems)
			.Where(t => t.hasAbated)
			.ToArray();
	}

	public hasPastProblems(): boolean {
		if (this.getPastProblems() == null)
			return false;

		return (this.getPastProblems().length > 0);
	}

	public hasObservations(): boolean {
		if (this.observations == null)
			return false;

		return (this.observations.length > 0);
	}

	public hasDiaryEntries(): boolean {
		if (this.diary == null)
			return false;

		return (this.diary.length > 0);
	}

	public getAcuteMedication(): UIMedicationStatement[] {
		return linq(this.medication)
			.Where(t => t.status != 'Completed' && t.authorisationType.code == 'acute')
			.OrderByDescending(t => this.getMedicationOrderingDate(t))
			.ToArray();
	}

	public getRepeatMedication(): UIMedicationStatement[] {
		return linq(this.medication)
			.Where(t => t.status != 'Completed' && t.authorisationType.code != 'acute')
			.OrderByDescending(t => this.getMedicationOrderingDate(t))
			.ToArray();
	}

	public getPastMedication(): UIMedicationStatement[] {
		return linq(this.medication)
			.Where(t => t.status == 'Completed')
			.OrderByDescending(t => this.getMedicationOrderingDate(t))
			.ToArray();
	}

	public getInvestigations(): UIInvestigation[] {
		return linq(this.observations as Array<UIInvestigation>)
			.Concat(linq(this.diagnosticReports as Array<UIInvestigation>))
			.Where(t => t.related && t.related.filter((r) => r.type === 'has-member').length > 0)
			.ToArray();
	}

	public getTests(): UITest[] {
		return linq(this.testRequests as Array<UITest>)
			.Concat(linq(this.specimens as Array<UITest>))
			.ToArray();
	}


	private getMedicationOrderingDate(medicationStatement: UIMedicationStatement): Date {
		if (medicationStatement == null
			|| medicationStatement.mostRecentIssue == null)

			return null;

		return medicationStatement.mostRecentIssue.date;
	}
}