import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { EmailsService } from '../emails/emails.service';
import { Email } from '../emails/email';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource, MatSort, Sort } from '@angular/material';

import { DatePipe } from '@angular/common';
import { MatAnchor } from '@angular/material';

import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-emails-list',
  templateUrl: './emails-list.component.html',
  styleUrls: ['./emails-list.component.css']
})
export class EmailsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  dataSource: EmailDataSource;
  columnsToDisplay = ['subject', 'sender', 'to', 'created', 'numberOfAttachments'];
  constructor(private emailsService: EmailsService) { }
  ngOnInit() {
    this.dataSource = new EmailDataSource(this.emailsService);
    this.sort = new MatSort();
  }
  ngAfterViewInit() { }
  sortData(d) {
    console.log(d);
  }
}

export class EmailDataSource extends DataSource<any> {
  constructor(private emailsService: EmailsService) {
    super();
  }
  connect(): Observable<Email[]> {
    return this.emailsService.getEmails();
  }
  disconnect() { }
  sort(data) {
    console.log('sort the data', data);
    this.connect();
    return [];
  }
}
