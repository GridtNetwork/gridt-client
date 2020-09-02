import {Type } from "@angular/core";
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { of, throwError, from } from "rxjs";
import { pluck, delay, concatMap, tap } from 'rxjs/operators';

import { SettingsService } from './settings.service';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

import { Settings } from './settings.model';

import 'jasmine-marbles';
import { hot, cold } from 'jasmine-marbles';

import { HttpClient, HttpHeaders, HttpResponse, HttpHeaderResponse, HttpErrorResponse } from '@angular/common/http';

let mock_settings: Settings[] = [
  {
    identity: {
      id: 1,
      username: "John Flosser",
      email: "Johnny@gridt.org",
      bio: "Flosses every single day and brushes twice a day too!",
      avatar: "abc"
    }
  },
  {
    identity: {
      id: 2,
      username: "Cycling Joe",
      email: "peddel@gridt.org",
      bio: "Have the best days on the bike.",
      avatar: "abc"
    }
  },
  {
    identity: {
      id: 3,
      username: "Moopy Zoo Lion",
      email: "lion@gridt.org",
      bio: "Growls verociously",
      avatar: "abc"
    }
  },
  {
    identity: {
      id: 4,
      username: "Yo mamma",
      email: "yomamma@gridt.org",
      bio: "Don't make me mad",
      avatar: "abc"
    }
  }
];

let service: SettingsService;
let auth: AuthService;
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
      ],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    auth = TestBed.get(AuthService as Type<AuthService>);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    secStore = TestBed.get(SecureStorageService as Type<SecureStorageService>);

  });

  // !!!!!!!!!!!!
  // Not completely clear why this is needed??? (It's also in api.service.spec)
  // !!!!!!!!!!!!
  afterEach(() => {
    httpMock.verify();
  });

  // Basic functionality
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide the last available settings', () => {
    for (var val in mock_settings) {
      service._user_settings$.next(mock_settings[val]);
    }
    expect(service.the_user_settings$).toBeObservable(cold('a',{a:mock_settings[3]}));
  });

  it('should combine settings from localStorage and from the server.', () => {
    // Populate localStorage
    secStoreStub.get$.and.returnValue(of(mock_settings[0]))

    // Fake server response
    httpClientStub.get.and.returnValue(of(mock_settings[1].identity))

    service.getUserSettings()

    // Expect response
    expect(service.the_user_settings$).toBeObservable(
      cold('a', {a: mock_settings[1]})
    )
  });

  // Local storage
  it('should have a non-empty localStorage when loged in', () => {
    // Simulate previous session login

    // Test if settings are available
  });

  it('should create localStorage when user logs in', () => {
    // Simulate login

    // Test if settings are obtained from server

    // Test if settings are stored in localStorage
  });

  it('should emove localStorage when logging out', () => {
    // Simulate login

    // Simulate logout

    // Make sure localstorage is empty
  });

  it('should update localStorage when new settings are available', () => {

    // Subscribes the local storage to the user settings
    service.the_user_settings$.subscribe();

    // Populate the user settings with some mock settings
    service._user_settings$.next(mock_settings[0]);

    // LocalStorage
    service._user_settings$.next(mock_settings[1]);

    // Server response
    service._user_settings$.next(mock_settings[2]);

    // Test if the storage has been set
    expect(secStoreStub.set$).toHaveBeenCalledWith('settings', mock_settings[2]);

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

    // Populate settings
    service._user_settings$.next(mock_settings[0]);

    // Obtain the settings
    service.getUserSettings();

    // See if disabler it set to true
    expect(service.isDisabled$).toBeObservable(
      cold('(a|)', {a: false})
    )

    // Try to make an edit

  });

  it('should send updated identity to the server only when the user sets new account identity', () => {
    // const resub_events =    "-l-s-u";
    // const expected_events = "-----u";
    // const empty_events =    "------";
    // const events = {
    //   l: {},          // Local storage sets settings
    //   s: {a: "A"},    // Server updates settings
    //   u: {a: "B"}     // User changes settings
    // };
    //
    // // TODO: make test values better
    // const fake_resub = hot(resub_events, events);
    // const expected = cold(expected_events, events);
    // const expected_empty = cold(empty_events, events);
    //
    // expect(fake_resub.pipe(
    //   pluck("a"),
    //   special_pipe
    // )).toBeObservable(expected);
    //
    // expect(fake_resub.pipe(
    //   pluck("z"),
    //   special_pipe
    // )).toBeObservable(expected_empty);
  });

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

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        {provide: AuthService, useClass: authServiceStub_failed},
        {provide: SecureStorageService, useValue: secStoreStub}
      ],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    auth = TestBed.get(AuthService as Type<AuthService>);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    secStore = TestBed.get(SecureStorageService as Type<SecureStorageService>);
  });

  // !!!!!!!!!!!!
  // Not completely clear why this is needed??? (It's also in api.service.spec)
  // !!!!!!!!!!!!
  afterEach(() => {
    httpMock.verify();
  });

  // Authentication
  it('should fail to read settings from server when not logged in', () => {

    // Make sure it returns an error when getting server settings
    expect(
      service.getServerIdentity$
    ).toBeObservable(cold("#", {}, "Failed Authentication"))

  });

  it('should not read local settings when not logged in', () => {
      expect(secStoreStub.get$).not.toHaveBeenCalledWith('settings');
  })

  it('should fail to update local settings when not logged in', () => {
  });

});
