import {UICode} from "../models/types/UICode";
import {Pipe, PipeTransform} from "@angular/core";
import {UICodeableConcept} from "../models/types/UICodeableConcept";
import {linq} from "eds-common-js";

@Pipe({name : 'codeSignificance'})
export class CodeSignificance implements PipeTransform {
    transform(significance: UICode): string {
        return getCodeSignificance(significance);
    }
}

function getCodeSignificance(significance: UICode): string {
    if (significance == null)
        return "";

    switch (significance.code) {
        case "386134007": return "Significant";
        case "371928007": return "Minor";
        default: return "";
    }
}

@Pipe({name : 'checkTextForCode'})
export class CheckTextForCode implements PipeTransform {
	transform(concept: UICodeableConcept): string {
		if (!concept)
			return '';

		if (!concept.codes || concept.codes.length == 0)
			return concept.text;

		let code : UICode = linq(concept.codes).Where(c => c.code == concept.text).FirstOrDefault();

		if (code)
			return code.display;

		return concept.text;
	}
}

