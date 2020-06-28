import { TestBed } from '@angular/core/testing';
import { SettingsService, special_pipe } from './settings.service';
import { hot, cold } from 'jasmine-marbles';
import { pluck } from 'rxjs/operators';
const { Storage } = Plugins; // TODO: Install capacitor storage plugin.

describe("IdentityService", () => {
  let service: SettingsService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [SettingsService],
    });

    service = TestBed.get(SettingsService);
  });

  // Basic functionality
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide the last available settings' () => {});

  it('should combine settings from localStorage and from the server.' () => {});

  // Authentication
  it('should fail to read settings when not logged in', () => {});

  it('should fail to update settings when not logged in', () => {});

  // Local storage
  it('should create a localStorage with default values for new users', () => {});

  it('should have a non-empty localStorage when loged in', () => {});

  it('should do ???? when loged out', () => {});

  it('should update localStorage when new settings are available', () => {
    const storage_set = spyOn(Storage, 'set');

    const settings = {}; // TODO: Make these valid settings object
    service.resub$.next(settings);
    expect(storage_set).toHaveBeenCalledWith({
      key: "settings",
      value: settings
    });
  });

  it('should inform the user when an update has been stored succesfully', () => {});

  // Server calls
  it('should disable edits when the server is not available', () => {});

  it('should send updated identity to the server only when the user sets new account identity', () => {
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

  it('should inform the user when an update has reached the server succesfully', () => {});

});
