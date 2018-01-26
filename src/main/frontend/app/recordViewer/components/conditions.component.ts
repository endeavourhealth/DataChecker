import {Component, Input} from "@angular/core";
import {AdminCacheBaseComponent} from "./adminCacheBaseComponent";
import {AdminCacheService} from "../adminCache.service";
import {UICondition} from "../models/resources/clinical/UICondition";
import {UIProblem} from '../models/resources/clinical/UIProblem';

@Component({
	selector : 'conditions',
	template : require('./conditions.html')
})
export class ConditionsComponent extends AdminCacheBaseComponent {
	@Input() conditions : UICondition[];

	constructor(adminCache : AdminCacheService) {
		super(adminCache);
	}

	getEpisodicity(problem: UIProblem) {
		if (problem.isReview)
			return " (Review)";
		else
			return " (Onset)";
	}

}