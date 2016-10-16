"use strict";

/**
 * Reflection
 *
 * TODO: Move into separate package!
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
class Reflection {

    /**
     * Returns function argument names
     *
     * Original by: David Walsh on October 21, 2015
     * Inspiration from: Christoph Hermann
     *
     * @see https://davidwalsh.name/javascript-arguments
     * @see https://github.com/stoeffel/retrieve-arguments
     *
     * @param {function} func
     *
     * @returns {Array.<string>}
     */
    static argumentNames(func){

        // Fail if not a function
        let type = typeof func;
        if( ! (type === 'function')){
            throw new TypeError('Cannot get arguments from "' + type + '"');
        }

        // Obtain the prototype constructor of function
        func = func.prototype.constructor;

        // First match everything inside the function argument params.
        let args = this._getRawArgs(func);

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
            // Ensure that eventual default values are not part of the
            // returned argument.
            let parts = arg.split('=');
            let cleanArg = parts[0].trim();

            // Ensure no inline comments are parsed and trim the whitespace.
            return cleanArg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    /**
     * Returns the raw arguments if any found
     *
     * @param {prototype|Function} func
     * @returns {array}
     * @private
     */
    static _getRawArgs(func){
        let found = func.toString().match(/function[^(]*\(([^)]*)\)/);
        if(found === null){
            // Try searching for a "constructor" key word
            found = func.toString().match(/constructor[^(]*\(([^)]*)\)/);
        }

        if(found === null){
            return [];
        }

        return found[1];
    }

    /**
     * @deprecated Too unsafe, due to a) relies on Function.name, which default minifiers might (will) change!
     *
     * Returns true if the given target is class
     *
     * @param {*} target
     *
     * @returns {boolean}
     */
    static isClass(target){
        if( ! (typeof target === 'function')){
            return false;
        }

        // Obtain the target Function.name. For reasons that are beyond
        // me, we have to fetch it before invoking anything on the
        // prototype. Not sure why or if it's a bug,...
        // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
        let name = target.name;

        // Chrome makes somewhat easy in es6, the toString
        // method reveals that the keyword "class" is used
        // if indeed the given target is a class. This works
        // for the most part.
        let source = target.prototype.constructor.toString();
        if(/^class\s/i.test(source)) {
            return true;
        }

        // For Firefox (and perhaps other browsers), things are not that easy.
        // Therefore, we fall back to checking the Function.name.
        // We check to see if anything was returned. If not, then attempt to
        // get the prototype constructor's name.
        if( !name ){
            name = target.prototype.constructor.name;
        }

        // If still no name was found, then there is nothing that we can do
        if( !name ){
            return false;
        }

        // But, if a name is present, then we do a final check! If the
        // first letter of the name is uppercase, then we assume that it
        // is a class. This may not be the safest approach - minifiers
        // might (or rather will) lowercase the method name.
        return (name.charCodeAt(0) === name.toUpperCase().charCodeAt(0));
    }
}

export default Reflection;