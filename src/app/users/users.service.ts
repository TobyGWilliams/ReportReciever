import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { environment } from '../../environments/environment';

export class User {
  approved: boolean;
  user: UserDetails;
}

export class UserDetails {
  email: string;
  nickname: string;
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class UsersService {
  public currentUser: Subject<any>;
  private usersUrl = 'api/users';
  private currentUserUrl = 'api/user';
  constructor(private http: HttpClient) {
    this.currentUser = new Subject();
    console.log('environment:', environment.production);
  }
  getCurrentUser() {
    if (environment.production) {
      this.http.get<User>(this.currentUserUrl).subscribe(d => this.currentUser.next(d));
    } else { // testing!
      const user = {
        credentialsURL: '/api/creds',
        logInUrl: '/_ah/login?continue=http%3A//localhost%3A8080/home',
        logOutUrl: '/_ah/logout?continue=http%3A//localhost%3A8080/home',
        user: { auth_domain: 'gmail.com', email: 'mockedUser@example.com', nickname: 'Mocked Nickname' },
        userModel: {
          user: {
            auth_domain: 'gmail.com',
            email: 'mockedUser@example.com',
            nickname: 'Mocked Nickname',
          },
          urlSafe: 'ahlkZXZ-ZW1haWwtcmVwb3J0LXJlY2VpdmVychYLEglVc2VyTW9kZWwYgICAgIDUvgkM',
          approved: false,
          credentials: 'token'
        }
      };
      const user_signedInNotAuth = {
        credentialsURL: '/api/creds',
        logInUrl: '/_ah/login?continue=http%3A//localhost%3A8080/home',
        logOutUrl: '/_ah/logout?continue=http%3A//localhost%3A8080/home',
        user: { auth_domain: 'gmail.com', email: 'mockedUser@example.com', nickname: 'Mocked Nickname' }
      };
      const user_notsignedin = {
        logInUrl: '/_ah/login?continue=http%3A//localhost%3A8080/home',
      };
      this.currentUser.next(user_signedInNotAuth);
      console.log(user_signedInNotAuth);
    }
  }
  getUsers() {
    return this.http.get<User[]>(this.usersUrl);
  }
}
