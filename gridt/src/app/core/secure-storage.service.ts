import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';
import { Observable, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

const { SecureStoragePlugin } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  // Setting the timer for the time to live for the observables so that they always finish.
  private timeToLiveSubs = 5000;
  private timer = timer(this.timeToLiveSubs);

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
      ).catch( () => observer.error(`Key "${key}" does not exist in the secure storage.`) );
      // This is used because this observable is only used once. To make sure this observable finishes we give it a time to live.
    }).pipe(takeUntil(this.timer));
  }

  set$ (key: string, value: any): Observable<boolean> {
    return new Observable<boolean> ( (observer) => {
      SecureStoragePlugin.set({key, value}).then( (succesObj) => {
        if (succesObj.value) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error(`Could not set ${key} in the secure storage.`);
        }
      });
      // This is used because this observable is only used once. To make sure this observable finishes we give it a time to live.
    }).pipe(takeUntil(this.timer));
  }

  clear$ (): Observable<boolean> {
    return new Observable<boolean> ( (observer) => {
      SecureStoragePlugin.clear().then( (succesObj) => {
        if (succesObj.value) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error("Could not clear the secure storage.");
        }
      });
      // This is used because this observable is only used once. To make sure this observable finishes we give it a time to live.
    }).pipe(takeUntil(this.timer));
  }

  remove$ (key: string): Observable<boolean> {
    return new Observable<boolean> ( (observer) => {
      SecureStoragePlugin.remove().then( (succesObj) => {
        if (succesObj.value) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error(`Could not remove ${key} from the secure storage.`);
        }
      });
      // This is used because this observable is only used once. To make sure this observable finishes we give it a time to live.
    }).pipe(takeUntil(this.timer));
  }
}
