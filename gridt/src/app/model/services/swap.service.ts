/**
 * A service for storing the swap events, created for solving issue #54.
 */
import { Injectable } from '@angular/core';
import { Movement } from '../interfaces/movement.model';
import { User } from '../interfaces/user.model';
import { SwapEvent } from '../interfaces/swapevent.model';

@Injectable({
  providedIn: "root"
})
export class SwapService {
  public swapEvents: SwapEvent[] = [];

  addSwapEvent (movement: Movement, user: User) {
    const swapevent = {movement, user, date: new Date()} as SwapEvent;
    this.swapEvents.push(swapevent);
  }

  getLastSwapEvent(movement?: Movement): SwapEvent {
    let events = [...this.swapEvents];

    if (movement) {
      // Using id, to prevent a situation where a movement gets updated
      // and they don't compare completely anymore.
      events = events.filter( e => e.movement.id === movement.id );
    }

    if (!events.length) {
      return null;
    }

    const lastSwapEvent = events.reduce(
      (prev, current) => (prev.date > current.date) ? prev : current
    );

    return lastSwapEvent;
  }
}
