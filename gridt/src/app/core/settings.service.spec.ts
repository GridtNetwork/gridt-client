import { Type } from "@angular/core";
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { of, throwError } from "rxjs";

import { SettingsService } from './settings.service';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

import { Settings } from './settings.model';

import 'jasmine-marbles';
import { hot, cold } from 'jasmine-marbles';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

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
    for (var val in mock_settings) {
      service.set_user_settings(mock_settings[val]);
    }
    expect(service.the_user_settings$).toBeObservable(cold('a',{a:mock_settings[3]}));
  });

  it('should combine settings from localStorage and from the server.', () => {
    // Populate localStorage
    secStoreStub.get$.and.returnValue(of(mock_settings[0]));

    // Fake server response
    httpClientStub.get.and.returnValue(of(mock_settings[1].identity));

    service.updateUserSettings();

    // Expect server response to overwrite localstorage
    expect(service.the_user_settings$).toBeObservable(
      cold('a', {a: mock_settings[1]})
    );
  });

  // Local storage
  it('should create localStorage upon first retrieval of settings', () => {
    // Subscribe local storage
    service.the_user_settings$;

    // Update settings
    service.set_user_settings(mock_settings[1]);
    service.set_user_settings(mock_settings[2]);

    // Test if settings are stored in localStorage
    expect(secStoreStub.set$).toHaveBeenCalledWith('settings', mock_settings[2]);
  });

  it('should update localStorage when new settings are available', () => {
    // Populate the user settings with some mock settings
    service.set_user_settings(mock_settings[0]);

    // Subscribes the local storage to the user settings
    service.the_user_settings$;

    // LocalStorage
    service.set_user_settings(mock_settings[1]);

    // Test if the storage has been set
    expect(secStoreStub.set$).toHaveBeenCalledWith('settings', mock_settings[1]);
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
    service.updateUserSettings();

    // See if disabler it set to true
    expect(service.isDisabled$).toBeObservable(
      cold('(a  )', {a: true})
    );
  });

  it('should display local settings when server settings are not available', () => {

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
    service.the_user_settings$;

    // Make sure there are some settings available
    service.set_user_settings(mock_settings[0]);
    service.set_user_settings(mock_settings[1]);
    service.set_user_settings(mock_settings[2]);

    expect(secStoreStub.set$).not.toHaveBeenCalledWith('settings');
  });

  it('should not attempt to get server settings when not logged in', () => {})
});
