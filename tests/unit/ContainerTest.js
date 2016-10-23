"use strict";

import faker from 'faker';
import IoC from './../../src/Container';
import BindingException from './../../src/Exceptions/BindingException';

describe("IoC Container", function () {

    afterEach(function () {
       IoC.flush();
    });

    it("already has IoC instance created - singleton", function () {

        console.log(typeof IoC, IoC);

        let type = typeof IoC;

        expect(type).toBe('object');
    });

    it("fails when attempting to create new IoC Container instance - singleton", function () {
        let f = function () {
            return new IoC();
        };

        expect(f).toThrowError(TypeError);
    });

    it("has empty bindings by default", function () {
        let bindings = IoC.bindings;

        let result = bindings.size;

        expect(result).toBe(0);
    });

    it("can bind callback to abstract", function () {
        let abstract = faker.random.uuid();
        let concrete = function(){
            return true;
        };

        IoC.bind(abstract, concrete);

        console.log('binding', IoC.bindings.get(abstract));

        expect(IoC.bound(abstract)).toBe(true);
        expect(IoC.getBinding(abstract).isCallback).toBe(true);
    });

    it("can bind instance to abstract", function () {
        let abstract = faker.random.uuid();
        class A {}

        IoC.bindInstance(abstract, A);

        console.log('binding', IoC.bindings.get(abstract));

        expect(IoC.bound(abstract)).toBe(true);
        expect(IoC.getBinding(abstract).isCallback).toBe(false);
    });

    it("can forget binding", function () {
        let abstract = faker.random.uuid();
        class A {}

        IoC.bindInstance(abstract, A);
        IoC.forget(abstract);

        expect(IoC.bound(abstract)).toBe(false);
    });

    it("can flush all binding", function () {
        let abstractA = faker.random.uuid();
        let abstractB = faker.random.uuid();
        let abstractC = faker.random.uuid();

        class A {}
        class B {}
        class C {}

        IoC.bindInstance(abstractA, A);
        IoC.bindInstance(abstractB, B);
        IoC.bindInstance(abstractC, C);

        IoC.flush();

        expect(IoC.bound(abstractA)).toBe(false);
        expect(IoC.bound(abstractB)).toBe(false);
        expect(IoC.bound(abstractC)).toBe(false);
    });

    it("can assign alias for abstract", function () {
        let abstract = faker.random.uuid();
        let concrete = function(){
            return true;
        };
        let alias = faker.random.word();

        IoC.bind(abstract, concrete);
        IoC.alias(abstract, alias);

        expect(IoC.bound(alias)).toBe(true);
    });

    it("fails assigning alias for unbound abstract", function () {
        let abstract = faker.random.uuid();
        let alias = faker.random.word();

        let f = function(){
            IoC.alias(abstract, alias);
        };

        expect(f).toThrowError(BindingException);
    });

    it("can make (resolve) instance from callback", function () {
        let myInstance = Symbol('My Instance');

        let abstract = faker.random.uuid();
        let concrete = function(ioc, params = []){
            return myInstance;
        };

        IoC.bind(abstract, concrete);

        let resolved = IoC.make(abstract);

        expect(resolved).toBe(myInstance);
    });

    it("can make (resolve) instance from class reference", function () {

        let abstract = faker.random.uuid();

        class A {}

        IoC.bindInstance(abstract, A);

        let resolved = IoC.make(abstract);

        expect(resolved instanceof A).toBe(true);
    });

    it("can make (resolve) instance from class reference, with dependencies", function () {
        let abstractA = faker.random.uuid();
        let abstractB = faker.random.uuid();

        class A {}
        class B {
            constructor(classA){
                this.classA = classA;
            }
        }

        IoC.bindInstance(abstractA, A);
        IoC.bindInstance(abstractB, B, false, [
            '@ref:' + abstractA
        ]);

        let resolved = IoC.make(abstractB);

        expect(resolved instanceof B).toBe(true);
        expect(resolved.classA instanceof A).toBe(true);
    });

    it("can make (resolve) instance from class reference, with primitive dependencies", function () {
        let abstract = faker.random.uuid();

        let argA = 'John Doe';
        let argB = false;
        let argC = function(){
            return true;
        };
        let argD = [1, 2, 3];
        let argE = Symbol('argE');

        class A {
            constructor(a, b, c, d, e){
                this.a = a;
                this.b = b;
                this.c = c;
                this.d = d;
                this.e = e;
            }
        }

        IoC.bindInstance(abstract, A, false, [
            argA,
            argB,
            argC,
            argD,
            argE
        ]);

        let resolved = IoC.make(abstract);

        //console.log(resolved); // Log will fail here, attempt to convert symbol to string

        expect(resolved.a).toBe(argA);
        expect(resolved.b).toBe(argB);
        expect(resolved.c).toBe(argC);
        expect(resolved.d).toBe(argD);
        expect(resolved.e).toBe(argE);
    });

    it("can make (resolve) shared instance from callback", function () {
        let myInstance = null;

        let abstract = faker.random.uuid();
        let concrete = function(ioc, params = []){
            let x = class A {
                constructor(){
                    this.id = faker.random.uuid();
                }
            };

            return myInstance = new x();
        };

        IoC.singleton(abstract, concrete);

        let resolvedA = IoC.make(abstract);
        let resolvedB = IoC.make(abstract);

        expect(resolvedA).toBe(resolvedB);
        expect(resolvedA.id).toBe(resolvedB.id);
    });

    it("can make (resolve) shared instance from class reference", function () {

        let abstract = faker.random.uuid();

        class A {
            constructor(){
                this.id = faker.random.uuid();
            }
        }

        IoC.singletonInstance(abstract, A);

        let resolvedA = IoC.make(abstract);
        let resolvedB = IoC.make(abstract);

        expect(resolvedA).toBe(resolvedB);
        expect(resolvedA.id).toBe(resolvedB.id);
    });
});
