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
    service.set$("test_key", "test_value").subscribe(
      () => service.get$("test_key").subscribe( 
        (value: string) => expect(value).toEqual("test_value"),
        fail,
        done
      ),
      fail
    )        
  });
});