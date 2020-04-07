import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

const { SecureStoragePlugin } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  get$ (key: string): Observable<any> {
    return new Observable ( (observer) => {
      SecureStoragePlugin.get({key}).then(
        (valueObj: any) => {
          const value = valueObj.value;
          if (value === atob(null) || !value){
            observer.error(`Key "${key}" does not exist in the secure storage.`);
            return;
          } else {
            observer.next(value);
            observer.complete();
          }
        }
      ).catch( (error) => observer.error(error) );
    });
  }

  set$ (key: string, value: any): Observable<boolean> {
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

  clear$ (): Observable<boolean> {
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

  remove$ (key: string): Observable<boolean> {
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