'use strict';

import { TeacherProjectService } from '../../services/teacherProjectService';

class ChooseStructureLocationController {
  groupNodes: any;
  projectId: number;
  structure: any;

  static $inject = ['$state', '$stateParams', 'ProjectService'];

  constructor(
    private $state: any,
    private $stateParams: any,
    private ProjectService: TeacherProjectService
  ) {
    this.groupNodes = this.ProjectService.getGroupNodesIdToOrder();
    this.projectId = $stateParams.projectId;
    this.structure = this.injectUniqueIds(this.$stateParams.structure);
  }

  insertAsFirstActivity() {
    this.addNodesToProject(this.structure.nodes);
    this.ProjectService.createNodeInside(
      this.structure.group,
      this.ProjectService.getStartGroupId()
    );
    this.saveAndGoBackToProjectHome();
  }

  insertAfterGroup(groupId) {
    this.addNodesToProject(this.structure.nodes);
    this.ProjectService.createNodeAfter(this.structure.group, groupId);
    this.saveAndGoBackToProjectHome();
  }

  addNodesToProject(nodes) {
    for (const node of nodes) {
      this.ProjectService.setIdToNode(node.id, node);
      this.ProjectService.addNode(node);
      this.ProjectService.applicationNodes.push(node);
    }
  }

  saveAndGoBackToProjectHome() {
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      this.ProjectService.refreshProject();
      this.$state.go('root.at.project');
    });
  }

  injectUniqueIds(structure) {
    structure.group.id = this.ProjectService.getNextAvailableGroupId();
    const oldToNewIds = this.ProjectService.getOldToNewIds(structure.nodes);
    return this.ProjectService.replaceOldIds(structure, oldToNewIds);
  }

  addStepsToGroup(group) {
    const node1 = this.ProjectService.createNodeAndAddToLocalStorage('Instructions');
    this.ProjectService.addNodeToGroup(node1, group);
    const htmlComponent = this.ProjectService.createComponent(node1.id, 'HTML');
    htmlComponent.html =
      'Here are your instructions. Do this activity and discuss with your peers.';
    const node2 = this.ProjectService.createNodeAndAddToLocalStorage('Gather Evidence');
    this.ProjectService.addNodeToGroup(node2, group);
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      this.ProjectService.refreshProject();
      this.$state.go('root.at.project');
    });
  }

  getNodeTitleByNodeId(nodeId: string): string {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  getNodePositionById(nodeId: string): string {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  cancel() {
    this.$state.go('root.at.project');
  }
}

export default ChooseStructureLocationController;
