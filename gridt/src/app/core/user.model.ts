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

    avatar: string;
}
