import { SecureStorage } from './secure-storage';

describe("SecureStorage", () => { 
    it('should be able to store data and retrieve it', (done: DoneFn) => {
        SecureStorage.set$("test_key", "test_value").subscribe(
            () => SecureStorage.get$("test_key").subscribe( 
                (value: string) => expect(value).toEqual("test_value"),
                fail,
                done
            ),
            fail
        )        
    });
});