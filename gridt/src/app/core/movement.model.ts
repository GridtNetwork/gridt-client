import { LastSiganl } from './lastSignal.model';
import { User } from './user.model';

export interface Movement {
  /**
   * Number that the movement can be identified with.
   */
  id?: number;

  /**
   * Name of the movement
   */
  name: string;

  /**
   * True if the user is subscribed to this movement.
   */
  subscribed?: boolean;

  /**
   * Array of user types that demonstrate when they last did their updates. 
   * Only available on server responses.
   */
  leaders?: Array<User>;

  /**
   * A comprehensive description of the movement
   */
  short_description: string;

  /**
   * Last signal that the user sent in this movement.
   */
  last_signal_sent?: LastSiganl;

  /**
   * A much longer description that is used to 'sell' a movement to it's users.
   */
  description?: string;

  interval: "daily" | "twice daily" | "weekly";
}
