'use strict';

import IoCError from './IoCError';

/**
 * Build Exception
 *
 * @description Throw this exception when resolving an instance is not possible
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
export default class BuildException extends IoCError{

    /**
     * Constructor
     *
     * @param {string} [message] Error message
     */
    constructor(message = 'Build Exception'){
        super(message);
        this.name = this.constructor.name;
        this.message = message; // ES2015 trick
    }
}