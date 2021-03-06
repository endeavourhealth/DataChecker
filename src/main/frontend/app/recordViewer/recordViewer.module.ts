import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {RecordViewerComponent} from "./recordViewer.component";
import {PatientFindDialog} from "./patientFind.dialog";
import {RecordViewerService} from "./recordViewer.service";
import {CodeSignificance} from "./pipes/coding";
import {
	CuiDate, CuiDateOfBirth, CuiName, CuiNhsNumber,
	CuiSingleLineAddress, CuiGender, CuiQuantity, CuiDateTime
} from "./pipes/cui";
import {Parentheses} from "./pipes/general";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {ProblemsComponent} from "./components/problems.component";
import {DiaryComponent} from "./components/diary.component";
import {PrecisComponent} from "./components/precis.component";
import {SummaryComponent} from "./components/summary.component";
import {ConsultationsComponent} from "./components/consultations.component";
import {MedicationComponent} from "./components/medication.component";
import {TreeModule} from "angular2-tree-component";
import {AllergiesComponent} from "./components/allergies.component";
import {ImmunisationsComponent} from "./components/immunisations.component";
import {FamilyHistoryComponent} from "./components/familyHistory.component";
import {FamilyHistoryConditionComponent} from "./components/familyHistoryCondition.component";
import {CareHistoryComponent} from "./components/careHistory.component";
import {InvestigationsComponent} from "./components/investigations.component";
import {CodeTooltipComponent} from "./components/codeTooltip.component";
import {GPViewComponent} from "./gpView.component";
import {EpisodeViewComponent} from "./episodeView.component";
import {LocationClass, LocationIcon, LocationTypeName} from "./pipes/location";
import {CommonModule, ControlsModule, DialogsModule, LoggerModule} from 'eds-common-js';
import {MedicationIssuesDialog} from "./components/medicationIssues.dialog";
import {DemographicsDialog} from "./components/demographics.dialog";
import {CodeTermTooltipComponent} from "./components/codeTermTooltip.component";
import {AdminCacheService} from "./adminCache.service";
import {TestsComponent} from "./components/tests.component";
import {ReferralsComponent} from "./components/referrals.component";
import {ProceduresComponent} from "./components/procedures.component";
import {ConditionsComponent} from "./components/conditions.component";

@NgModule({
	imports : [
		BrowserModule,
		FormsModule,
		NgbModule,

		DialogsModule,
		LoggerModule,
		TreeModule,
		CommonModule,
		ControlsModule
	],
	declarations : [
		EpisodeViewComponent,
		GPViewComponent,
		RecordViewerComponent,
		PatientFindDialog,
		MedicationIssuesDialog,
		DemographicsDialog,

		PrecisComponent,
		CodeTooltipComponent,
		CodeTermTooltipComponent,
		SummaryComponent,
		ConsultationsComponent,
		MedicationComponent,
		ProblemsComponent,
		ConditionsComponent,
		CareHistoryComponent,
		InvestigationsComponent,
		AllergiesComponent,
		ImmunisationsComponent,
		FamilyHistoryComponent,
			FamilyHistoryConditionComponent,
		DiaryComponent,
		TestsComponent,
		ReferralsComponent,
		ProceduresComponent,

		CodeSignificance,

		CuiDate,
		CuiDateTime,
		CuiDateOfBirth,
		CuiName,
		CuiNhsNumber,
		CuiSingleLineAddress,
		CuiGender,
		CuiQuantity,

		LocationClass,
		LocationIcon,
		LocationTypeName,

		Parentheses
	],
	entryComponents : [
		PatientFindDialog,
		MedicationIssuesDialog,
		DemographicsDialog
	],
	providers :
	[
		RecordViewerService,
		AdminCacheService
	],
	exports : [
		CodeSignificance,

		CuiDate,
		CuiDateTime,
		CuiDateOfBirth,
		CuiName,
		CuiNhsNumber,
		CuiSingleLineAddress,
		CuiGender,

		LocationClass,
		LocationIcon,
		LocationTypeName
	]
})
export class RecordViewerModule {}