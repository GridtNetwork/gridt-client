import { User } from './user.model';

export interface Announcement {
    /**
     * Number that the announcement can be identified with.
     */
    id?: number;

    /**
     * The announcement message.
     */
    messsage: string;

    /**
     * The time at which the announcement was made.
     */
    created_time: string;

    /**
     * The user that has made the announcement
     */
    poster: User;
}
