import {UICode} from "../../types/UICode";
import {UICondition} from "./UICondition";
import {UIDate} from "../../types/UIDate";
import {UIInternalIdentifier} from "../../UIInternalIdentifier";

export class UIProblem extends UICondition {
    expectedDuration: number;
    lastReviewDate: UIDate;
    lastReviewer: UIInternalIdentifier;
    significance: UICode;
    relatedProblem: UIProblem;
    relationshipType: string;
    isReview: boolean;
}
