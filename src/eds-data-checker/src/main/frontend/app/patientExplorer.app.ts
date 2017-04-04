// Core
import {NgModule} from '@angular/core';
import {Application} from "./application";

// Modules
import {RecordViewerModule} from "./recordViewer/recordViewer.module";
import {CountReportModule} from "./countReport/countReport.module";

// State components
import {RecordViewerComponent} from "./recordViewer/recordViewer.component";
import {CountReportComponent} from "./countReport/countReport.component";
import {SqlEditorModule} from "./sqlEditor/sqlEditor.module";
import {SqlEditorComponent} from "./sqlEditor/sqlEditor.component";

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
		defaultState : { state: 'app.recordViewer', params: {} }
	})
)
export class AppModule {}

Application.Run(AppModule);