import {Component, Input} from "@angular/core";
import {UIDiagnosticOrder} from "../models/resources/clinical/UIDiagnosticOrder";

@Component({
	selector : 'testRequests',
	template : require('./testRequests.html')
})
export class TestRequestsComponent {
	@Input() testRequests : UIDiagnosticOrder[];
}