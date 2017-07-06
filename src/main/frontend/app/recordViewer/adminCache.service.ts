import {Injectable} from "@angular/core";
import {UIPractitioner} from "./models/resources/admin/UIPractitioner";
import {UIHumanName} from "./models/types/UIHumanName";
import {RecordViewerService} from "./recordViewer.service";
import {UIInternalIdentifier} from "./models/UIInternalIdentifier";
import {UIOrganisation} from "./models/resources/admin/UIOrganisation";
import {UILocation} from "./models/resources/admin/UILocation";

@Injectable()
export class AdminCacheService {
	constructor(private recordService : RecordViewerService) {}

	private _practitioners : Map<string, UIPractitioner> = new Map();
	public getPractitioner(practitionerId : UIInternalIdentifier) : UIPractitioner {
		let hash = practitionerId.resourceId + practitionerId.systemId + practitionerId.serviceId;

		let practitioner : UIPractitioner = this._practitioners.get(hash);
		if (!practitioner) {
			practitioner = new UIPractitioner();
			this._practitioners.set(hash, practitioner);

			practitioner.name = new UIHumanName();
			practitioner.name.familyName = 'Loading...';

			this.recordService.getPractitioner(practitionerId)
				.subscribe(
					(result) => {
						practitioner.name = result.name;
						practitioner.active = result.active;
						practitioner.gpCode = result.gpCode;
					},
					(error) => console.log(error)
				);
		}

		return practitioner;
	}

	private _organisations : Map<string, UIOrganisation> = new Map();
	public getOrganisation(organisationId : UIInternalIdentifier) : UIOrganisation {
		let hash = organisationId.resourceId + organisationId.systemId + organisationId.serviceId;

		let organisation : UIOrganisation = this._organisations.get(hash);
		if (!organisation) {
			organisation = new UIOrganisation();
			this._organisations.set(hash, organisation);

			organisation.name = 'Loading...';

			this.recordService.getOrganisation(organisationId)
				.subscribe(
					(result) => {
						organisation.name = result.name;
						organisation.odsCode = result.odsCode;
						organisation.address = result.address;
						organisation.type = result.type;
					},
					(error) => console.log(error)
				);
		}

		return organisation;
	}

	private _locations : Map<string, UILocation> = new Map();
	public getLocation(locationId : UIInternalIdentifier) : UILocation {
		let hash = locationId.resourceId + locationId.systemId + locationId.serviceId;

		let location : UILocation = this._locations.get(hash);
		if (!location) {
			location = new UILocation();
			this._locations.set(hash, location);

			location.name = 'Loading...';

			this.recordService.getLocation(locationId)
				.subscribe(
					(result) => {
						location.name = result.name;
						location.description = result.description;
					},
					(error) => console.log(error)
				);
		}

		return location;
	}
}