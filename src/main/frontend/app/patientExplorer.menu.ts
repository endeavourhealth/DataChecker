import {Injectable} from "@angular/core";
import {MenuService} from "eds-common-js";
import {MenuOption} from "eds-common-js/dist/layout/models/MenuOption";

@Injectable()
export class PatientExplorerMenuService implements  MenuService {
	getApplicationTitle(): string {
		return 'Discovery Data Checker';
	}
	getMenuOptions():MenuOption[] {
		return [
			{caption: 'Patient explorer', state: 'app.recordViewer', icon: 'fa fa-heart'},
			{caption: 'Standard reports', state: 'app.countReports', icon: 'fa fa-balance-scale'},
			// {caption: 'SQL editor', state: 'app.sqlEditor', icon: 'fa fa-database'}
		];
	}
}