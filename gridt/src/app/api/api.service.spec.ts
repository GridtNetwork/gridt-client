import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { forkJoin } from 'rxjs';
import { skip, take, flatMap } from 'rxjs/operators';

import { ApiService, AccessToken } from './api.service';
import { Movement } from './movement.model';
import { LoginGuard } from '../login/login.guard';
import { CompilerFacadeImpl } from '@angular/compiler/src/jit_compiler_facade';

function generate_mock_token (expiration_date: Date): AccessToken {
  const header = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9";
  const payload_object = {
    "exp": expiration_date.getTime() / 1000
  }
  const payload = btoa(JSON.stringify(payload_object));
  const signature = "mAhW2Z0m7mwM3Z3pjtu5Bt-bXu3EIDWHhXTGHOtm6MY";

  return {
    "access_token": `${header}.${payload}.${signature}`
  }
}

// I repeat
function get_date(future: number): Date {
  const now = Date.now();
  return new Date(now + future);
}

const mock_movements: Movement[] = [
  {
    name: "Mock Name",
    short_description: "Mocking the short description",
    description: "I will mock description. You are a fool, description.",
    subscribed: false,
    interval: {
      hours: 0,
      days: 3
    }
  },
  {
    name: "Another mocked movement",
    short_description: "This one only has a short description and no long one",
    subscribed: false,
    interval: {
      hours: 1,
      days: 0
    }
  },
  {
    name: "Subscribed movement",
    short_description: "This movement is supposed to come from the server.",
    description: "We need some way to fake a response from the server, telling the client that it is subscribed to this particular movement",
    subscribed: true,
    interval: {
      hours: 0,
      days: 2
    }
  }
];

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService],
      imports: [HttpClientTestingModule]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(ApiService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store a token upon login', (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));

    const loginObservable = service.login$('username', 'password');
    const firstLoggedIn = service.isLoggedIn$.pipe(take(1));
    const secondLoggedIn = service.isLoggedIn$.pipe(skip(1), take(1));
    const thirdLoggedIn = service.isLoggedIn$.pipe(skip(2), take(1));

    thirdLoggedIn.subscribe(
      _ => fail(),
      _ => fail()
    );

    forkJoin({
      first: firstLoggedIn,
      second: secondLoggedIn,
      login: loginObservable
    }).subscribe(val => {
      expect(val.first).toBeFalsy();
      expect(val.second).toBeTruthy();
      expect(val.login).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(`${service.URL}/auth`);
    expect(req.request.method).toEqual('POST');

    req.flush(mock_token);
  });

  it('should not be ready if the token has expired', () => {
    const mock_token = generate_mock_token(get_date(-3000));
    console.log(mock_token);
    service.login$('username', 'password').subscribe(_ => {
      service.isApiReady$.subscribe(
        val => expect(val).toBeFalsy()
      );
    });
    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    httpMock.expectOne(`${service.URL}/auth`);
  });

  it('should be logged out after failed authentication', (done: DoneFn) => {
    const login_observable = service.login$('username', 'password').subscribe(
      _ => fail(),
      error => {
        expect(error).toBe('Could not login');
        done();
      }
    );

    const req = httpMock.expectOne(`${service.URL}/auth`);
    expect(req.request.method).toEqual('POST');

    req.flush(
      {"description":"Invalid credentials","error":"Bad Request", "status_code":401},
      {status: 401, statusText: 'Bad Request' }
    );
  });

  it('should be observable that registering succeeded', () => {
    service.register$('mockusername', 'mockemail', 'mockpassword').subscribe(
      message => expect(message).toBe("Succesfully created user."),
      error => fail()
    );

    const req = httpMock.expectOne(`${service.URL}/register`);
    expect(req.request.method).toEqual('POST');

    req.flush({message: "Succesfully created user."});
  })

  it('should be observable that registering failed', () => {
      service.register$('mockusername', 'mockemail', 'mockpassword').subscribe(
      message => fail(),
      error => expect(error).toBe("Username already in use.")
    );

    const req = httpMock.expectOne(`${service.URL}/register`);
    expect(req.request.method).toEqual('POST');

    req.flush(
      {message: "Username already in use."},
      {status: 400, statusText: 'Bad Request' }
    );
  });

  it('should be able to create movevents', (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));
    service.login$('Username', 'Password').subscribe( val => {
      expect(val).toBeTruthy();
      service.createMovement$({
        name: 'Flossing',
        short_description: 'Floss once a day',
        interval: { days: 1, hours: 0 }
      }).subscribe(message => {
          expect(message).toBe("Successfully created movement.");
          done();
        },
        _ => fail()
      );
    });

    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);;

    const createReq = httpMock.expectOne(`${service.URL}/movements`);
    expect(createReq.request.method).toEqual('POST');

    createReq.flush(
      {"message": "Successfully created movement."},
      { status: 201, statusText: '' }
    );
  });

  it('should fail to create a movement when not logged in.', (done: DoneFn) => {
    service.createMovement$({
      name: 'Flossing',
      short_description: 'Floss once a day',
      interval: { days: 1, hours: 0 }
    }).subscribe(
       _ => fail(),
      error => {expect(error).toEqual("Not logged in yet."); done()},
    );
  });

  it('should be able to load movements', (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));
    const login = service.login$('Username', 'Password');

    login.subscribe(_ => {
      service.getAllMovements$().subscribe(
        movements => expect(movements).toBe(mock_movements),
        _ => fail(),
        done
      );
    });

    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    const req = httpMock.expectOne(`${service.URL}/movements`);
    expect(req.request.method).toEqual('GET');

    req.flush(mock_movements);
  });

  it('should be able to inform the client when it failed to create a movement.', (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));
    const login = service.login$('Username', 'Password');

    login.subscribe(_ => service.getAllMovements$().subscribe(
      () => fail(),
      message => {
        expect(message).toBe("Could not create movement, because movement name is already in use.");
        done();
      }
    ));

    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    const req = httpMock.expectOne(`${service.URL}/movements`);
    expect(req.request.method).toEqual("GET");

    req.flush(
      { message: "Could not create movement, because movement name is already in use." },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it("should be able to request the subscribed movements", (done: DoneFn) => {
    const subscribed_movements = mock_movements.filter(m => m.subscribed);

    service.login$("Username", "Password").pipe(
      flatMap(() => {
        return service.getSubscribedMovements$();
      })
    ).subscribe(
      (movements) => expect(movements).toBe(subscribed_movements),
      () => fail(),
      () => done()
    );

    httpMock.expectOne(`${service.URL}/auth`).flush(generate_mock_token(get_date(30000)));
    const req = httpMock.expectOne(`${service.URL}/movements/subscriptions`);
    expect(req.request.method).toBe("GET");

    req.flush(subscribed_movements);
  });

  it("should fail elegantly when the server breaks upon requesting subscriptions", (done: DoneFn) => {
    service.login$("Username", "Password").pipe(
      flatMap(() => {
        return service.getSubscribedMovements$();
      })
    ).subscribe(
      () => fail(),
      (error) => { expect(error).toBe("Oops, server error"); done(); }
    );

    httpMock.expectOne(`${service.URL}/auth`).flush(generate_mock_token(get_date(30000)));
    httpMock.expectOne(`${service.URL}/movements/subscriptions`).flush(
      {message: "Oops, server error"},
      {status: 400, statusText: "Server error"}
    );
  });
});
