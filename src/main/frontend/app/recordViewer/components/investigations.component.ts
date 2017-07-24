import {Component, Input} from "@angular/core";
import {UIObservation} from "../models/resources/clinical/UIObservation";
import {UIInvestigation} from "../models/resources/clinical/UIInvestigation";

@Component({
	selector : 'investigations',
	template : require('./investigations.html')
})
export class InvestigationsComponent {
	@Input() investigations : UIInvestigation[];
}