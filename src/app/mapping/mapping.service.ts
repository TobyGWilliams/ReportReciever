import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export class DropboxFolder {
  constructor() {
    this.id = '';
    this.url = '';
    this.name = '';
    this.selected = false;
  }
  id: string;
  url: string;
  name: string;
  selected: boolean;
}

export class Mapping {
  constructor() {
    this.senderEmail = '';
    this.emailPrefix = '';
    this.renameFile = false;
  }
  senderEmail: string;
  emailPrefix: string;
  renameFile: boolean;
  folder: DropboxFolder;
}


@Injectable()
export class MappingService {
  private mappingUrl = 'api/mappings';
  public subject: Subject<Mapping[]>;
  constructor(private http: HttpClient) {
    this.subject = new Subject();
  }
  deleteMapping(d) {
    return this.http.delete(this.mappingUrl + '/' + d.urlSafe, d)
  }
  getMapping() {
    this.http.get<Mapping[]>(this.mappingUrl).subscribe((d) => {
      console.log(d);
      this.subject.next(d);
    });
  }
  postMapping(body) {
    console.log('mapping.service', 'postMapping', body);
    return this.http.post(this.mappingUrl, body);
  }
}

