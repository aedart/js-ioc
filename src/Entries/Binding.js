'use strict';

import BindingException from './../Exceptions/BindingException';

/**
 * Binding
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
class Binding {

    /**
     * Constructor
     *
     * @param {string} abstract Identifier
     * @param {callback|object|null} [concrete] The concrete instance of this binding
     * @param {boolean} [shared] The shared state of this binding
     *
     * @throws {BindingException} If invalid concrete
     */
    constructor(abstract, concrete = null, shared = false){
        this.abstract = abstract;
        this.concrete = concrete;
        this.shared = shared;
    }

    /**
     * Set the abstract identifier
     *
     * @param {string} identifier
     */
    set abstract(identifier){
        this._abstract = identifier;
    }

    /**
     * Get the abstract identifier
     *
     * @returns {string}
     */
    get abstract(){
        return this._abstract;
    }

    /**
     * Set the concrete instance
     *
     * @param {callback|object|null} concrete
     *
     * @throws {BindingException} If invalid concrete
     */
    set concrete(concrete){
        let type = typeof concrete;

        if( ! (type === 'function' || type === 'object' || type === null)){
            throw new BindingException('Concrete must be a callback, an object or null');
        }

        this._concrete = concrete;
    }

    /**
     * Get the concrete instance
     *
     * @returns {callback|object|null}
     */
    get concrete(){
        return this._concrete;
    }

    /**
     * Set the shared state
     *
     * @param {boolean} isShared
     */
    set shared(isShared){
        this._shared = isShared;
    }

    /**
     * Get the shared state
     *
     * @returns {boolean}
     */
    get shared(){
        return this._shared;
    }
}

export default Binding;