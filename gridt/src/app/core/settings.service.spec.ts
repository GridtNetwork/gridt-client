import {Type } from "@angular/core";
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { of, throwError, from } from "rxjs";
import { pluck, delay, concatMap } from 'rxjs/operators';

import { SettingsService } from './settings.service';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

import { Settings } from './settings.model';

import 'jasmine-marbles';
import { hot, cold } from 'jasmine-marbles';

import { HttpClient, HttpHeaders, HttpResponse, HttpHeaderResponse, HttpErrorResponse } from '@angular/common/http';

let mock_settings: Settings[];

describe("IdentityService", () => {
  let service: SettingsService;
  let auth: AuthService;
  let httpMock: HttpTestingController;
  let secStore: SecureStorageService;

  let authServiceStub: jasmine.SpyObj<AuthService>;
  let httpClientStub: jasmine.SpyObj<HttpClient>;
  let secStoreStub: jasmine.SpyObj<SecureStorageService>

  const default_headers = {
    headers: new HttpHeaders({
      Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
    })
  };

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [SettingsService, AuthService, SecureStorageService],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(SettingsService as Type<SettingsService>);
    auth = TestBed.get(AuthService as Type<AuthService>);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    secStore = TestBed.get(SecureStorageService as Type<SecureStorageService>);

    secStoreStub = jasmine.createSpyObj(
      'secStore', ['get$', 'set$', 'clear$', 'remove$']
    );

    httpClientStub = jasmine.createSpyObj(
      'httpClient', ['get', 'post']
    );

    authServiceStub = jasmine.createSpyObj(
      'auth', ['readyAuthentication$']
    );

    // All but a few tests presume a logged in state. readyAuthentication$ is
    // defined to always be able to login and easy to compare with the correct
    // headers. (This feature is important, as it makes or breaks communication
    // with the server.)
    authServiceStub.readyAuthentication$ = of(default_headers);


    // Create mock settings
    mock_settings = [
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
    ]
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
    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Populate the user settings with some mock settings
    service._user_settings$.next(mock_settings[0]);

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

    // Set some new settings

    for (var val in mock_settings) {
      // console.log(mock_settings[val]);
      service._user_settings$.next(mock_settings[val]);
    }

    // User setting should update
    expect(service.the_user_settings$).toBeObservable(cold('a',{a:mock_settings[3]}));

  });

  it('should combine settings from localStorage and from the server.', () => {
    // Populate localStorage

    // Fake server response

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

    // Expect response
    expect(set).toBeObservable(
      cold('a|', {a: mock_settings[0]})
    )
  });

  // Authentication
  it('should fail to read settings when not logged in', () => {
    authServiceStub.readyAuthentication$ = cold('#', null , "Can't authenticate: no credentials");

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Populate the user settings with some mock settings
    service._user_settings$.next(mock_settings[0]);

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

    // Make sure it at least tried to get local settings
    expect(secStoreStub.get$).toHaveBeenCalledWith('settings');

    // Make sure an error is raised
    expect(secStoreStub.get$).toThrow(new Error("Not available"))

  });

  it('should fail to update settings when not logged in', () => {
    authServiceStub.readyAuthentication$ = cold('#', null , "Can't authenticate: no credentials");

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Populate the user settings with some mock settings
    service._user_settings$.next(mock_settings[0]);

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

    // Try updating settings
    expect(service._user_settings$).toThrow(new Error("Server not available"))
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

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Populate the user settings with some mock settings
    service._user_settings$.next(mock_settings[0]);

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

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

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Populate settings
    service._user_settings$.next(mock_settings[0]);

    // Obtain the settings
    service.getUserSettings();

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

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
