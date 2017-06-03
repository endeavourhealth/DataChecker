import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BaseHttp2Service} from "eds-common-js";

@Injectable()
export class SqlEditorService extends BaseHttp2Service {
	constructor(http: Http) {
		super(http);
	}

	getTableData() {
		return this.httpGet('api/sqlEditor/getTableData');
	}

	runQuery(sql : string) {
		return this.httpPost('api/sqlEditor/runQuery', sql);
	}
}
