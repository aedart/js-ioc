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

        // Chrome makes somewhat easy in es6, the toString
        // method reveals that the keyword "class" is used
        // if indeed the given target is a class.
        let source = target.prototype.constructor.toString();
        if(/^class\s/i.test(source)) {
            return true;
        }

        // Obtain the prototype constructor name.
        let name = target.prototype.constructor.name;

        // However, for Firefox, it becomes a bit more difficult.
        // The trick is that if it's a class, then the prototype
        // constructor's string equivalent will be "function XXX(...",
        // whereas a none-class declared function will NOT have a
        // name included. Furthermore, we obtain that name and also
        // compare it with the prototype constructor name. If they
        // are the same, then we assume that it's a class.
        source = source.replace('function', '').trim();
        //source = source.replace('class', '').trim(); // Redundant here...
        let nameFromSource = source.slice(0, source.indexOf('('))[0];

        // Debug
        //console.log('__PROTO__', source, target.prototype.constructor.name, nameFromSource);

        // If both the prototype constructor name and the name from source match,
        // then this must be a class.
        return name === nameFromSource;
    }
}

export default Reflection;