import {Component} from "@angular/core";
import {LibraryService, LoggerService} from "eds-common-js";
import {CountReportService} from "./countReport.service";
import {ReportParamsDialog} from "./reportParams.dialog";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FolderNode} from "eds-common-js/dist/folder/models/FolderNode";
import {FolderItem} from "eds-common-js/dist/folder/models/FolderContent";
import {ItemType} from "eds-common-js/dist/folder/models/ItemType";
import {SecurityService} from "eds-common-js";
import {ItemSummaryList} from "eds-common-js/dist/library/models/ItemSummaryList";
import {CountReportLibraryItem} from "./models/CountReportLibraryItem";

@Component({
	template : require('./countReports.html')
})
export class CountReportComponent {
	selectedFolder : FolderNode;
	itemSummaryList : ItemSummaryList;
	selectedItem : FolderItem;
	libraryItem : CountReportLibraryItem;

	constructor(
		protected $modal : NgbModal,
		protected logger : LoggerService,
		protected securityService : SecurityService,
		protected countReportService : CountReportService,
		protected libraryService : LibraryService) {
	}

	folderChanged($event) {
		this.selectedFolder = $event.selectedFolder;
		this.refresh();
	}

	refresh() {
		var vm = this;
		vm.libraryService.getFolderContents(vm.selectedFolder.uuid)
			.subscribe(
				(data) => {
					vm.itemSummaryList = data;
					vm.selectedFolder.loading = false;
				});
	}

	getSummaryList() {
		if (!this.itemSummaryList || !this.itemSummaryList.contents)
			return null;

		return this.itemSummaryList.contents
			.filter(item => item.type == ItemType.CountReport);
	}

	selectRow(item : FolderItem) {
		if (this.selectedItem == item)
			return;

		this.selectedItem = item;
		var vm = this;
		vm.libraryService.getLibraryItem<CountReportLibraryItem>(item.uuid)
			.subscribe(
				(libraryItem) => vm.libraryItem = libraryItem,
				(error) => vm.logger.error('Error loading', error, 'Error')
			);
	}

	runReport() {
		var vm = this;
		if (vm.securityService.currentUser.organisation) {
			// Get param list from query
			ReportParamsDialog.open(vm.$modal, this.libraryItem.countReport)
				.result.then((params) => {
					if (params)
						vm.executeReport(params);
				}
			);
		} else {
			vm.logger.warning('Select a service', null, 'No service selected');
		}
	}

	executeReport(params : Map<string, string>) {
		var vm = this;
		vm.countReportService.runReport(this.libraryItem.uuid, params)
			.subscribe(
				(result) => {
					vm.logger.success('Report successfully run', result, 'Run report');
					vm.libraryItem.countReport = result.countReport;
				},
				(error) => vm.logger.error('Error running report', error, 'Error')
			);
	}

	exportNHSNumber() {
		var vm = this;
		let reportId = this.libraryItem.uuid;
		vm.countReportService.exportNHSNumbers(reportId)
			.subscribe(
				(result) => {
					vm.logger.success('NHS numbers successfully exported', reportId, 'Export NHS numbers');
					let filename = 'Report_'+reportId+'_NHS.csv';
					vm.downloadFile(filename, result)
				},
				(error) => vm.logger.error('Error exporting HNS numbers', error, 'Error')
			);
	}

	exportData() {
		var vm = this;
		let reportId = this.libraryItem.uuid;
		vm.countReportService.exportData(reportId)
			.subscribe(
			(result) => {
				vm.logger.success('Data successfully exported', reportId, 'Export data');
				let filename = 'Report_'+reportId+'_Dat.csv';
				vm.downloadFile(filename, result)
			},
			(error) => vm.logger.error('Error exporting data', error, 'Error')
		);
	}

	downloadFile(filename : string, data: string){
		var blob = new Blob([data], { type: 'text/plain' });
		window['saveAs'](blob, filename);
	}
}
