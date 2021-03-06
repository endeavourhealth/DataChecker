import {Pipe, PipeTransform} from "@angular/core";
import * as moment from 'moment';


import {UIHumanName} from "../models/types/UIHumanName";
import {UIAddress} from "../models/types/UIAddress";
import {UIDate} from "../models/types/UIDate";
import {UIQuantity} from "../models/types/UIQuantity";

@Pipe({name : 'cuiQuantity'})
export class CuiQuantity implements PipeTransform {
    transform(quantity : UIQuantity) : string {
        if (!quantity || !quantity.value)
            return;

        let result : string = quantity.value.toString();
        if (quantity.comparator)
            result = quantity.comparator + ' ' + result;

        if (quantity.units)
            result += ' ' + quantity.units;

        return result;
    }
}

@Pipe({name : 'cuiDate'})
export class CuiDate implements PipeTransform {
    transform(date: UIDate): string {
        return formatCuiDate(date);
    }
}

@Pipe({name : 'cuiDateTime'})
export class CuiDateTime implements PipeTransform {
	transform(date: UIDate): string {
		return formatCuiDateTime(date);
	}
}

@Pipe({name : 'cuiDateOfBirth'})
export class CuiDateOfBirth implements PipeTransform {
    transform(dateOfBirth: UIDate): string {
        if (dateOfBirth == null)
            return "Unknown";

        let age: moment.Duration = getDurationFromNow(dateOfBirth.date);
        return formatCuiDate(dateOfBirth) + ' (' + age.years() + 'y ' + age.months() + 'm)';
    }
}

@Pipe({name : 'cuiNhsNumber'})
export class CuiNhsNumber implements PipeTransform {
    transform(nhsNumber: string): string {
        if (nhsNumber == null)
            return null;

        let result: string = nhsNumber.replace(" ", "");

        if (result.length != 10)
            return result;

        return result.substring(0, 3) + " " + result.substring(3, 6) + " " + result.substring(6, 10);
    }
}

@Pipe({name : 'cuiName'})
export class CuiName implements PipeTransform {
    transform(name: UIHumanName): string {
        if (!name)
            return null;

        let prefix: string;
        let givenNames: string;
        let familyName: string;

        if (name != null) {
            prefix = name.prefix;

            if (name.givenNames != null)
                if (name.givenNames.length > 0)
                    givenNames = name.givenNames.join(' ');

            familyName = name.familyName;

            if (prefix == null)
                prefix = "";
            if (givenNames == null)
                givenNames = "";
            if (familyName == null)
                familyName = "";

            prefix = titleCase(prefix.trim());
            givenNames = titleCase(givenNames.trim());
            familyName = familyName.trim().toUpperCase();
        }

        if (familyName == "")
            familyName = "";

        let result: string = familyName;

        if (givenNames != "")
            result += ", " + givenNames;

        if (prefix != "")
            result += " (" + prefix + ")";

        if (result != "")
        	return result;

        if (name.text != "")
        	return name.text;

        return "UNKNOWN";
    }
}

@Pipe({name : 'cuiSingleLineAddress'})
export class CuiSingleLineAddress implements PipeTransform {
    transform(address: UIAddress): string {
        if (address == null)
            return "";

        let lines: string[] = new Array<string>();

        lines.push(address.line1);
        lines.push(address.line2);
        lines.push(address.line3);
        lines.push(address.city);
        lines.push(address.district);
        lines.push(formatPostalCode(address.postalCode));

        return lines
          .filter(t => !isEmpty(t))
          .join(", ");
    }
}

@Pipe({name : 'cuiGender'})
export class CuiGender implements PipeTransform {
    transform(genderCode: string): string {
        if (isEmpty(genderCode))
            return "";

        if (genderCode == "male")
            return "Male";
        else if (genderCode == "female")
            return "Female";
        else if (genderCode == "other")
            return "Not known";
        else if (genderCode == "unknown")
            return "Not specified";

        return "";
    }
}

function formatCuiDate(date: UIDate): string {
    if ((date == null) || (date.precision == "unknown"))
        return "Unknown";

    return moment(date.date).utc().format("DD-MMM-YYYY");
}

function formatCuiDateTime(date: UIDate): string {
		if ((date == null) || (date.precision == "unknown"))
			return "Unknown";

		switch (date.precision) {
			case 'millisecond' : return moment(date.date).utc().format("DD-MMM-YYYY HH:mm:ss");
			default : return moment(date.date).utc().format("DD-MMM-YYYY HH:mm:ss");
		}
}


function getDurationFromNow(date: Date): moment.Duration {
    return moment.duration(moment().diff(moment.utc(date)));
}


function titleCase(text: string) {
    return text;
}

function formatPostalCode(postalCode: string): string {
	//handle undefined postcodes too
	if (!postalCode)
		return null;

	postalCode = postalCode.trim();

	// Handle partials such as "LS11"
	if (postalCode.length < 5)
		return postalCode;

	let formattedPostalCode = postalCode.replace(" ", "").toUpperCase();

	let regExp: RegExp = new RegExp("^([A-Z]{1,2}[0-9]{1,2}[A-Z]?)([0-9][A-Z]{2})$");
	let result: RegExpExecArray = regExp.exec(formattedPostalCode);

	if ((result != null) && (result.length == 3))
		return result[1] + " " + result[2];

	return postalCode;
}

function isEmpty(str: string): boolean {
    if (str == null)
        return true;

    return (str.trim().length == 0);
}
