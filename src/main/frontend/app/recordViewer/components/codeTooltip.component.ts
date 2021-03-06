import {Component, Input} from "@angular/core";
import {UICodeableConcept} from "../models/types/UICodeableConcept";

@Component({
	selector : 'codeTooltip',
	template : require('./codeTooltip.html')
})
export class CodeTooltipComponent {
	@Input() code : UICodeableConcept;

	private getSystem(system : string) : string {
		return system.substr(system.lastIndexOf('/') + 1);
	}
}