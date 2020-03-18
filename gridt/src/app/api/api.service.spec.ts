import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { skip, take } from 'rxjs/operators';

import { ApiService } from './api.service';

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

  it('should generate a token upon login', () => {
    const mock_token = {
      'access_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9'
    }

    service.login('username', 'password');
    service.isLoggedIn$.pipe(
      take(1)
    ).subscribe( val => expect(val).toBeFalsy() );

    service.isLoggedIn$.pipe(
      skip(1),
    ).subscribe( val => expect(val).toBeTruthy() );

    const req = httpMock.expectOne(`${service.URL}/auth`);
    expect(req.request.method).toEqual('POST');

    req.flush(mock_token);
  });

  it('should be logged out after failed authentication', () => {
    service.login('username', 'password');
    service.isLoggedIn$.pipe(
      take(1)
    ).subscribe( val => {expect(val).toBeFalsy();} )
    service.isLoggedIn$.pipe(
      skip(1),
    ).subscribe( val => {expect(val).toBeFalsy();} );

    const req = httpMock.expectOne(`${service.URL}/auth`);
    expect(req.request.method).toEqual('POST');

    req.flush(
      {"description":"Invalid credentials","error":"Bad Request", "status_code":401},
      {status: 400, statusText: 'Bad Request' }
    );
  });

  it('should be observable that registering succeeded', () => {
    service.register('mockusername', 'mockemail', 'mockpassword').subscribe(
      message => expect(message).toBe("Succesfully created user."),
      error => fail()
    );

    const req = httpMock.expectOne(`${service.URL}/register`);
    expect(req.request.method).toEqual('POST');

    req.flush({message: "Succesfully created user."});
  })

  it('should be observable that registering failed', () => {
      service.register('mockusername', 'mockemail', 'mockpassword').subscribe(
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
});
