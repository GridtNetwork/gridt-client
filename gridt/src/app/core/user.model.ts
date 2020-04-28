import { LastSiganl } from './lastSignal.model';
export interface User {
    /**
     * The user's id
     */
    id: number;
    /**
     * The user's username
     */
    username: string;

    last_signal: LastSiganl| null;
    bio: string;
}
