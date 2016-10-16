'use strict';

import Binding from './Entries/Binding';
import BindingException from './Exceptions/BindingException';

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

    /**
     * Register a binding in this container, with
     * a callback method
     *
     * @param {string} abstract
     * @param {function|null} [callback]
     * @param {boolean} [shared]
     */
    bind(abstract, callback = null, shared = false){
        this._bind(abstract, callback, shared, true);
    }

    /**
     * Register a binding in this container, with
     * a class reference.
     *
     * Class will be initialised via the "new" operator,
     * whenever instance is resolved.
     *
     * @param {string} abstract
     * @param {Function|null} [instance]
     * @param {boolean} [shared]
     */
    bindInstance(abstract, instance = null, shared = false){
        this._bind(abstract, instance, shared, false);
    }

    /**
     * Check if binding exists for abstract
     *
     * @param {string} abstract
     *
     * @returns {boolean}
     */
    bound(abstract){
        return this.bindings.has(abstract) || this.instances.has(abstract) || this.aliases.has(abstract);
    }

    /**
     * Assign an alias for the abstract
     *
     * @param {string} abstract
     * @param {string} alias
     *
     * @throws {BindingException} If no binding exists for the given abstract
     */
    alias(abstract, alias){
        if( ! this.bound(abstract)){
            throw new BindingException('Cannot assign alias for abstract "' + abstract + '". Abstract has no binding.');
        }

        this.aliases.set(alias, abstract);
    }

    // TODO: jsDoc
    singleton(abstract, callback = null){
        this.bind(abstract, callback, true);
    }

    // TODO: jsDoc
    singletonInstance(abstract, instance = null){
        this.bindInstance(abstract, instance, true);
    }

    /**
     * Resolve the registered abstract from the container
     *
     * @param {string} abstract
     * @param {Array} [parameters]
     *
     * @returns {object}
     *
     * @throws {BindingException} If no binding exists for the given abstract
     */
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

        // Obtain the matching binding
        let binding = this.getBinding(abstract);

        // Build the concrete instance, if concrete is buildable. Otherwise,
        // we must assume that the concrete is some kind of object that
        // we can return.
        let object = this.build(binding, parameters);

        // If the binding was registered to be a shared instance (singleton),
        // then we must store the object reference, so that it can be returned
        // when it is requested again.
        if(binding.shared){
            this.instances[abstract] = object;
        }

        return object;
    }

    /**
     * Build and return the concrete instance of the binding
     *
     * @param {Binding} binding
     * @param {Array} [parameters]
     *
     * @returns {object}
     */
    build(binding, parameters = []){

        // Fetch the registered concrete (callback or instance)
        let concrete = binding.concrete;

        // If concrete is a callback, then we invoke that closure
        // and pass in the parameters and this container.
        if(binding.isCallback){
            return concrete(this, parameters);
        }

        // If binding was registered as an instance, then we attempt
        // to new up the instance.
        // NOTE: Dependency injection has to be performed via
        // "inject" decorator.
        return new concrete;
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
     * Register a binding in the container
     *
     * @param {string }abstract
     * @param {function|object|null} [concrete]
     * @param {boolean} [shared]
     * @param {boolean} [isConcreteCallback]
     * @private
     */
    _bind(abstract, concrete = null, shared = false, isConcreteCallback = true){
        let binding = new Binding(abstract, concrete, shared, isConcreteCallback);

        this.bindings.set(binding.abstract, binding);
    }
}

// Singleton
const instance = new Container();
Object.freeze(instance);

export default instance;