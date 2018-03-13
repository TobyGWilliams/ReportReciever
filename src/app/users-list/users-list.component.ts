import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource, MatSort } from '@angular/material';

import { DatePipe } from '@angular/common';
import { MatAnchor } from '@angular/material';

import { DataSource } from '@angular/cdk/collections';

import { User, UsersService } from '../users/users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  columnsToDisplay = ['approved', 'nickname', 'email', 'domain'];
  dataSource = new UserDataSource(this.usersService);
  constructor(private usersService: UsersService) { }
  ngOnInit() {
    // this.usersService.getUsers().subscribe(d => console.log(d));
  }
}


export class UserDataSource extends DataSource<any> {
  constructor(private usersService: UsersService) {
    super();
  }
  connect(): Observable<User[]> {
    return this.usersService.getUsers();
  }
  disconnect() { }
}
