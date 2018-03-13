import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { Email } from './email';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class EmailsService {
  private emailsUrl = 'api/emails';
  constructor(private http: HttpClient) { }
  getEmails() {
    console.log('getEmails Service');
    return this.http.get<Email[]>(this.emailsUrl);
  }
}


