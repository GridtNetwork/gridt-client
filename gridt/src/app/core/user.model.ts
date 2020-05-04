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

    last_signal: Signal| null;
    bio: string;
}
