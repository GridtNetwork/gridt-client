import { Type } from "@angular/core";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { cold } from 'jasmine-marbles';
import { of, throwError, timer, asyncScheduler } from "rxjs";
import { take, flatMap } from "rxjs/operators"

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
      'secStore', {
        'get$': of(JSON.stringify(mock_id[0])),
        'set$': of(true),
        'clear$': of(true),
        'remove$': of(true)
      }
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
    apiStub.userIdentity$.and.returnValue(of(mock_id[0]));
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(
      cold('a', {a: service.empty_identity})
    );
  });

  it("should fail to set local identity when not logged in", () => {
    let error = service.error_codes.SETIDFAIL + ": " + service.error_codes.NOTLOGGEDIN;
    expect(service.setLocalIdentity$(mock_id[0])).toBeObservable(
      cold('#', null, error)
    );
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
    jasmine.clock().install();

    apiStub = jasmine.createSpyObj('api', {'userIdentity$': mock_id[0]});

    secStoreStub = jasmine.createSpyObj(
      'secStore', {
        'get$'    : of(JSON.stringify(mock_id[0])),
        'set$'    : of(true),
        'clear$'  : of(true),
        'remove$' : of(true)
      }
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

  });

  afterEach( () => {
    jasmine.clock().uninstall();
  })

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should return the local id when server id is unavailable", () => {
    // When there is no internet, the identity must remain available.
    apiStub.userIdentity$.and.returnValue(throwError("server unavailable"));
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(cold('a',{a:mock_id[0]}));
  });

  it("should overwrite local id when server id differs", () => {
    // Make sure any updates of the ID are reflected in the local storage.
    apiStub.userIdentity$.and.returnValue(of(mock_id[1]));
    service.updateIdentity();
    expect(secStoreStub.set$).toHaveBeenCalledWith(
      "identity", JSON.stringify(mock_id[1])
    );
  });

  it("should not overwrite local id when local and server id are equal", () => {
    // Reduces number of calls
    apiStub.userIdentity$.and.returnValue(of(mock_id[0]));
    service.updateIdentity();
    expect(secStoreStub.set$).not.toHaveBeenCalled();
  });

  it("should set local id with server id when local id is unavailable", () => {
    // This happens for new users, because their localstorage has not been set yet.
    secStoreStub.get$.and.returnValue(throwError("Oops, localstore not set yet"));
    apiStub.userIdentity$.and.returnValue(of(mock_id[3]));
    service.updateIdentity();
    expect(secStoreStub.set$).toHaveBeenCalledWith(
      "identity", JSON.stringify(mock_id[3])
    );
  });

  it("should return empty identity when local and server are unavailable", () => {
    // Safety feature to make sure it doesn't prevent a page from loading.
    secStoreStub.get$.and.returnValue(throwError("Oops, localstore not set yet"));
    apiStub.userIdentity$.and.returnValue(throwError("Server not available"));
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(
      cold('a',{a:service.empty_identity})
    );
  });

  it("should return local id when server and local id are equal", () => {
    //  Standard behaviour
    secStoreStub.get$.and.returnValue(of(JSON.stringify(mock_id[0])));
    apiStub.userIdentity$.and.returnValue(of(mock_id[0]));
    service.updateIdentity();
    expect(service.userIdentity$).toBeObservable(cold('a',{a: mock_id[0]}));
  });

  it("should deal with many async calls", () => {
    let mockIDs = {
      a: mock_id[0],
      b: mock_id[1],
      c: mock_id[2],
      e: service.empty_identity
    };

    /**
     * Tests the async behavior of userIdentity$.
     * - If both server and local identity are unavailable, emit empty ID.
     *   [step 1]
     * - When server ID is retreived, but local ID has not been set yet, store
     *   server ID in local and emit local ID. [step 2]
     * - When the server ID is different from local ID, overwrite local ID with
     *   the server ID. Then emit local ID. [step 3,9]
     * - If both the server and local identity agree, emit local ID. [step 4]
     * - If the server is unavailable but local ID is available, emit local ID.
     *   [step 5, 6]
     * - Only when updateIdentity() function is called should the userIdentity$
     *   change. [step 7,8]
     */
    let serverID            = cold('--abb-e--c--', mockIDs);
    let setLocalID          = cold('-------a--b-', mockIDs);
    let expectedUserID      = cold('e-abb-ba---c', mockIDs);
    let userIDUpdates       = cold('q-qqq-qq---q', {q: true});

    // Let server and local response be erronous at first
    apiStub.userIdentity$.and.returnValue(throwError("Server not available"));
    secStoreStub.get$.and.returnValue(throwError("Local storage not available"));

    serverID.subscribe( (id) => {
      apiStub.userIdentity$.and.returnValue(of(id));
    });

    setLocalID.subscribe( (id) => secStoreStub.get$.and.returnValue(
      of(JSON.stringify(id))
    ));

    // When secStore is set, make sure it now returns right value upon get.
    secStoreStub.set$.and.callFake( (key: string, value: any) => {
      secStoreStub.get$.and.returnValue(of(value));
      return of(true);
    });

    userIDUpdates.subscribe( () => service.updateIdentity() );

    expect(service.userIdentity$).toBeObservable(expectedUserID);
  });

  it("should wait for the server to respond", fakeAsync(() => {
    // let fake_now = new Date();
    // fake_now.setUTCHours(1,0,0,0);
    // jasmine.clock().mockDate(fake_now);

    apiStub.userIdentity$.and.returnValue(
      timer(30).pipe(
        take(1),
        flatMap( () => of(mock_id[1]))
      )
    );

    // When secStore is set, make sure it now returns right value upon get.
    secStoreStub.set$.and.callFake( (key: string, value: any) => {
      secStoreStub.get$.and.returnValue(of(value));
      return of(true);
    });

    service.updateIdentity();
    tick(15);
    expect(service.userIdentity$).toBeObservable(cold('',{}));
    tick(30);
    expect(service.userIdentity$).toBeObservable(cold('a',{a:mock_id[1]}));
  }));

  it("should be able to set the local user Identity", () => {
    expect(service.setLocalIdentity$(mock_id[0])).toBeObservable(
      cold('(a|)',{a: true})
    );
    expect(secStoreStub.set$).toHaveBeenCalledWith(
      "identity", JSON.stringify(mock_id[0])
    );
  });

  it("should be able to get the user's local Identity", () => {
    expect(service.localIdentity$).toBeObservable(cold('(a|)',{a: mock_id[0]}));
    expect(secStoreStub.get$).toHaveBeenCalledWith("identity");
  });
});
