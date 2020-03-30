import {Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { forkJoin } from "rxjs";
import { skip, take, toArray } from "rxjs/operators";

import { ApiService, AccessToken } from "./api.service";
import { Movement } from "./movement.model";
import { User } from './user.model';

function log_object(...objects: any[]): void {
  const loggers = objects.map(obj => JSON.stringify(obj));
  console.log(...loggers);
}

function generate_mock_token(expiration_date: Date): AccessToken {
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

function get_date(future: number): Date {
  const now = Date.now();
  return new Date(now + future);
}

const mock_movements: Movement[] = [
  {
    id: 10129312983,
    name: "Mock Name",
    short_description: "Mocking the short description",
    description: "I will mock description. You are a fool, description.",
    subscribed: false,
    interval: "daily"
  },
  {
    id: 1283912983123,
    name: "Another mocked movement",
    short_description: "This one only has a short description and no long one",
    subscribed: false,
    interval: "twice daily"
  },
  {
    id: 10023123,
    name: "Subscribed movement",
    short_description: "This movement is supposed to come from the server.",
    description: "We need some way to fake a response from the server, telling the client that it \
     is subscribed to this particular movement",
    subscribed: true,
    interval: "daily"
  },
  {
    id: 112312983,
    name: "Flossing",
    short_description: "Floss every day",
    description: "We floss every day because it is good for our theeth.",
    subscribed: true,
    interval: "daily"
  }
];

let mock_subscriptions: Movement[];

describe("ApiService", () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService],
      imports: [HttpClientTestingModule]
    });

    httpMock = TestBed.inject(HttpTestingController as Type<HttpTestingController>);
    service = TestBed.inject(ApiService as Type<ApiService>);
    mock_subscriptions = [...mock_movements].filter(m => m.subscribed);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should store a token upon login", (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));

    const loginObservable = service.login$("email", "password");
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
    expect(req.request.method).toEqual("POST");

    req.flush(mock_token);
  });

  it("should not be ready if the token has expired", () => {
    const mock_token = generate_mock_token(get_date(-3000));

    service.login$("email", "password").subscribe(_ => {
      service.isApiReady$.subscribe(
        val => expect(val).toBeFalsy()
      );
    });
    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    httpMock.expectOne(`${service.URL}/auth`);
  });

  it("should be logged out after failed authentication", (done: DoneFn) => {
    const login_observable = service.login$("email", "password").subscribe(
      _ => fail(),
      error => {
        expect(error).toBe("Could not login");
        done();
      }
    );

    const req = httpMock.expectOne(`${service.URL}/auth`);
    expect(req.request.method).toEqual("POST");

    req.flush(
      { "description": "Invalid credentials", "error": "Bad Request", "status_code": 401 },
      { status: 401, statusText: "Bad Request" }
    );
  });

  it("should be observable that registering succeeded", () => {
    service.register$("mockusername", "mockemail", "mockpassword").subscribe(
      message => expect(message).toBe("Succesfully created user."),
      error => fail()
    );

    const req = httpMock.expectOne(`${service.URL}/register`);
    expect(req.request.method).toEqual("POST");

    req.flush({ message: "Succesfully created user." });
  });

  it("should be observable that registering failed", () => {
    service.register$("mockusername", "mockemail", "mockpassword").subscribe(
      message => fail(),
      error => expect(error).toBe("Username already in use.")
    );

    const req = httpMock.expectOne(`${service.URL}/register`);
    expect(req.request.method).toEqual("POST");

    req.flush(
      { message: "Username already in use." },
      { status: 400, statusText: "Bad Request" }
    );
  });

  it("should be able to create movements", (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));
    service.login$("Email", "Password").subscribe(val => {
      expect(val).toBeTruthy();
      service.createMovement$({
        name: "Flossing",
        short_description: "Floss once a day",
        interval: "daily",
      }).subscribe(message => {
        expect(message).toBe("Successfully created movement.");
        done();
      },
        _ => fail()
      );
    });

    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    const createReq = httpMock.expectOne(`${service.URL}/movements`);
    expect(createReq.request.method).toEqual("POST");

    createReq.flush(
      { "message": "Successfully created movement." },
      { status: 201, statusText: "" }
    );
  });

  it("should fail to create a movement when not logged in.", (done: DoneFn) => {
    service.createMovement$({
      name: "Flossing",
      short_description: "Floss once a day",
      interval: "daily"
    }).subscribe(
      () => fail(),
      error => { expect(error).toEqual("Not logged in yet."); done(); },
    );
  });

  it("should be able to load movements", (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));
    const login = service.login$("Email", "Password");

    service.allMovements$.pipe(
      take(2),
      toArray()
    ).subscribe(
      observableHistory => expect(observableHistory).toEqual([[], mock_movements]),
      () => fail(),
      done
    );

    service.allMovements$.pipe(
      skip(2),
      take(1)
    ).subscribe(() => fail());

    login.subscribe(() => service.getAllMovements());

    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    const req = httpMock.expectOne(`${service.URL}/movements`);
    expect(req.request.method).toEqual("GET");

    req.flush(mock_movements);
  });

  it("should be able to inform the client when it failed to create a movement.", (done: DoneFn) => {
    const mock_token = generate_mock_token(get_date(30000));
    const login = service.login$("Email", "Password");

    login.subscribe(_ => service.createMovement$(mock_movements[0]).subscribe(
      () => fail(),
      message => {
        expect(message).toBe("Could not create movement, because movement name is already in use.");
        done();
      }
    ));

    httpMock.expectOne(`${service.URL}/auth`).flush(mock_token);

    const req = httpMock.expectOne(`${service.URL}/movements`);
    expect(req.request.method).toEqual("POST");

    req.flush(
      { message: "Could not create movement, because movement name is already in use." },
      { status: 400, statusText: "Bad Request" }
    );
  });

  it("should be able to request the subscribed movements", (done: DoneFn) => {
    service.subscriptions$.pipe(
      take(2),
      toArray()
    ).subscribe(
      (observableHistory) => expect(observableHistory).toEqual([[], mock_subscriptions]),
      () => fail(),
      done
    )

    service.subscriptions$.pipe(
      skip(2),
      take(1)
    ).subscribe(
      () => fail()
    )

    service.login$("Email", "Password").subscribe(
      () => service.getSubscriptions()
    );

    httpMock.expectOne(`${service.URL}/auth`).flush(generate_mock_token(get_date(30000)));
    const req = httpMock.expectOne(`${service.URL}/movements/subscriptions`);
    expect(req.request.method).toBe("GET");

    req.flush(mock_subscriptions);
  });

  it("should update movements after getting new movement.", (done: DoneFn) => {
    const flossing_movement = {
      name: "Flossing",
      short_description: "Floss every day",
      description: "We floss every day because it is good for our theeth.",
      subscribed: true,
      interval: "daily"
    } as Movement;

    let new_all_movements = [...mock_movements];
    new_all_movements.pop();
    new_all_movements.push(flossing_movement);

    service.allMovements$.pipe(
      skip(2),
      take(1)
    ).subscribe(
      (movements) => expect(movements).toBe(mock_movements),
      () => fail(),
      done
    );

    service.subscriptions$.pipe(
      skip(2),
      take(1)
    ).subscribe(
      (movements) => {
        mock_subscriptions.push(flossing_movement);
        expect(movements).toEqual(mock_subscriptions);
      },
      () => fail()
    )

    service.login$('Email', 'Password').subscribe(() => {
      service.getAllMovements();
      service.getSubscriptions();
      service.getMovement$("Flossing").subscribe();
    });

    httpMock.expectOne(`${service.URL}/auth`).flush(generate_mock_token(get_date(30000)));
    httpMock.expectOne(`${service.URL}/movements`).flush(mock_movements);
    httpMock.expectOne(`${service.URL}/movements/subscriptions`).flush(mock_subscriptions);
    httpMock.expectOne(`${service.URL}/movements/Flossing`).flush(flossing_movement);
  });

  it('should be able to swap a leader.', (done: DoneFn) => {
    // The reason for this copying is because somehow it was modifying what 
    // was in the response from the httpMock object. Hard copying it makes 
    // sure that this can never happen. However, for some reason the change 
    // already happens before here. It is unclear exactly when, making this 
    // test always succeed.
    const idiot_user = { id: 1, username: "idiot" } as User;
    mock_subscriptions[1].leaders = [idiot_user];
    const old_subscriptions = [...mock_subscriptions];

    const mock_user = { id: 2, username: "Good Leader Person" } as User;
    mock_subscriptions[1].leaders = [mock_user];
    const new_subscriptions = [...mock_subscriptions];
     
    service.login$('Email', 'Password').subscribe(() => {
      service.getSubscriptions();
      forkJoin({
        user: service.swapLeader$(old_subscriptions[1], idiot_user),
        subscriptions: service.subscriptions$.pipe( skip(1), take(1) )
      }).subscribe(
        (obj) => {
          expect(obj.user).toEqual(mock_user);

          log_object(obj.subscriptions);
          expect(obj.subscriptions).toEqual(new_subscriptions);
        },
        () => fail(),
        done
      );
    });
    
    httpMock.expectOne(`${service.URL}/auth`).flush(generate_mock_token(get_date(30000)));
    httpMock.expectOne(`${service.URL}/movements/subscriptions`).flush(old_subscriptions);
    httpMock.expectOne(`${service.URL}/movements/1/leader/1`).flush(mock_user);
  });
});
