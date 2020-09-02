import { Signal } from './Signal.model';

export interface User {
    /**
     * The user's id
     */
    id: number;
    /**
     * The user's username
     */
    username: string;
  
    last_signal: {
        time_stamp: string;
        message?: string
    } | null;

    /**
     * The URL linking to the user's profile picture on gravatar.com
     */
    avatar?: string;
}
