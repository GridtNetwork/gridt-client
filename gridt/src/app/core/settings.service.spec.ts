import { Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { cold } from 'jasmine-marbles';
import { of, throwError } from "rxjs";

import { AuthService } from './auth.service';
import { SettingsService } from "./settings.service";
import { SecureStorageService } from './secure-storage.service';

import { Identity } from "./models/identity.model";

let service: SettingsService;
let auth: AuthService;
let secStore: SecureStorageService;
let authServiceStub: jasmine.SpyObj<AuthService>;
let secStoreStub: jasmine.SpyObj<SecureStorageService>;

let mock_id: Identity[] = [
  {
    id: 1,
    username: "ALittleOne",
    bio: "Less then one foot tall.",
    email: "a_little@one.com",
    avatar: "arandomstring"
  },
  {
    id: 2,
    username: "JoeFlosser",
    bio: "Clean as ever.",
    email: "joe@flosser.com",
    avatar: "arandomstring"
  },
  {
    id: 3,
    username: "YoMamma",
    bio: "When I walk by, you experience a solar eclipse.",
    email: "YoMamma@isfat.com",
    avatar: "arandomstring"
  }
];

const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

class authServiceStub_succes {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers);
};

class authServiceStub_failed {
  isLoggedIn$ = of(false);
  readyAuthentication$ = throwError("Can't authenticate: no credentials");
};

describe("SettingsService when authentication fails", () => {
  beforeEach( () => {
    secStoreStub = jasmine.createSpyObj(
      'secStore', {'get$': of(mock_id[0]), 'set$': of(true), 'clear$': of(true), 'remove$': of(true)}
    );

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_failed},
        {provide: SecureStorageService, useValue: secStoreStub},
      ]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fail to set local identity when not logged in", () => {
    let error = service.error_codes.SETIDFAIL + ": " + service.error_codes.NOTLOGGEDIN;
    expect(service.setLocalIdentity$(mock_id[0])).toBeObservable(cold('#', null, error));
    expect(secStoreStub.set$).not.toHaveBeenCalled();
  });

  it("should fail to get local identity when not logged in", () => {
    let error = service.error_codes.GETIDFAIL + ": " + service.error_codes.NOTLOGGEDIN;
    expect(service.localIdentity$).toBeObservable(cold('#', null, error));
    expect(secStoreStub.get$).not.toHaveBeenCalled();
  });
});

describe("SettingsService when authentication is succesful", () => {
  beforeEach( () => {
    secStoreStub = jasmine.createSpyObj(
      'secStore', {'get$': of(mock_id[0]), 'set$': of(true), 'clear$': of(true), 'remove$': of(true)}
    );

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_succes},
        {provide: SecureStorageService, useValue: secStoreStub},
      ]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
  })

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should be able to set the local user Identity", () => {
    expect(service.setLocalIdentity$(mock_id[0])).toBeObservable(cold('(a|)',{a: true}));
    expect(secStoreStub.set$).toHaveBeenCalledWith("identity", mock_id[0]);
  })

  it("should be able to get the user's local Identity", () => {
    expect(service.localIdentity$).toBeObservable(cold('(a|)',{a: mock_id[0]}));
    expect(secStoreStub.get$).toHaveBeenCalledWith("identity");
  })
});
