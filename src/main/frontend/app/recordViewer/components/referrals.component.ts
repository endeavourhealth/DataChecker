import {Component, Input} from "@angular/core";
import {UIReferral} from "../models/resources/clinical/UIReferral";

@Component({
	selector : 'referrals',
	template : require('./referrals.html')
})
export class ReferralsComponent {
	@Input() referrals : UIReferral[];
}