"use strict";

import Reflection from './../../../src/Utilities/Reflection';

describe("Reflection", function () {

    it("can determine if it's a class", function(){
        class A {
            constructor(foo, bar, baz){}
        }

        let z = function(foo, bar, baz){};

        expect(Reflection.isClass(A)).toBe(true);
        expect(Reflection.isClass(z)).toBe(false);
    });

    it("can obtain function argument names", function () {

        let a = function(foo, bar, baz){};

        let args = Reflection.argumentNames(a);

        console.log('arguments', args);

        expect(args).toContain('foo');
        expect(args).toContain('bar');
        expect(args).toContain('baz');
    });

    it("can obtain class constructor argument names", function () {

        class A {
            constructor(foo, bar, baz){}
        }

        let args = Reflection.argumentNames(A);

        console.log('arguments', args);

        expect(args).toContain('foo');
        expect(args).toContain('bar');
        expect(args).toContain('baz');
    });

    it("does not return default values", function () {
        class A {
            constructor(foo = 'bar', bar = true, baz = []){}
        }

        let b = function(foo = 'bar', bar = true, baz = []){};

        let argsA = Reflection.argumentNames(A);
        let argsB = Reflection.argumentNames(b);

        console.log('arguments A', argsA);
        console.log('arguments B', argsB);

        expect(argsA).toContain('foo');
        expect(argsA).toContain('bar');
        expect(argsA).toContain('baz');

        expect(argsB).toContain('foo');
        expect(argsB).toContain('bar');
        expect(argsB).toContain('baz');
    });

    it("does not return inline comments", function(){
        class A {
            constructor(/** @type {array} */ foo, bar = false, baz = []){}
        }

        let args = Reflection.argumentNames(A);

        console.log('arguments', args);

        expect(args).toContain('foo');
        expect(args).toContain('bar');
        expect(args).toContain('baz');
    });
});
