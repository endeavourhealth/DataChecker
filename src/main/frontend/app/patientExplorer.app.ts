// Sytling
import '../content/css/index.css';
import '../content/less/index.less';

// Core
import {NgModule} from '@angular/core';

// Modules
import {RecordViewerModule} from "./recordViewer/recordViewer.module";
import {CountReportModule} from "./countReport/countReport.module";

// State components
import {RecordViewerComponent} from "./recordViewer/recordViewer.component";
import {CountReportComponent} from "./countReport/countReport.component";
import {SqlEditorModule} from "./sqlEditor/sqlEditor.module";
import {SqlEditorComponent} from "./sqlEditor/sqlEditor.component";
import {PatientExplorerMenuService} from "./patientExplorer.menu";
import {Application} from "eds-common-js";

@NgModule(
	Application.Define({
		modules: [
			RecordViewerModule,
			CountReportModule,
			SqlEditorModule,
		],
		states: [
			{name: 'app.recordViewer', url: '/recordViewer', component : RecordViewerComponent },
			{name: 'app.countReports', url: '/countReports', component : CountReportComponent },
			{name: 'app.sqlEditor', url: '/sqlEditor', component : SqlEditorComponent }
		],
		defaultState : { state: 'app.recordViewer', params: {} },
		menuManager : PatientExplorerMenuService
	})
)
export class AppModule {}

Application.Run(AppModule);