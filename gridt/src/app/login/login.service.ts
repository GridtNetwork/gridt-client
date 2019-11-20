import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _userIsAuthenticated = true;
  private _userId= 'abc';

  get userIsAuthenticated() {
    return this._userIsAuthenticated;
  }

  constructor() {}

  login() {
    this._userIsAuthenticated = true;
  }

  get userId() {
    return this._userId;
  }

  logout() {
    this._userIsAuthenticated = false;
  }
}