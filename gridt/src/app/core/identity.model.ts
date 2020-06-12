export interface Identity {
    /**
     * The user's id
     */
    id: number;
    /**
     * The user's username
     */
    username: string;
    /**
     * The user's biography
     */
    bio?: string;
    /**
     * The user's email adress (used for gravatar)
     */
    email: string;
    /**
     * The user's MD5 hash for the Gravatar
     */
    gravatar?: string;
}
