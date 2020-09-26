import { Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { cold } from 'jasmine-marbles';
import { of, throwError } from "rxjs";

import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { SettingsService } from "./settings.service";
import { SecureStorageService } from './secure-storage.service';

import { Identity } from "./models/identity.model";

let service: SettingsService;
let auth: AuthService;
let api: ApiService;
let secStore: SecureStorageService;
let authServiceStub: jasmine.SpyObj<AuthService>;
let apiStub: jasmine.SpyObj<ApiService>;
let secStoreStub: jasmine.SpyObj<SecureStorageService>;
let httpClientStub: jasmine.SpyObj<HttpClient>;

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
    apiStub = jasmine.createSpyObj('ApiService', ['userIdentity$']);

    secStoreStub = jasmine.createSpyObj(
      'secStore', {'get$': of(mock_id[0]), 'set$': of(true), 'clear$': of(true), 'remove$': of(true)}
    );

    httpClientStub = jasmine.createSpyObj(
      'httpClient', ['get', 'post', 'put']
    );

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_failed},
        {provide: ApiService, useValue: apiStub},
        {provide: SecureStorageService, useValue: secStoreStub},
        {provide: HttpClient, useValue: httpClientStub}
      ]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    api = TestBed.get(ApiService as Type<ApiService>);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should return an empty identity", () => {
    // spyOn(api, 'userIdentity$').and.returnValue(of(mock_id[0]));
    api.userIdentity$ = of(mock_id[0]);
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(cold('a', {a: service.empty_identity}));
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
    apiStub = jasmine.createSpyObj('ApiService', ['userIdentity$']);

    secStoreStub = jasmine.createSpyObj(
      'secStore', {'get$': of(mock_id[0]), 'set$': of(true), 'clear$': of(true), 'remove$': of(true)}
    );

    httpClientStub = jasmine.createSpyObj(
      'httpClient', ['get', 'post', 'put']
    );

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_succes},
        {provide: ApiService, useValue: apiStub},
        {provide: SecureStorageService, useValue: secStoreStub},
        {provide: HttpClient, useValue: httpClientStub}
      ]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    api = TestBed.get(ApiService as Type<ApiService>);
  })

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should return the local id when server id is unavailable", () => {
    // When there is no internet, the identity must remain available.
    api.userIdentity$ = throwError("server unavailable");
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(cold('a',{a:mock_id[0]}));
  });

  it("should overwrite local id when server id differs", () => {
    // Make sure any updates of the ID are reflected in the local storage.
    api.userIdentity$ = of(mock_id[1]);
    service.updateIdentity();
    expect(secStoreStub.set$).toHaveBeenCalledWith("identity", mock_id[1]);
  });

  it("should not overwrite local id when local and server id are equal", () => {
    // Reduces number of calls
    api.userIdentity$ = of(mock_id[0]);
    service.updateIdentity();
    expect(secStoreStub.set$).not.toHaveBeenCalled();
  });

  it("should set local id with server id when local id is unavailable", () => {
    // This happens for new users, because their localstorage has not been set yet.
    secStoreStub.get$.and.returnValue(throwError("Oops, localstore not set yet"));
    api.userIdentity$ = of(mock_id[3]);
    service.updateIdentity();
    expect(secStoreStub.set$).toHaveBeenCalledWith("identity", mock_id[3]);
  });

  it("should return empty identity when local and server are unavailable", () => {
    // Safety feature to make sure it doesn't prevent a page from loading.
    secStoreStub.get$.and.returnValue(throwError("Oops, localstore not set yet"));
    api.userIdentity$ = throwError("Server not available");
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(cold('a',{a:service.empty_identity}));
  });

  it("should return local id when server and local id are equal", () => {
    //  Standard behaviour
    secStoreStub.get$.and.returnValue(of(mock_id[0]));
    api.userIdentity$ = of(mock_id[0]);
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(cold('a',{a: mock_id[0]}))
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
