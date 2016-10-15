'use strict';

/**
 * IoC Error
 *
 * @description Base error class for all IoC related errors / exceptions
 *
 * @extends Error
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
class IoCError extends Error {

    /**
     * Constructor
     *
     * @param {string} [message] Error message
     */
    constructor(message = 'IoC Error'){
        super(message);
        this.name = this.constructor.name;
        this.message = message; // ES2015 trick
    }

}

export default IoCError;