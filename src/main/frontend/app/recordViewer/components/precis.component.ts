import {Component, Input} from "@angular/core";
import {UIPatient} from "../models/resources/admin/UIPatient";
import {UIEpisodeOfCare} from "../models/resources/clinical/UIEpisodeOfCare";
import {linq} from "eds-common-js";
import {DemographicsDialog} from "./demographics.dialog";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
	selector : 'precis',
	template : require('./precis.html')
})
export class PrecisComponent {
	@Input() person : UIPatient;
	@Input() episodes : UIEpisodeOfCare[];

	constructor(private $modal : NgbModal) {

	}

	getEpisodeType() : string {
		if (this.episodes && this.episodes.length == 1)
			return this.episodes[0].managingOrganisation.type;
		else
			return 'Multiple';
	}

	getPeriodStart() : Date {
		return linq(this.episodes)
			.Select(e => e.period.start)
			.Min();
	}

	getPeriodEnd() : Date {
		return linq(this.episodes)
			.Select(e => e.period.end)
			.Max();
	}

	getName() : string {
		if (this.episodes && this.episodes.length == 1)
			return this.episodes[0].managingOrganisation.name;
		else
			return this.episodes.length.toString() + ' organisations';
	}

	showDemographics() {
		DemographicsDialog.open(this.$modal, this.person);
	}
}