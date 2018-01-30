import {UIPatient} from "./models/resources/admin/UIPatient";
import {PatientFindDialog} from "./patientFind.dialog";
import {RecordViewerService} from "./recordViewer.service";
import {UIPersonRecord} from "./models/UIPersonRecord";
import {Component} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LoggerService, SecurityService} from "eds-common-js";
import {UIPerson} from "./models/resources/admin/UIPerson";
import {UIEpisodeOfCare} from "./models/resources/clinical/UIEpisodeOfCare";
import {Observable} from "rxjs";
import {linq} from "eds-common-js";
import {UIInternalIdentifier} from "./models/UIInternalIdentifier";
import {Transition} from "ui-router-ng2";
import {UIService} from './models/UIService';

@Component({
		template : require('./recordViewer.html')
})
export class RecordViewerComponent {
		public findEnabled: boolean = false;
		public person : UIPerson;
		public episodes : UIEpisodeOfCare[];
		public personRecord: UIPersonRecord;
		public filterEpisode : UIEpisodeOfCare;

		constructor(private $modal: NgbModal,
								protected logger : LoggerService,
								protected recordViewerService: RecordViewerService,
								protected securityService : SecurityService,
								private transition: Transition) {

			this.loadServices();

			if (transition.params()['nhsNumber'])
				this.loadPatient(transition.params()['nhsNumber']);
		}

		public loadServices() {
			var vm = this;
			vm.recordViewerService.getServices()
				.subscribe(
					(result) => vm.processServices(result),
					(error) => vm.logger.error(error)
				);
		}

		public processServices(services: UIService[]) {
			if (services && services.length > 0)
				this.findEnabled = true;
			else {
				this.logger.error("You do not have access to any services. Please contact your system administrator", null, 'Insufficient Access');
			}
		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// patient find
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		public showPersonFind(): void {
			let ctrl = this;
			PatientFindDialog
				.open(ctrl.$modal)
				.result
				.then((result: UIPatient) => {
					if (result) ctrl.setPerson(result)
				});
		}

		public setPerson(person : UIPerson) {
			this.clearPerson();
			this.person = person;
			this.loadEpisodes();
		}

		public clearPerson() {
			this.clearEpisode();
			this.person = null;
		}

		public clearEpisode() {
			this.clearPatientRecord();
			this.filterEpisode = null;
		}

		private loadPatient(nhsNumber : string) {
			let vm = this;

			vm.recordViewerService.getPerson(nhsNumber)
				.subscribe(
					(result) => vm.setPerson(result),
					(error) => vm.logger.error("Error navigating to patient", error)
				);
		}

	loadEpisodes() {
		let vm = this;
		vm.episodes = null;
		vm.recordViewerService.getEpisodes(vm.person).subscribe(
			(episodes : UIEpisodeOfCare[]) => vm.episodes = episodes,
			(error) => vm.logger.error("Error loading episodes",error)
		);
	}

		onEpisodeSelect(episode : UIEpisodeOfCare) {
			let vm = this;
			vm.filterEpisode = episode;

			let o : Observable<UIPatient>[] = linq(vm.episodes)
				.Select(e => e.patient.patientId)
				.DistinctBy(p => this.buildUniqueId(p))
				.Select(p => vm.recordViewerService.getPatient(p))
				.ToArray();

			Observable.forkJoin(o)
				.subscribe(
					(result) => this.setPatientRecord(result),
					(error) => this.logger.error("Failed to load episode", error, "Error")
				);
		}

		buildUniqueId(id : UIInternalIdentifier) : string {
			return id.serviceId + ',' + id.resourceId;
		}

		public setPatientRecord(patients: UIPatient[]): void {
				this.clearPatientRecord();
				this.personRecord = new UIPersonRecord(patients);
		}

		public clearPatientRecord(): void {
			this.personRecord = null;
		}
}
