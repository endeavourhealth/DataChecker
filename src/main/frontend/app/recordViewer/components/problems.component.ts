import {Component, Input} from "@angular/core";
import {UIProblem} from "../models/resources/clinical/UIProblem";
import {AdminCacheBaseComponent} from "./adminCacheBaseComponent";
import {AdminCacheService} from "../adminCache.service";

@Component({
	selector : 'problems',
	template : require('./problems.html')
})
export class ProblemsComponent extends AdminCacheBaseComponent {
	@Input() title : string;
	@Input() problems : UIProblem[];
	@Input() placeholder : string;

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