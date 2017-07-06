import {AdminCacheService} from "../adminCache.service";
import {UIInternalIdentifier} from "../models/UIInternalIdentifier";
import {UIHumanName} from "../models/types/UIHumanName";
import {UIPractitioner} from "../models/resources/admin/UIPractitioner";
import {UILocation} from "../models/resources/admin/UILocation";
import {UIOrganisation} from "../models/resources/admin/UIOrganisation";

export class AdminCacheBaseComponent {

	constructor(private adminCache : AdminCacheService) {}

	getPractitionerName(practitionerId : UIInternalIdentifier) : UIHumanName {
		if (!practitionerId)
			return null;

		let practitioner : UIPractitioner = this.adminCache.getPractitioner(practitionerId);
		if (practitioner)
			return practitioner.name;

		return null;
	}

	getOrganisationName(organisationId : UIInternalIdentifier) : string {
		if (!organisationId)
			return null;

		let organisation : UIOrganisation= this.adminCache.getOrganisation(organisationId);
		if (organisation)
			return organisation.name;

		return null;
	}

	getLocation(locationId : UIInternalIdentifier) : UILocation {
		if (!locationId)
			return null;

		return this.adminCache.getLocation(locationId);
	}
}