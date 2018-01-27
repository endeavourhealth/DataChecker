import {Injectable} from "@angular/core";
import {MenuService} from "eds-common-js";
import {MenuOption} from "eds-common-js/dist/layout/models/MenuOption";

@Injectable()
export class PatientExplorerMenuService implements  MenuService {
	getClientId() : string {
		return 'eds-data-checker';
	}
	getApplicationTitle(): string {
		return 'Point of Care';
	}
	getMenuOptions():MenuOption[] {
		return [
			{caption: 'Patient explorer', state: 'app.recordViewer', icon: 'fa fa-heart', role: 'eds-data-checker:patient-explorer'},
			{caption: 'Standard reports', state: 'app.countReports', icon: 'fa fa-balance-scale', role: 'eds-data-checker:validation-reports'},
		];
	}
}