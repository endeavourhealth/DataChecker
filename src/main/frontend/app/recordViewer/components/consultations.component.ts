import {Component, Input, ViewChild, OnChanges, AfterViewInit} from "@angular/core";
import {UIEncounter} from "../models/resources/clinical/UIEncounter";
import moment = require("moment");
import Moment = moment.Moment;
import {TreeComponent} from "angular2-tree-component";
import {linq} from "eds-common-js";
import {TreeNode} from "../models/TreeNode";
import {UIEpisodeOfCare} from "../models/resources/clinical/UIEpisodeOfCare";
import {UIPractitioner} from "../models/resources/admin/UIPractitioner";
import {AdminCacheService} from "../adminCache.service";
import {UIHumanName} from "../models/types/UIHumanName";
import {UIInternalIdentifier} from "../models/UIInternalIdentifier";
import {UIOrganisation} from "../models/resources/admin/UIOrganisation";
import {UILocation} from "../models/resources/admin/UILocation";
import {AdminCacheBaseComponent} from "./adminCacheBaseComponent";

@Component({
	selector : 'consultations',
	template : require('./consultations.html')
})
export class ConsultationsComponent extends AdminCacheBaseComponent implements OnChanges {
	@Input() consultations : UIEncounter[] = [];
	@Input() episodes : UIEpisodeOfCare[] = [];
	@Input() filterEpisode : UIEpisodeOfCare;
	@ViewChild(TreeComponent) tree: TreeComponent;

	episodeMap : Map<string, TreeNode>;
	dateTreeData : TreeNode[] = [];
	filteredConsultations : UIEncounter[] = [];

	constructor(adminCache : AdminCacheService) {
		super(adminCache);
	}

	ngOnChanges(): void {
		this.dateTreeData = [
			{
				id: 0,
				title: 'All',
				data: this.consultations,
				children: []
			},
			{
				id: -1,
				title: 'Episodes',
				data: [],
				children: []
			},
			{
				id: 1,
				title: 'Encounters',
				data: [],
				children: []
			}
		];

		this.episodeMap = new Map();

		for (let episode of this.episodes) {
			let episodeDate: Moment = moment(episode.period.start.date);
			let episodeNode: TreeNode = {
				id: -episodeDate.valueOf(),
				title: episodeDate.format("DD-MMM-YYYY"),
				data: [],
				children: []
			};

			this.dateTreeData[1].children.push(episodeNode);
			this.episodeMap.set(episode.id, episodeNode);
		}

		if (this.consultations) {
			this.consultations = linq(this.consultations)
				.OrderByDescending(c => c.period.start.date)
				.ToArray();

			for (let encounter of this.consultations) {
				let encounterDate: Moment = moment(encounter.period.start.date);

				if (encounter.episodeOfCare) {
					let node: TreeNode = this.episodeMap.get(encounter.episodeOfCare);
					if (node)
						node.data.push(encounter);
				}

				this.getDateNode(this.dateTreeData[2], encounterDate).data.push(encounter);
			}

			this.tree.treeModel.update();
		}
	}

	onInitialized() {
		// Check for and restore saved filter state
		this.onUpdateData();
	}

	onUpdateData() {
		let node = null;
		if (this.filterEpisode) {
			let episodeDate: Moment = moment(this.filterEpisode.period.start.date);
			node = this.tree.treeModel.getNodeById(-episodeDate.valueOf());
		} else {
			node = this.tree.treeModel.getFirstRoot();
		}

		if (node)
			node.setActiveAndVisible();

	}

	selectDate(selection) {
		this.filteredConsultations = [];
		this.addNodeData(selection);
	}

	addNodeData(node : TreeNode) {
		if (node.data && node.data.length > 0)
			this.filteredConsultations = this.filteredConsultations.concat(node.data);

		if (node.children){
			for(let childNode of node.children)
				this.addNodeData(childNode);
		}
	}

	getDateNode(root : TreeNode, moment : Moment) : TreeNode {
		let monthNode : TreeNode = this.getMonthNode(root, moment);

		let dateNode : TreeNode = monthNode.children.find((e) => { return e.title === moment.format("Do"); });
		if (!dateNode) {
			dateNode = {
				id : moment.valueOf(),
				title : moment.format("Do"),
				data : [],
				children : []
			};
			monthNode.children.push(dateNode);
		}

		return dateNode;
	}

	getMonthNode(root : TreeNode, moment : Moment) : TreeNode {
		let yearNode : TreeNode = this.getYearNode(root, moment);

		let monthNode : TreeNode = yearNode.children.find( (e) => { return e.title === moment.format("MMM"); });
		if (!monthNode) {
			monthNode = {
				id : moment.valueOf(),
				title : moment.format("MMM"),
				data : [],
				children : []
			};
			yearNode.children.push(monthNode);
		}

		return monthNode;
	}

	getYearNode(root : TreeNode, moment : Moment) : TreeNode {
		let yearNode : TreeNode = root.children.find( (e) => { return e.title === moment.format("YYYY"); });

		if (!yearNode) {
			yearNode = {
				id : moment.valueOf(),
				title : moment.format("YYYY"),
				data : [],
				children : []
			};
			root.children.push(yearNode);
		}

		return yearNode;
	}
}