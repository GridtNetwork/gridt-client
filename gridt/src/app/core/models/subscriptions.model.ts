import { Subscription } from 'rxjs';

export class Subscriptions {
    protected subscriptions: Subscription[] = [];

    cancelAllSubscriptions () {
        this.subscriptions.map( subscription => subscription.unsubscribe());
    }
}
