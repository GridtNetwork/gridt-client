import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';
import { Observable } from 'rxjs';

const { SecureStoragePlugin } = Plugins;

export namespace SecureStorage {
  export function get$ (key: string): Observable<any> {
    return new Observable ( (observer) => {
      SecureStoragePlugin.get({key}).then(
        (valueObj: any) => {
          const value = valueObj.value;
          if (value === atob(null) || !value){
            observer.error(`Key ${key} does not exist in the secure storage.`);
            return;
          } else {
            console.log('Got', value);
            observer.next(value);
            observer.complete();
          }
        }
      ).catch( (error) => observer.error(error) );
    });
  }

  export function set$ (key: string, value: any): Observable<boolean> {
    return new Observable ( (observer) => {
      SecureStoragePlugin.set({key, value}).then( (succesObj) => {
        if (succesObj.value) {
          observer.next(true);
        } else {
          observer.error(`Could not set ${key} in the secure storage.`);
        }
      })
    });
  }

  export function clear$ (): Observable<boolean> {
    return new Observable ( (observer) => {
      SecureStoragePlugin.clear().then( (succesObj) => {
        if (succesObj.value) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error("Could not clear the secure storage.");
        }
      })
    });
  }

  export function remove$ (key: string): Observable<boolean> {
    return new Observable ( (observer) => {
      SecureStoragePlugin.remove().then( (succesObj) => {
        if (succesObj.value) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error(`Could not remove ${key} from the secure storage.`);
        }
      })
    });
  }
}