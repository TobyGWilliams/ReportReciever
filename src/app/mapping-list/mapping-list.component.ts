import { Component, OnInit, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef, MatTable, MatSnackBar } from '@angular/material';
import { MappingNewComponent } from '../mapping-new/mapping-new.component';
import { Mapping, MappingService } from '../mapping/mapping.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-mapping-list',
  templateUrl: './mapping-list.component.html',
  styleUrls: ['./mapping-list.component.css']
})
export class MappingListComponent implements OnInit {
  dataSource: MappingDataSource;
  columnsToDisplay = ['folderName', 'emailPrefix', 'sender', 'created', 'renameFile', 'active', 'edit'];
  constructor(
    public dialog: MatDialog,
    private mappingService: MappingService,
    private zone: NgZone,
    public snackBar: MatSnackBar
  ) { }
  ngOnInit() {
    this.dataSource = new MappingDataSource(this.mappingService);
    this.mappingService.getMapping();
  }
  deleteMapping(data) {
    this.mappingService.deleteMapping(data).subscribe(() => {
      this.snackBar.open('Mapping deleted (refresh to see updated)', 'Close', { duration: 2000 });
      // this.mappingService.getMapping();
    });
  }
  openMappingNew() {
    console.log('Open!');
    const dialogRef = this.dialog.open(MappingNewComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(d => {
      console.log('Dialog closed!');
      this.mappingService.getMapping();
    });
  }
}

export class MappingDataSource extends DataSource<any> {
  constructor(private mappingService: MappingService) {
    super();
  }
  connect(): Observable<Mapping[]> {
    return this.mappingService.subject.asObservable();
  }
  disconnect() { }
}

