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

@Component({
		template : require('./recordViewer.html')
})
export class RecordViewerComponent {
		public person : UIPerson;
		public episodes : UIEpisodeOfCare[];
		public personRecord: UIPersonRecord;
		public filterEpisode : UIEpisodeOfCare;

		constructor(private $modal: NgbModal,
								protected logger : LoggerService,
								protected recordViewerService: RecordViewerService,
								protected securityService : SecurityService) {
		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// patient find
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		public showPersonFind(): void {
				let ctrl = this;
				if (ctrl.securityService.currentUser.organisation) {
					PatientFindDialog
						.open(ctrl.$modal)
						.result
						.then((result: UIPatient) => { if (result) ctrl.setPerson(result) });
					} else {
					ctrl.logger.warning('Select a service', null, 'No service selected');
				}
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
				.Distinct()
				.Select(p => vm.recordViewerService.getPatient(p))
				.ToArray();

			Observable.forkJoin(o)
				.subscribe(
					(result) => this.setPatientRecord(result),
					(error) => this.logger.error("Failed to load episode", error, "Error")
				);
		}

		public setPatientRecord(patients: UIPatient[]): void {
				this.clearPatientRecord();
				this.personRecord = new UIPersonRecord(patients);
		}

		public clearPatientRecord(): void {
			this.personRecord = null;
		}
}
