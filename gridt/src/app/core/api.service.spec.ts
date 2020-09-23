import { Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

import { cold } from 'jasmine-marbles';
import { of, throwError } from "rxjs";

import { AuthService } from './auth.service';
import { ApiService } from "./api.service";

import { Movement } from "./models/movement.model";
import { Identity } from "./models/identity.model";
import { User } from './models/user.model';

let mock_movements: Movement[] = [
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

let mock_identity: Identity[] = [
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

let service: ApiService;
let auth: AuthService;
let httpMock: HttpTestingController;
let httpClientStub: jasmine.SpyObj<HttpClient>;
let authServiceStub: jasmine.SpyObj<AuthService>;

class authServiceStub_succes {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers);
}

class authServiceStub_failed {
  isLoggedIn$ = of(false);
  readyAuthentication$ = throwError("Can't authenticate: no credentials");
}

describe("ApiService_failed_auth", () => {
  beforeEach(() => {
    httpClientStub = jasmine.createSpyObj(
      'httpClient', ['get', 'post', 'put']
    );

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {provide: AuthService, useClass: authServiceStub_failed},
        {provide: HttpClient, useValue: httpClientStub}
      ]
    });

    service = TestBed.get(ApiService as Type<ApiService>);

    mock_subscriptions = [...mock_movements].filter(m => m.subscribed);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fail to create a movement when not logged in.", () => {
    expect(service.createMovement$({
      name: "Flossing",
      short_description: "Floss once a day",
      interval: "daily"
    })).toBeObservable(cold("#", null, "Can't authenticate: no credentials"));
  });

  it('should fail to read identity from server when not logged in', () => {
    expect(
      service.userIdentity$
    ).toBeObservable(cold("#", {}, "Can't authenticate: no credentials"));
  });

  it('should fail to update bio when not logged in', () => {
    let mock_bio = "My very first bio."
    expect(service.changeBio$( mock_bio )).toBeTruthy( cold('#', null, "Can't authenticate: no credentials"));
  });

  it('should fail to update password when not logged in', () => {
    let old_password = "ABCDEF";
    let new_password = "abcdef";

    expect(service.changePassword$( old_password, new_password )).toBeTruthy( cold('#', null, "Can't authenticate: no credentials"));
  });
});

describe("ApiService_succesful_auth", () => {

  beforeEach(() => {
    httpClientStub = jasmine.createSpyObj(
      'httpClient', ['get', 'post', 'put']
    );

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {provide: AuthService, useClass: authServiceStub_succes},
        {provide: HttpClient, useValue: httpClientStub}
      ]
    });

    service = TestBed.get(ApiService as Type<ApiService>);

    mock_subscriptions = [...mock_movements].filter(m => m.subscribed);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should be able to create movements", () => {
    httpClientStub.post.and.returnValue(of(
      { "message": "Successfully created movement." }
    ));

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

  it("should be able to request movements", () => {
    httpClientStub.get.and.returnValue(of(mock_movements));

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

  it('should be able to retreive identity', () => {
    httpClientStub.get.and.returnValue(of(mock_identity[0]));

    expect(service.userIdentity$).toBeObservable(cold('(a|)',{a: mock_identity[0]}));
    expect(httpClientStub.get).toHaveBeenCalledWith(
      `${service.URL}/identity`,
      default_headers
    );
  });

  it('should be able to update the user bio', () => {
    httpClientStub.put.and.returnValue(of(
      { "message": "Succesfully updated bio." }
    ));

    let mock_bio = "My insanely good new bio.";

    expect(service.changeBio$( mock_bio )).toBeObservable(
      cold("(a|)", {a: "Succesfully updated bio."})
    );
    expect(httpClientStub.put).toHaveBeenCalledWith(
      `${service.URL}/bio`, {bio: mock_bio}, default_headers
    );
  });

  it('should be able to update the user password', () => {
    httpClientStub.post.and.returnValue(of(
      { "message": "Succesfully replaced password." }
    ));

    let old_password = "ABCDEF";
    let new_password = "abcdef";

    expect(service.changePassword$( old_password, new_password )).toBeObservable(
      cold("(a|)", {a: "Succesfully replaced password."})
    );
    expect(httpClientStub.post).toHaveBeenCalledWith(
      `${service.URL}/change_password`, {old_password: old_password, new_password: new_password}, default_headers
    );
  });
  
  it("should unsubscribe all subscriptions when leaving the page", () => {
    service['getAllMovementsSubscription'] = of(true).subscribe();
    service['getAllSubbedMovementsSubscription'] = of(true).subscribe();
    service.ngOnDestroy();
    expect(service['getAllMovementsSubscription'].closed).toBeTruthy();
    expect(service['getAllSubbedMovementsSubscription'].closed).toBeTruthy();
  });
});
