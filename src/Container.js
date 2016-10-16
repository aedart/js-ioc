'use strict';

import Binding from './Entries/Binding';
import BindingException from './Exceptions/BindingException';
import Reflection from './Utilities/Reflection';

/**
 * Container's bindings
 *
 * @type {Map<string, Binding>}
 */
const bindings = new Map();

/**
 * Aliases
 *
 * @type {Map<string, string>}
 */
const aliases = new Map();

/**
 * Shared instances
 *
 * @type {Map<string, *>}
 */
const instances = new Map();

/**
 * IoC Service Container
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
class Container {

    /**
     * Constructor
     */
    constructor(){
        this._bindings = bindings;
        this._aliases = aliases;
        this._instances = instances;
    }

    /**
     * Get container's bindings
     *
     * @returns {Map<string, Binding>}
     */
    get bindings(){
        return this._bindings;
    }

    /**
     * Get the aliases
     *
     * @returns {Map<string, string>}
     */
    get aliases(){
        return this._aliases;
    }

    /**
     * Get the shared instances
     *
     * @returns {Map<string, *>}
     */
    get instances(){
        return this._instances;
    }

    // TODO: jsDoc
    bind(abstract, concrete = null, shared = false){

        let binding = new Binding(abstract, concrete, shared);

        this.bindings.set(binding.abstract, binding);
    }

    // TODO: jsDoc
    bound(abstract){
        return this.bindings.has(abstract) || this.instances.has(abstract) || this.aliases.has(abstract);
    }

    // TODO: jsDoc
    alias(abstract, alias){
        if( ! this.bound(abstract)){
            throw new BindingException('Cannot assign alias for abstract "' + abstract + '". Abstract has no binding.');
        }

        this.aliases.set(alias, abstract);
    }

    // TODO: jsDoc
    singleton(abstract, concrete = null){
        this.bind(abstract, concrete, true);
    }

    // TODO: jsDoc
    make(abstract, parameters = []){

        // If an alias was given, find it's corresponding
        // abstract identifier and return it. If not, the
        // given abstract is used.
        abstract = this.getAbstract(abstract);

        // If the requested abstract has a shared (singleton) instance
        // registered and was previously instantiated, then we must
        // return that instance.
        if(this.instances.has(abstract)){
            return this.instances.get(abstract);
        }

        // Obtain the matching binding and it's concrete
        let binding = this.getBinding(abstract);
        let concrete = binding.concrete;
        let object = null;

        // Build the concrete instance, if concrete is buildable. Otherwise,
        // we must assume that the concrete is some kind of object that
        // we can return.
        if(this._isBuildable(concrete)){
            object = this.build(concrete, parameters);
        } else {
            object = concrete;
        }

        // If the binding was registered to be a shared instance (singleton),
        // then we must store the object reference, so that it can be returned
        // when it is requested again.
        if(binding.shared){
            this.instances[abstract] = object;
        }

        return object;
    }

    build(concrete, parameters = []){

        // If concrete is a closure - a callback method, then
        // we just execute it and expect the result to be what
        // must be built.
        // NOTE: We consider a class NOT to be a closure.
        if( ! Reflection.isClass(concrete)){
            return concrete(this, parameters);
        }

        // If a class is given, then we attempt to resolve eventual
        // given dependencies. Sadly, JavaScript's reflections are not
        // useful here, because there is no way of telling what the
        // class constructor expects. Therefore, we need to rely on
        // decorators for dependency injection.
        // Thus, the only thing left is to attempt and new up the
        // concrete instance.
        return new concrete();
    }

    /**
     * Returns the "abstract" identifier associated
     * with the alias, if one exists - or the given
     * alias
     *
     * @param {string} alias
     *
     * @returns {string} Abstract identifier or given alias itself
     */
    getAbstract(alias){

        // Return the abstract identifier, if it's not an actual alias
        if( ! this.aliases.has(alias)){
            return alias;
        }

        return this.aliases.get(alias);
    }

    /**
     * Returns the binding that matches the given abstract
     * or fails.
     *
     * NOTE: Method does NOT check for aliases!
     *
     * @param {string} abstract
     *
     * @returns {Binding}
     *
     * @throws {BindingException} If unable to find binding for abstract
     */
    getBinding(abstract){

        if( ! this.bindings.has(abstract)){
            throw new BindingException('No binding found for abstract "' + abstract + '"');
        }

        return this.bindings.get(abstract);
    }

    // TODO: jsDoc
    forget(abstract){}

    // TODO: jsDoc
    flush(){
        this.bindings.clear();
        this.aliases.clear();
        this.instances.clear();
    }

    /**
     * Check if concrete is buildable
     *
     * @param {*} concrete
     *
     * @returns {boolean}
     *
     * @private
     */
    _isBuildable(concrete){
        return typeof concrete === 'function';
    }
}

// Singleton
const instance = new Container();
Object.freeze(instance);

export default instance;