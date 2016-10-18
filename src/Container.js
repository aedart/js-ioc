'use strict';

import Binding from './Entries/Binding';
import BindingException from './Exceptions/BindingException';
import HasDependencies from './Contracts/HasDependencies';
import BuildException from './Exceptions/BuildException';

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
     * Build and return the concrete instance of given type
     *
     * @param {Function|Binding|HasDependencies} concrete
     * @param {Array} [parameters]
     *
     * @returns {object}
     */
    build(concrete, parameters = []){

        // If the given "concrete" is a Binding instance and it's
        // declared as having a callback, then invoke the callback
        // with this contain and given parameters.
        if(concrete instanceof Binding && concrete.isCallback){
            return concrete.concrete(this, parameters);
        }

        // If the concrete is a Binding, but not a callback, then
        // obtain the binding's concrete
        if(concrete instanceof Binding){
            concrete = concrete.concrete;
        }

        // If null was bound or given, then just return null
        if(concrete === null){
            return concrete;
        }

        // Unlike PHP which has a pretty good Reflection class, JavaScript
        // does not offer that much. Therefore, in order to resolve eventual
        // nested dependencies, we check if the given concrete is an
        // instance of "Has Dependencies". If so, we use the static dependencies
        // method to obtain abstracts, aliases or perhaps concrete object
        // instances, which can then inject straight into the instance that we
        // must create. However, we avoid doing this, if parameters are provided.
        // This should give the developer plenty of flexibility...
        if(concrete instanceof HasDependencies && parameters.length == 0){
            parameters = this._getDependencies(concrete);
        }

        // Finally, initiate the new instance
        return new concrete(...parameters);
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

    /**
     * Resolves and returns a list of dependencies
     *
     * @param {HasDependencies} concrete
     * @returns {Array}
     * @private
     */
    _getDependencies(concrete){

        let args = [];

        // Fetch the dependencies list.
        let dependencies = concrete.dependencies();

        // Resolve each dependency
        for(let elem in dependencies){

            switch (typeof elem){
                // Abstract or alias
                case 'string':
                    args.push(this.make(elem));
                    break;
                // Object instance
                case 'object':
                    args.push(elem);
                    break;
                // Class reference
                case 'function':
                    args.push(this.build(elem));
                    break;
                // Unknown
                default:
                    throw new BuildException('Unable to resolve "' + elem.toString() + '" dependency for "' + concrete.toString() + '"');
                    break;
            }
        }

        return args;
    }
}

// Singleton
const instance = new Container();
Object.freeze(instance);

export default instance;