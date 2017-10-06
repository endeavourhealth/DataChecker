import {Component, Input} from "@angular/core";
import {UIProcedure} from "../models/resources/clinical/UIProcedure";

@Component({
	selector : 'procedures',
	template : require('./procedures.html')
})
export class ProceduresComponent {
	@Input() procedures : UIProcedure[];

}