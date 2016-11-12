'use strict';

import Binding from './Entries/Binding';
import BindingException from './Exceptions/BindingException';
import BuildException from './Exceptions/BuildException';
import Meta from '@aedart/js-meta';
import { ClassData } from '@aedart/js-meta';
import { MethodData } from '@aedart/js-meta';

/**
 * Bindings symbol
 *
 * @type {Symbol}
 * @private
 */
const _bindings = Symbol('ioc-bindings');

/**
 * Aliases symbol
 *
 * @type {Symbol}
 * @private
 */
const _aliases = Symbol('ioc-aliases');

/**
 * Instances symbol
 *
 * @type {Symbol}
 * @private
 */
const _instances = Symbol('ioc-instances');

/**
 * Prefix key for dependencies that
 * need to be resolved by the IoC
 *
 * @see Container.defineDependencies()
 * @see Container.getDependencies()
 *
 * @type {string}
 */
const REFERENCE_KEY = '@ref:';

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
        this[_bindings] = new Map();
        this[_aliases] = new Map();
        this[_instances] = new Map();
    }

    /**
     * Get container's bindings
     *
     * @returns {Map<string, Binding>}
     */
    get bindings(){
        return this[_bindings];
    }

    /**
     * Get the aliases
     *
     * @returns {Map<string, string>}
     */
    get aliases(){
        return this[_aliases];
    }

    /**
     * Get the shared instances
     *
     * @returns {Map<string, *>}
     */
    get instances(){
        return this[_instances];
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
     * @see defineDependencies()
     *
     * @param {string} abstract
     * @param {Function|null} [instance] Class reference
     * @param {boolean} [shared]
     * @param {Array<*>} [dependencies]
     */
    bindInstance(abstract, instance = null, shared = false, dependencies = []){
        this._bind(abstract, instance, shared, false);

        if(dependencies.length > 0){
            this.defineDependencies(instance, dependencies);
        }
    }

    /**
     * Define dependencies for the given instance
     *
     * If the given dependencies are supposed to be
     * references to "abstracts" or "aliases", then
     * prefix each reference with the "reference key"
     *
     * @see REFERENCE_KEY
     *
     * @see Meta.addClass()
     * @see Meta.addMethod()
     *
     * @param {Function} instance A class or a method
     * @param {Array<*>} [dependencies]
     * @param {boolean} [isClass] If false, then instance is assumed to be a method
     *
     * @return {ClassData|MethodData}
     */
    defineDependencies(instance, dependencies = [], isClass = true){
        // Do not add dependencies for null!
        if(instance === null){
            return;
        }

        // Create the meta data
        let metaData = null;
        if(isClass){
            metaData = Meta.addClass(instance);
        } else {
            metaData = Meta.addMethod(instance);
        }

        metaData.dependencies = dependencies;

        return metaData;
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

    /**
     * Register a singleton (shared) binding
     *
     * @see Container.bind()
     *
     * @param {string} abstract
     * @param {function|null} [callback]
     */
    singleton(abstract, callback = null){
        this.bind(abstract, callback, true);
    }

    /**
     * Register a singleton (shared) binding to the
     * given instance
     *
     * @see Container.bindInstance()
     *
     * @param {string} abstract
     * @param {Function|null} [instance] Class reference
     * @param {Array<*>} [dependencies]
     */
    singletonInstance(abstract, instance = null, dependencies = []){
        this.bindInstance(abstract, instance, true, dependencies);
    }

    /**
     * Resolve the registered abstract from the container
     *
     * @param {string} abstract
     * @param {Object|Array} [parameters]
     *
     * @returns {object}
     *
     * @throws {BindingException} If no binding exists for the given abstract
     * @throws {BuildException} If unable to build instance
     */
    make(abstract, parameters = {}){

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
            this.instances.set(abstract, object);
        }

        return object;
    }

    /**
     * Build and return the concrete instance of given type
     *
     * @param {Function|Binding} concrete
     * @param {Object|Array} [parameters]
     *
     * @returns {object}
     *
     * @throws {BuildException}
     */
    build(concrete, parameters = {}){

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

        // Unlike PHP, JavaScript still does not have much to offer, when
        // it comes to class reflections. There is no way that we can tell
        // what kind of "types" might be expected on a concrete instance.
        // Therefore, the only way we can build the instance with the correct
        // dependencies (if any), is to check if some "meta data" has been
        // defined for the instance.
        //
        // But, we only do so, if empty params are given. This way, if the
        // developer desires to build an instance with a different set of
        // dependencies, then that should be allowed.
        //
        // Lastly, because we accept an object or an array, we need to
        // convert the params into an array, if an object was provided.
        if( ! Array.isArray(parameters)){
            parameters = Object.keys(parameters).map(key => parameters[key]);
        }

        if(Meta.hasClass(concrete) && parameters.length == 0){
            parameters = this.getDependencies(concrete);
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

    /**
     * Forget the given binding
     *
     * @param {string|Function} abstractOrInstance
     */
    forget(abstractOrInstance){
        this.bindings.delete(abstractOrInstance);
        this.aliases.delete(abstractOrInstance);
        this.instances.delete(abstractOrInstance);
        Meta.delete(abstractOrInstance);
    }

    /**
     * Flush the container
     */
    flush(){
        this.bindings.clear();
        this.aliases.clear();

        this.instances.forEach(function(value){
            Meta.delete(value);
        });

        this.instances.clear();
    }

    /**
     * Resolves and returns a list of dependencies
     *
     * Method assumes that given concrete has associated
     * "meta data" in which one or several dependencies
     * are defined.
     *
     * @see Meta.addClass()
     *
     * @param {Function} concrete
     * @returns {Array}
     *
     * @throws {BuildException}
     * @throws {BindingException}
     */
    getDependencies(concrete){

        let args = [];

        // Fetch the dependencies from the concrete's
        // associated meta class (or method) data.
        // If none is available, then return empty dependencies.
        if( ! (Meta.hasClass(concrete) || Meta.hasMethod(concrete))){
            return args;
        }

        let dependencies = Meta.get(concrete).dependencies;
        if(dependencies.length == 0){
            return args;
        }

        // Resolve each dependency
        let depLength = dependencies.length;
        for(let i = 0; i < depLength; i++){
            let elem = dependencies[i];
            let resolved = this.resolveDependencyType(elem);

            if(resolved === null){
                throw new BuildException('Unable to resolve "' + elem.toString() + '" dependency for "' + concrete.toString() + '"');
            }

            args[args.length] = resolved;
        }

        // Finally, return the dependencies
        return args;
    }

    /**
     * Check if string contains a reference to an
     * "abstract" or "alias"
     *
     * @param {string} elem
     *
     * @returns {boolean}
     */
    containsReference(elem){
        return elem.startsWith(REFERENCE_KEY);
    }

    /**
     * Resolves a string reference to an "abstract" or
     * "alias"
     *
     * @param {string} elem
     *
     * @returns {Object}
     *
     * @throws {BindingException}
     */
    resolveReference(elem){
        return this.make(elem.replace(REFERENCE_KEY, ''));
    }

    /**
     * Resolves the element based on it's type
     *
     * @param {*} elem
     *
     * @return {*|null} Null if unable to resolve dependency
     *
     * @throws {BindingException}
     */
    resolveDependencyType(elem){
        switch (typeof elem){
            // String
            case 'string': {
                // If string is actually an abstract or alias reference
                // Then we must resolve it.
                let resolved = elem;
                if(this.containsReference(elem)){
                    resolved = this.resolveReference(elem);
                }

                return resolved;
            }

            // Object, boolean or number...etc
            case 'object':
            case 'boolean':
            case 'number':
            case 'function':
            case 'symbol': {
                return elem;
            }

            // Unknown
            default: {
                return null;
            }
        }
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

const instance = new Container();
Object.freeze(instance);

export default instance;
export { REFERENCE_KEY };