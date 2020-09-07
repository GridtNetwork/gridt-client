import {Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { forkJoin, of, throwError } from "rxjs";
import { skip, take, toArray } from "rxjs/operators";

import { ApiService } from "./api.service";
import { Movement } from "./models/movement.model";
import { User } from './models/user.model';
import { AuthService } from './auth.service';

import { cold } from 'jasmine-marbles';
import { HttpClient, HttpHeaders, HttpResponse, HttpHeaderResponse, HttpErrorResponse } from '@angular/common/http';

let mock_movements: Movement[];
let mock_subscriptions: Movement[];

describe("ApiService", () => {
  let service: ApiService;
  let auth: AuthService;
  let httpMock: HttpTestingController;
  let httpClientStub: jasmine.SpyObj<HttpClient>;
  let authServiceStub: jasmine.SpyObj<AuthService>;

  const default_headers = {
    headers: new HttpHeaders({
      Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
    })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, AuthService],
      imports: [HttpClientTestingModule]
    });

    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    service = TestBed.get(ApiService as Type<ApiService>);
    auth = TestBed.get(AuthService as Type<AuthService>);

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

    mock_movements = [
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
    mock_subscriptions = [...mock_movements].filter(m => m.subscribed);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should be able to create movements", () => {
    httpClientStub.post.and.returnValue(of(
      { "message": "Successfully created movement." }
    ));
    service = new ApiService(httpClientStub, authServiceStub);

    expect(service.createMovement$({
      name: "Flossing",
      short_description: "Floss once a day",
      interval: "daily",
    })).toBeObservable(
      cold("(s|)", {s: "Successfully created movement."})
    );

    expect(httpClientStub.post).toHaveBeenCalledWith(
      `${service.URL}/movements`,
      {
        name: "Flossing",
        short_description: "Floss once a day",
        interval: "daily",
      },
      default_headers
    );
  });

  it("should fail to create a movement when not logged in.", () => {
    authServiceStub.readyAuthentication$ = cold('#', null , "Can't authenticate: no credentials");
    service = new ApiService(httpClientStub, authServiceStub);

    expect(service.createMovement$({
      name: "Flossing",
      short_description: "Floss once a day",
      interval: "daily"
    })).toBeObservable(cold("#", null, "Can't authenticate: no credentials"));
  });

  it("should be able to request movements", () => {
    httpClientStub.get.and.returnValue(of(mock_movements));
    service = new ApiService(httpClientStub, authServiceStub);

    service.getAllMovements();

    expect(service.allMovements$).toBeObservable(
      cold('(m)', {e: [], m: mock_movements})
    );

    expect(httpClientStub.get).toHaveBeenCalledWith(
      `${service.URL}/movements`,
      default_headers
    );
  });

  it("should be able to inform the client when it failed to create a movement.", () => {
    httpClientStub.post.and.returnValue(throwError(
      new HttpErrorResponse(
        {
          status: 400, statusText: "Bad Request",
          error: { message: "Could not create movement, because movement name is already in use." }
        }
    )));
    service = new ApiService(httpClientStub, authServiceStub);

    expect(service.createMovement$(mock_movements[0])).toBeObservable(
      cold("#", null, "Could not create movement, because movement name is already in use.")
    )

    expect(httpClientStub.post).toHaveBeenCalledWith(
      `${service.URL}/movements`,
      mock_movements[0],
      default_headers
    );
  });

  it("should be able to request the subscribed movements", () => {
    httpClientStub.get.and.returnValue(of(mock_subscriptions));
    service = new ApiService(httpClientStub, authServiceStub);

    service.getSubscriptions();

    expect(service.subscriptions$).toBeObservable(
      cold('m', {m: mock_subscriptions})
    );

    expect(httpClientStub.get).toHaveBeenCalledWith(
      `${service.URL}/movements/subscriptions`,
      default_headers
    );
  });

  it("should update movements after getting new movement.", () => {
    const flossing_movement = {
      name: "Flossing",
      short_description: "Floss every day",
      description: "We floss every day because it is good for our theeth.",
      subscribed: true,
      interval: "daily"
    } as Movement;

    httpClientStub.get.and.returnValues(
      of(mock_movements),
      of(mock_subscriptions),
      of(flossing_movement)
    );

    service = new ApiService(httpClientStub, authServiceStub);

    service.getAllMovements();
    service.getSubscriptions();
    service.getMovement$("Flossing").subscribe();

    mock_movements.pop();
    mock_movements.push(flossing_movement);

    expect(service.allMovements$).toBeObservable(
      cold('m', {
        m: mock_movements
      })
    );

    expect(service.subscriptions$).toBeObservable(
      cold('m', {
        m: mock_movements.filter(m => m.subscribed)
      })
    );
  });

  it('should be able to swap a leader.', () => {
    const idiot_user = { id: 1, username: "idiot" } as User;
    mock_subscriptions[1].leaders = [idiot_user];
    const old_subscriptions = [...mock_subscriptions];

    const mock_user = { id: 2, username: "Good Leader Person" } as User;
    mock_subscriptions[1].leaders = [mock_user];
    const new_subscriptions = [...mock_subscriptions];

    httpClientStub.get.and.returnValue(of(old_subscriptions));
    httpClientStub.post.and.returnValue(of(mock_user));
    service = new ApiService(httpClientStub, authServiceStub);

    service.getSubscriptions();
    expect(service.swapLeader$(old_subscriptions[1], idiot_user)).toBeObservable(
      cold("(u|)", {u: mock_user})
    );
    expect(service.subscriptions$).toBeObservable(cold("s", {s: new_subscriptions}));

    const movement_id = old_subscriptions[1].id;

    expect(httpClientStub.get).toHaveBeenCalledWith(
      `${service.URL}/movements/subscriptions`,
      default_headers
    );

    expect(httpClientStub.post).toHaveBeenCalledWith(
      `${service.URL}/movements/${movement_id}/leader/1`,
      {},
      default_headers
    );
  });

  it('should fail to read settings from server when not logged in', () => {
    authServiceStub.readyAuthentication$ = cold('#', null , "Can't authenticate: no credentials");
    service = new ApiService(httpClientStub, authServiceStub);
    expect(
      service.getServerIdentity$
    ).toBeObservable(cold("#", {}, "Can't authenticate: no credentials"));
  });

});
