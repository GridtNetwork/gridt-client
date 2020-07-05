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
          gravatar: "abc"
        }
      },
      {
        identity: {
          id: 2,
          username: "Cycling Joe",
          email: "peddel@gridt.org",
          bio: "Have the best days on the bike.",
          gravatar: "abc"
        }
      },
      {
        identity: {
          id: 3,
          username: "Moopy Zoo Lion",
          email: "lion@gridt.org",
          bio: "Growls verociously",
          gravatar: "abc"
        }
      },
      {
        identity: {
          id: 4,
          username: "Yo mamma",
          email: "yomamma@gridt.org",
          bio: "Don't make me mad",
          gravatar: "abc"
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

      from(mock_settings).pipe(
        concatMap(
          item => of(item).pipe(
            delay(10)
          )
        )
      ).subscribe(item => service._user_settings$.next(item))

      // User setting should update
      expect(service.the_user_settings$).toBeObservable(cold('abcd',{a:mock_settings[0], b:mock_settings[1], c: mock_settings[2], d:mock_settings[3]}));

  });

  it('should combine settings from localStorage and from the server.', () => {});

  // Authentication
  it('should fail to read settings when not logged in', () => {
    authServiceStub.readyAuthentication$ = cold('#', null , "Can't authenticate: no credentials");

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    
  });

  it('should fail to update settings when not logged in', () => {});

  // Local storage
  it('should create a localStorage with default values for new users', () => {});

  it('should have a non-empty localStorage when loged in', () => {});

  it('should do ???? when loged out', () => {});

  it('should update localStorage when new settings are available', () => {

    // Create a new settings service with the correct spied on services.
    service = new SettingsService(httpClientStub, authServiceStub, secStoreStub)

    // Populate the user settings with some mock settings
    service._user_settings$.next(mock_settings[0]);

    // Subscribes the local storage to the user settings
    const set = service.the_user_settings$;

    // Test if the storage has been set
    expect(secStoreStub.set$).toHaveBeenCalledWith('settings', mock_settings[0]);

  });

  it('should not store empty server responses', () => {});

  it('should inform the user when an update has been stored succesfully', () => {});

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
      cold('(a)', {a: true})
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

  it('should inform the user when an update has reached the server succesfully', () => {});

});
