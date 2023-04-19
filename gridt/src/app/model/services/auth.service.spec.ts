import { Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { AuthService } from './auth.service';
import { AccessToken } from '../interfaces/server-responses.model';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { pluck, map, tap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { SecureStorageService } from './secure-storage.service';
import { of, throwError, BehaviorSubject } from 'rxjs';
import 'jasmine-marbles';
import { cold } from 'jasmine-marbles';

function generate_mock_token(future: number): AccessToken {
  const expiration_date = new Date(Date.now() + future);

  const header = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9";
  const payload_object = {
    "exp": expiration_date.getTime() / 1000
  };
  const payload = btoa(JSON.stringify(payload_object));
  const signature = "mAhW2Z0m7mwM3Z3pjtu5Bt-bXu3EIDWHhXTGHOtm6MY";

  return {
    "access_token": `${header}.${payload}.${signature}`
  };
}

function assertDeepEqual(actual, expected) {
  expect(actual).toEqual(expected);
}

describe("AuthService", () => {
  let service: AuthService;
  let secStoreStub: jasmine.SpyObj<SecureStorageService>
  let httpClientStub: jasmine.SpyObj<HttpClient>

  let scheduler: TestScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, AuthService, SecureStorageService],
      imports: [HttpClientModule]
    });

    scheduler = new TestScheduler(assertDeepEqual);

    service = TestBed.get(AuthService as Type<AuthService>);

    httpClientStub = jasmine.createSpyObj(
      'http', ['get', 'post']
    );

    secStoreStub = jasmine.createSpyObj(
      'secStore', ['get$', 'set$', 'clear$', 'remove$']
    );
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should be logged in after succesful authentication and store crecentials', () => {
    const token = generate_mock_token(3000);

    secStoreStub.get$.and.returnValue(cold("#", null, `Key "token" not found in secure storage.`))
    secStoreStub.clear$.and.returnValue(cold("(t|)", {t: true}));
    secStoreStub.set$.and.callFake( (key:string, value: any) => {
      if (key == "email") {
        expect(value).toEqual('mock_email');
        return cold("(t|)", {t: true});
      }
      if (key == "password") {
        expect(value).toEqual('mock_password');
        return cold("(t|)", {t: true});
      }
      if (key == "token") {
        expect(value).toEqual(token.access_token);
        return cold("(t|)", {t: true});
      }
      else {
        fail("Got unexpected set$ call.");
      }
    });

    httpClientStub.post.and.callFake((url: string, body: any) => {
      expect(url).toEqual("https://api.gridt.org/auth")
      expect(body).toEqual({username: "mock_email", password: "mock_password"});
      return cold("(r|)", {r: token})
    });

    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.login$("mock_email", "mock_password")).toBeObservable(cold("(t|)", {t: true}));
  });

  it('should be logged in if a token is available', () => {
    const httpClientStub: jasmine.SpyObj<HttpClient> = jasmine.createSpyObj(
      'http', ['post']
    );

    const secStoreStub: jasmine.SpyObj<SecureStorageService> = jasmine.createSpyObj(
      'secStore', ['get$']
    );

    secStoreStub.get$.and.returnValue(cold('(t|)', {t: "jwttoken"}));
    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.isLoggedIn$).toBeObservable(cold('(t|)', {t: true}));
  })

  it('should be ready after succesful authentication', async () => {
    const mock_token = generate_mock_token(3000);
    secStoreStub.get$.and.returnValue(cold('(t|)', {t: mock_token.access_token}).pipe( tap( () => console.log('Token given'))))

    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.readyAuthentication$.pipe(
      pluck("headers"),
      map(headers => headers.get("Authorization"))
    )).toBeObservable(cold('(a|)', {
      a: `JWT ${mock_token.access_token}`
    }));
  });

  it('should not be ready if not logged in', () => {
    secStoreStub.get$.and.callFake((key:string) => cold("#", null, `Key "${key}" does not exist in the secure storage.`))
    secStoreStub.clear$.and.returnValue(of(true));

    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.readyAuthentication$).toBeObservable(cold("#", null, "Can't authenticate: no credentials"));
  });

  it('should be ready when not logged in, but previous credentials are available', () => {
    const mock_token = generate_mock_token(3000);
    httpClientStub.post.and.returnValue(cold('(m|)', {m: mock_token}));

    secStoreStub.set$.and.returnValue(cold('(t|)', {t: true}));
    secStoreStub.get$.and.callFake( (key: string) => {
      switch (key) {
        case "token":
          return cold("#", null, 'Key "token" does not exist in the secure storage.');
        case "email":
          return cold("(e|)", {e: "mock_email"});
        case "password":
          return cold("(p|)", {p: "mock_password"});
      }
    });

    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.readyAuthentication$.pipe(
      pluck("headers"),
      map(headers => headers.get("Authorization"))
    )).toBeObservable(
      cold('(h|)', {
        h:`JWT ${mock_token.access_token}`
      })
    );
  });

  it('should not be ready when not logged in, but previous credentials' +
 'are available but invalid', () => {
    secStoreStub.get$.and.callFake((key: string) => {
      switch (key) {
        case "token":
          return cold("#", {error: 'Key "token" does not exist in the secure storage.'});
        case "email":
          return cold("(e|)", {e: "mock_email"});
        case "password":
          return cold("(p|)", {p: "mock_password"});
      }
    });

    httpClientStub.post.and.returnValue(
      of(new HttpErrorResponse({
        status: 401, statusText: "Bad Request",
        error: {
          "description": "Invalid credentials",
          "error": "Bad Request",
          "status_code": 401 }
      }))
    );

    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.readyAuthentication$).toBeObservable(
      cold("#", {error: "Authentication unsuccessful: invalid credentials"})
    );
  });

  it('should try to refresh the token if it is expired before being ready', () => {
    const old_token = generate_mock_token(-3000).access_token;
    const new_token = generate_mock_token(3000).access_token;

    const token_sub = new BehaviorSubject(old_token);

    httpClientStub.post.and.returnValue(of({access_token: new_token} as AccessToken));

    secStoreStub.get$.and.callFake( function foo (key: string) {
      switch (key) {
        case "token":
          return token_sub.asObservable().pipe(take(1));
        case "email":
          return of("mock_email");
        case "password":
          return of("mock_password");
      }
    });

    secStoreStub.set$.and.callFake( (key: string, value: string) => {
      expect(key).toBe("token");
      expect(value).toBe(new_token);
      token_sub.next(new_token);
      return cold("(t|)", {t: true});
    });

    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.readyAuthentication$.pipe(
      pluck("headers"),
      map( headers => headers.get("Authorization") )
    )).toBeObservable(cold('(m|)', {m: `JWT ${new_token}`}));

    expect(httpClientStub.post).toHaveBeenCalledWith(
      'https://api.gridt.org/auth',
      {username: "mock_email", password: "mock_password"}
    )
  });

  it("should clear the secure storage when logging out", () => {
    secStoreStub.get$.and.returnValue(throwError("Should not be called"));
    secStoreStub.clear$.and.returnValue(of(true));
    service = new AuthService(httpClientStub, secStoreStub);

    service.logout();
    expect(secStoreStub.clear$).toHaveBeenCalled();
  });

  it("should be observable that registering succeeded", () => {
    httpClientStub.post.and.returnValue(of({ message: "Succesfully created user." }));
    secStoreStub.get$.and.returnValue(of());
    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.register$("mockusername", "mockemail", "mockpassword", "mock_key")).toBeObservable(
      cold("(s|)", {
        s:"Succesfully created user."
      })
    );

    expect(httpClientStub.post).toHaveBeenCalledWith(
      'https://api.gridt.org/register',
      {
        username: "mockusername",
        email: "mockemail",
        password: "mockpassword",
        admin_key: "mock_key"
      }
    );
  });

  it("should be observable that registering failed", () => {
    httpClientStub.post.and.returnValue(throwError(
      new HttpErrorResponse({
        error: { message: "Username already in use." },
        status: 400, statusText: "Bad Request"
      })
    ));
    secStoreStub.get$.and.returnValue(of());
    service = new AuthService(httpClientStub, secStoreStub);

    expect(service.register$("mockusername", "mockemail", "mockpassword", "mock_key")).toBeObservable(
      cold("#", null, "Username already in use.")
    );
  });
});
