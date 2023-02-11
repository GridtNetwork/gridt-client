import { TestBed } from '@angular/core/testing';
import { SecureStorageService } from './secure-storage.service';

describe("SecureStorageService", () => {
  let service: SecureStorageService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [SecureStorageService],
    });

    service = TestBed.get(SecureStorageService);
  })

  it('should be able to store data and retrieve it', (done: DoneFn) => {
    service.set$("test_key", "test_value").subscribe({
      next: () => service.get$("test_key").subscribe({
        next: (value: string) => expect(value).toEqual("test_value"),
        error: fail,
        complete: done
      }),
      error: fail
    })
  });

  it('should be able to store an object', (done: DoneFn) => {
    service.set$("test_key", {"object_key": "object_value"}).subscribe({
      next: () => {
        service.get$("test_key").subscribe({
          next: (val) => {
            expect(val).toEqual({"object_key": "object_value"});
            done();
          },
          error: fail
        })
      },
      error: () => fail
    })
  });
});
