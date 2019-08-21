import { Component, Inject } from '@angular/core';
import { TeacherService } from "../teacher.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatTableDataSource } from "@angular/material";
import { ShareItemDialogComponent } from "../../modules/library/share-item-dialog/share-item-dialog.component";
import { I18n } from '@ngx-translate/i18n-polyfill';
import { UserService } from '../../services/user.service';
import { TeacherRun } from '../teacher-run';
import { Run } from '../../domain/run';

@Component({
  selector: 'app-share-run-dialog',
  templateUrl: './share-run-dialog.component.html',
  styleUrls: ['./share-run-dialog.component.scss']
})
export class ShareRunDialogComponent extends ShareItemDialogComponent {

  run: TeacherRun;
  dataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>();
  displayedColumns: string[] = ['name', 'permissions'];
  duplicate: boolean = false;
  isTransfer: boolean = false;
  transferUnitWarning: boolean = false;

  constructor(public dialogRef: MatDialogRef<ShareItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public teacherService: TeacherService,
              private userService: UserService,
              public snackBar: MatSnackBar,
              i18n: I18n) {
    super(dialogRef, data, teacherService, snackBar, i18n);
    this.runId = data.run.id;
    this.run = new TeacherRun(data.run);
    this.project = data.run.project;
    this.projectId = data.run.project.id;
    this.populateSharedOwners(data.run.sharedOwners);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getSharedOwners().subscribe(sharedOwners => {
      let owners = [...sharedOwners];
      owners.reverse();
      this.updateSharedOwners(owners);
    });
  }

  updateSharedOwners(owners: any[]) {
    if (this.run.owner) {
      owners.unshift({
        sharedOwner: this.run.owner,
        isOwner: true
      });
    }
    this.dataSource = new MatTableDataSource(owners);
  }

  populatePermissions(sharedOwner) {
    this.addRunPermissions(sharedOwner);
    this.addProjectPermissions(sharedOwner);
  }

  addRunPermissions(sharedOwner) {
    this.setDefaultRunPermissions(sharedOwner);
    for (let permission of sharedOwner.permissions) {
      sharedOwner.runPermissions[permission] = true;
    }
  }

  setDefaultRunPermissions(sharedOwner) {
    sharedOwner.runPermissions = {
      1: true,  // View student work
      2: false,  // Grade and manage run
      3: false,  // View student names
      16: false  // Admin (read, write, share)
    };
  }

  setDefaultProjectPermissions(sharedOwner) {
    sharedOwner.projectPermissions = {
      1: false,  // View the project
      2: false,  // Edit the project
      16: false  // Admin (read, write, share)
    };
  }

  runPermissionChanged(sharedOwnerId, permissionId, isAddingPermission) {
    if (isAddingPermission) {
      this.teacherService.addSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
          .subscribe((response: any) => {
            if (response.status == "success") {
              this.addRunPermissionToSharedOwner(sharedOwnerId, permissionId);
            }
      });
    } else {
      this.teacherService.removeSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId);
          }
      });
    }
  }

  addRunPermissionToSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = true;
    this.snackBar.open(this.i18n('Sharing permissions updated for {{username}}.', {username: sharedOwner.username}));
  }

  removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = false;
    this.snackBar.open(this.i18n('Sharing permissions updated for {{username}}.', {username: sharedOwner.username}));
  }

  shareRun() {
    this.duplicate = false;
    const sharedOwnerUsername = this.teacherSearchControl.value;
    if (this.run.owner.username !== sharedOwnerUsername &&
        (!this.isSharedOwner(sharedOwnerUsername) || this.isTransfer)) {
      if (this.isTransfer) {
        this.transferUnitWarning = true;
      } else {
        this.teacherService.addSharedOwner(this.runId, sharedOwnerUsername)
            .subscribe(newSharedOwner => {
          this.setDefaultRunPermissions(newSharedOwner);
          this.setDefaultProjectPermissions(newSharedOwner);
          this.addSharedOwner(newSharedOwner);
          this.teacherSearchControl.setValue('');
        });
        document.getElementById("share-run-dialog-search").blur();
      }
    } else {
      this.duplicate = true;
    }
  }

  completeUnitOwnershipTransfer() {
    const newOwnerUsername = this.teacherSearchControl.value;
    this.teacherService.transferUnitOwnership(this.runId, newOwnerUsername)
        .subscribe(run => {
      if (run != null) {
        this.updateRunAndProjectPermissions(run);
        this.closeTransferUnitDialog();
      }
      this.teacherSearchControl.setValue('');
    });
  }

  updateRunAndProjectPermissions(run) {
    // const oldOwner = this.data.run.owner;
    // newOwner.runPermissions = { 1: true, 2: true, 3: true, 16: true };
    // newOwner.projectPermissions = { 1: true, 2: true, 16: true };
    // newOwner.isOwner = true;
    // oldOwner.runPermissions = { 1: true, 2: true, 3: true, 16: false };
    // oldOwner.projectPermissions = { 1: true, 2: true, 16: false };
    // oldOwner.isOwner = false;
    // this.data.run = new TeacherRun(run);
    // this.data.run.shared = true;
    this.run = new TeacherRun(run);
    this.data.run = this.run;
    this.transferUnitOwnership(this.run);
    // this.data.run.sharedOwners = sharedOwners;

    // console.log(sharedOwners);
    this.updateSharedOwners(this.run.sharedOwners);
  }

  isOwner() {
    return this.run.isOwner(this.userService.getUserId());
  }

  unshareRun(sharedOwner) {
    this.teacherService.removeSharedOwner(this.runId, sharedOwner.username)
        .subscribe((response) => {
      this.removeSharedOwner(sharedOwner);
    });
  }

  openTransferUnitDialog() {
    this.isTransfer = true;
  }

  closeTransferUnitDialog() {
    this.isTransfer = false;
    this.transferUnitWarning = false;
  }
}
