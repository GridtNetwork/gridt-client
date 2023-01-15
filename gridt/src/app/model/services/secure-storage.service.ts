//import 'capacitor-secure-storage-plugin';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

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
            const data = JSON.parse(value);
            observer.next(data);
            observer.complete();
          }
        }
      ).catch( () => observer.error(`Key "${key}" does not exist in the secure storage.`) );
    });
  }

  set$ (key: string, value: any): Observable<boolean> {
    return new Observable ( (observer) => {
      const data = JSON.stringify(value);
      SecureStoragePlugin.set({key, value: data}).then( (succesObj) => {
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
      SecureStoragePlugin.remove({key}).then( (succesObj) => {
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
