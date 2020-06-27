import { TestBed } from '@angular/core/testing';
import { IdentityService, special_pipe } from './identity.service';
import { hot, cold } from 'jasmine-marbles';
import { pluck } from 'rxjs/operators';
const { Storage } = Plugins; // TODO: Install capacitor storage plugin.

describe("IdentityService", () => {
  let service: IdentityService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });

    service = TestBed.get(IdentityService);
  });

  it('should update localStorage when new settings are available', () => {
    const storage_set = spyOn(Storage, 'set');
    
    const settings = {}; // TODO: Make these valid settings object
    service.resub$.next(settings);
    expect(storage_set).toHaveBeenCalledWith({
      key: "settings",
      value: settings
    });
  });

  it('should send updated settings to the server only when the user sets new account settings', () => {
    const resub_events =    "-l-s-u";
    const expected_events = "-----u";
    const empty_events =    "------";
    const events = {
      l: {},          // Local storage sets settings
      s: {a: "A"},    // Server updates settings
      u: {a: "B"}     // User changes settings 
    };

    // TODO: make test values better
    const fake_resub = hot(resub_events, events);
    const expected = cold(expected_events, events);
    const expected_empty = cold(empty_events, events);

    expect(fake_resub.pipe(
      pluck("a"),
      special_pipe
    )).toBeObservable(expected);

    expect(fake_resub.pipe(
      pluck("z"),
      special_pipe
    )).toBeObservable(expected_empty);
  });
});