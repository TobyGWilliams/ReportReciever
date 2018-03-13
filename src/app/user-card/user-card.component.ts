import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  MatAnchor,
  MatDialog,
  MatDialogRef,
  MatTable,
  MatSnackBar,
  MatSpinner,
  MatStepper,
  MatHorizontalStepper,
} from '@angular/material';

import { User, UsersService } from '../users/users.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper: MatHorizontalStepper;
  currentUser: any;
  stepperConfig: { status: boolean[], index: number };
  constructor(
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.stepperConfig = {
      status: [false, false, false, false],
      index: 0
    };
    this.usersService.currentUser.subscribe((d) => {
      this.currentUser = d;
      if (this.currentUser.user && this.currentUser.userModel) {
        this.stepperConfig.status = [true, true, true, true];
        this.stepperConfig.index = 2;
      }
      if (this.currentUser.user && !this.currentUser.userModel) {
        this.stepperConfig.status = [true, false, false, false];
        this.stepperConfig.index = 1;
      }
      if (!this.currentUser.user && !this.currentUser.userModel) {
        this.stepperConfig.status = [false, false, false, false];
        this.stepperConfig.index = 0;
      }
    });
    this.usersService.getCurrentUser();
  }
  ngAfterViewInit() { }
  signIn() {
    console.log('redirect user to sign in');
    window.location.href = this.currentUser.logInUrl;
  }
  provideCredentials() {
    console.log('redirect user to provide credentials');
    window.location.href = this.currentUser.credentialsURL;
  }
}
