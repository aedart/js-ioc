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

    it("can determine if it's class, even if class does not have a constructor", function(){
        class A {}

        let z = function(){};

        expect(Reflection.isClass(A)).toBe(true);
        expect(Reflection.isClass(z)).toBe(false);
    });

    // Chrome will pass this... Firefox will however fail this!
    // it("fails determining class if name is lowercase", function () {
    //     // Nothing I can do about this... therefore, I do expect it
    //     // to fail...
    //
    //     class a {}
    //
    //     expect(Reflection.isClass(a)).toBe(true);
    // });

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
