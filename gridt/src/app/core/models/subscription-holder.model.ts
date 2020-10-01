import { Subscription } from 'rxjs';

export class SubscriptionHolder {
    protected subscriptions: Subscription[] = [];

    cancelAllSubscriptions () {
        this.subscriptions.map( subscription => subscription.unsubscribe() );
    }
}
