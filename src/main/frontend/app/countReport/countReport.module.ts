import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {NKDatetimeModule} from "ng2-datetime/ng2-datetime";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CountReportComponent} from "./countReport.component";
import {CountReportService} from "./countReport.service";
import {ReportParamsDialog} from "./reportParams.dialog";
import {PractitionerModule} from "../practitioner/practitioner.module";
import {CodingModule, FolderModule, LibraryModule} from "eds-common-js";

@NgModule({
	imports:[
		BrowserModule,
		FormsModule,
		NgbModule,
		NKDatetimeModule,

		FolderModule,
		LibraryModule,
		CodingModule,
		PractitionerModule,
	],
	declarations:[
		CountReportComponent,
		ReportParamsDialog,
	],
	entryComponents:[
		ReportParamsDialog,
	],
	providers:[
		CountReportService
	]
})
export class CountReportModule {}