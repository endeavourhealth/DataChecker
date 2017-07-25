import {Component, Input} from "@angular/core";
import {UITest} from "../models/resources/clinical/UITest";

@Component({
	selector : 'tests',
	template : require('./tests.html')
})
export class TestsComponent {
	@Input() tests : UITest[];
}