import { User } from './user.model';

export interface Movement {
    /**
     * Name of the movement
     */
    name: string;

    /**
     * True if the user is subscribed to this movement.
     */
    subscribed?: boolean;
    leaders?: Array<User>;

    /**
     * A comprehensive description of the movement
     */
    short_description: string;

    /**
     * A much longer description that is used to 'sell' a movement to it's users.
     */
    description?: string;

    interval: {
      hours: number;
      days: number;
    };
}
