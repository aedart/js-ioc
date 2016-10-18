'use strict';

import IoCError from './IoCError';

/**
 * Binding Exception
 *
 * @description Throw this exception whenever a binding is invalid
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
export default class BindingException extends IoCError{

    /**
     * Constructor
     *
     * @param {string} [message] Error message
     */
    constructor(message = 'Binding Exception'){
        super(message);
        this.name = this.constructor.name;
        this.message = message; // ES2015 trick
    }
}