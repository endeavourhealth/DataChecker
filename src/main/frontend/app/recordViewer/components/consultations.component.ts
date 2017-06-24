import {Component, Input, ViewChild, OnChanges} from "@angular/core";
import {UIEncounter} from "../models/resources/clinical/UIEncounter";
import moment = require("moment");
import Moment = moment.Moment;
import {TreeComponent} from "angular2-tree-component";
import {linq} from "eds-common-js";
import {TreeNode} from "../models/TreeNode";
import {UIEpisodeOfCare} from "../models/resources/clinical/UIEpisodeOfCare";

@Component({
	selector : 'consultations',
	template : require('./consultations.html')
})
export class ConsultationsComponent implements OnChanges {
	@Input() consultations : UIEncounter[] = [];
	@Input() episodes : UIEpisodeOfCare[];
	@ViewChild(TreeComponent) tree: TreeComponent;
	dateTreeData : TreeNode[] = [];
	filteredConsultations : UIEncounter[] = [];

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

		if (this.consultations) {
			this.consultations = linq(this.consultations)
				.OrderByDescending(c => c.period.start.date)
				.ToArray();

			for (let encounter of this.consultations) {
				let encounterDate: Moment = moment(encounter.period.start.date);
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
		let node = this.tree.treeModel.getFirstRoot();
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
				id : moment.milliseconds() * root.id,
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
				id : moment.milliseconds() * root.id,
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
				id : moment.milliseconds() * root.id,
				title : moment.format("YYYY"),
				data : [],
				children : []
			};
			root.children.push(yearNode);
		}

		return yearNode;
	}

}