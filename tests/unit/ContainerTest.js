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

        expect(f).toThrowError(TypeError, 'instance is not a constructor');
    });

    it("has empty bindings by default", function () {
        let bindings = IoC.bindings;

        let result = bindings.size;

        expect(result).toBe(0);
    });

    it("can bind concrete to abstract", function () {
        let abstract = faker.random.uuid();
        let concrete = function(){
            return true;
        };

        IoC.bind(abstract, concrete);

        console.log('binding', IoC.bindings.get(abstract));

        expect(IoC.bound(abstract)).toBe(true);
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


});