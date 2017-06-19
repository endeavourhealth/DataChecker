import {Component, Input} from "@angular/core";
import {UICodeableConcept} from "../models/types/UICodeableConcept";

@Component({
	selector : 'codeTermTooltip',
	template : require('./codeTermTooltip.html')
})
export class CodeTermTooltipComponent {
	@Input() code : UICodeableConcept;

	private getSystem(system : string) : string {
		return system.substr(system.lastIndexOf('/') + 1);
	}
}