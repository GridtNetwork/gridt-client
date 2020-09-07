import { Type } from "@angular/core";
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { of, throwError } from "rxjs";

import { SettingsService } from './settings.service';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

import { Identity } from './models/identity.model';

import 'jasmine-marbles';
import { hot, cold } from 'jasmine-marbles';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

let mock_identity: Identity[] = [
  {
    id: 1,
    username: "John Flosser",
    email: "Johnny@gridt.org",
    bio: "Flosses every single day and brushes twice a day too!",
    avatar: "abc"
  },
  {
    id: 2,
    username: "Cycling Joe",
    email: "peddel@gridt.org",
    bio: "Have the best days on the bike.",
    avatar: "abc"
  },
  {
    id: 3,
    username: "Moopy Zoo Lion",
    email: "lion@gridt.org",
    bio: "Growls verociously",
    avatar: "abc"
  },
  {
    id: 4,
    username: "Yo mamma",
    email: "yomamma@gridt.org",
    bio: "Don't make me mad",
    avatar: "abc"
  }
];

let service: SettingsService;
let httpMock: HttpTestingController;
let secStore: SecureStorageService;
let httpClientStub: jasmine.SpyObj<HttpClient>;
let secStoreStub: jasmine.SpyObj<SecureStorageService>

const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

describe("IdentityService_AuthSuccesfull", () => {

  class authServiceStub_succes {
    isLoggedIn$ = of(true);
    readyAuthentication$ = of(default_headers);
  }

  beforeEach( () => {

    secStoreStub = jasmine.createSpyObj(
      'secStore', ['get$', 'set$', 'clear$', 'remove$']
    );

    httpClientStub = jasmine.createSpyObj(
      'http', ['get', 'post']
    );

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_succes},
        {provide: SecureStorageService, useValue: secStoreStub},
        {provide: HttpClient, useValue: httpClientStub}
      ]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    secStore = TestBed.get(SecureStorageService as Type<SecureStorageService>);

  });

  // Basic functionality
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide the last available settings', () => {
    const source = hot('^-a-b---c', {
      a: mock_settings[1],
      b: mock_settings[2],
      c: mock_settings[3]
    })
    source.subscribe( (val) => service.set_identity(val))
    const expected = cold('--a-b---c', {
      a: mock_settings[1],
      b: mock_settings[2],
      c: mock_settings[3]
    });
    expect(service.the_user_settings$).toBeObservable(expected);
  });

  it('should combine settings from localStorage and from the server.', () => {
    // Populate localStorage
    secStoreStub.get$.and.returnValue(of(mock_settings[0]));

    // Fake server response
    httpClientStub.get.and.returnValue(of(mock_settings[1]));

    service.updateUserSettings();

    expect(service.identity$).toBeObservable(
      cold('a', {a: mock_settings[1]})
    );
  });

  // Local storage
  it('should create localStorage upon first retrieval of settings', () => {
    // Subscribe local storage
    service.identity$;

    // Update settings
    service.set_identity(mock_settings[1]);
    service.set_identity(mock_settings[2]);

    // Test if settings are stored in localStorage
    expect(secStoreStub.set$).toHaveBeenCalledWith('identity', mock_settings[2]);
  });

  it('should update localStorage when new settings are available', () => {
    // Populate the user settings with some mock settings
    service.set_identity(mock_settings[0]);

    // Subscribes the local storage to the user settings
    service.identity$;

    // LocalStorage
    service.set_identity(mock_settings[1]);

    // Test if the storage has been set
    expect(secStoreStub.set$).toHaveBeenCalledWith('identity', mock_settings[1]);
  });

  // Server calls
  it('should disable edits when the server is not available', () => {
    // Simulate the server not being reachable.
    httpClientStub.post.and.returnValue(throwError(
      new HttpErrorResponse(
        {
          status: 400, statusText: "Bad Request",
          error: { message: "Could not retreive settings from server." }
        }
    )));

    // Obtain the settings
    service.updateIdentity();

    // See if disabler it set to true
    expect(service.isDisabled$).toBeObservable(
      cold('(a)', {a: true})
    );
  });

  it('should display local settings when server settings are not available', () => {
    // Simulate the server not being reachable.
    httpClientStub.post.and.returnValue(throwError(
      new HttpErrorResponse(
        {
          status: 400, statusText: "Bad Request",
          error: { message: "Could not retreive settings from server." }
        }
    )));

    // Populate localStorage
    secStoreStub.get$.and.returnValue(of(mock_settings[0]));

    // Obtain the settings
    service.updateIdentity();

    // Make sure the local storage settings are returned
    expect(service.identity$).toBeObservable(cold('a',{a: mock_settings[0]}))
  })

});

describe("IdentityService_AuthFailed", () => {

  class authServiceStub_failed {
    isLoggedIn$ = of(false);
    readyAuthentication$ = throwError("Failed Authentication");
  }

  beforeEach( () => {

    secStoreStub = jasmine.createSpyObj(
      'secStore', ['get$', 'set$', 'clear$', 'remove$']
    );

    httpClientStub = jasmine.createSpyObj(
      'http', ['get', 'post']
    );

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_failed},
        {provide: SecureStorageService, useValue: secStoreStub},
        {provide: HttpClient, useValue: httpClientStub}
      ],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    secStore = TestBed.get(SecureStorageService as Type<SecureStorageService>);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fail to read local settings when not logged in', () => {
    expect(secStoreStub.get$).not.toHaveBeenCalledWith('settings');
  })

  it('should fail to update local settings when not logged in', () => {
    // Create subscription to localstorage
    service.identity$;

    // Make sure there are some settings available
    service.set_identity(mock_settings[0]);
    service.set_identity(mock_settings[1]);
    service.set_identity(mock_settings[2]);

    expect(secStoreStub.set$).not.toHaveBeenCalledWith('identity');
  });

});
