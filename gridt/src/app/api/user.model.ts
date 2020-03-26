export interface User {
    /**
     * The user's id
     */
    id: number;
    /**
     * The user's username
     */
    username: string;

    last_update?: {
        time_stamp: string;
    }
}
