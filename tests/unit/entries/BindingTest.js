"use strict";

import faker from 'faker';
import Binding from './../../../src/Entries/Binding';
import BindingException from './../../../src/Exceptions/BindingException';

describe("Binding Entry", function () {

    it("can create new binding instance", function () {

        let abstract = faker.random.word();
        let concrete = function(){
            return true;
        };
        let shared = faker.random.boolean();
        let isCallback = faker.random.boolean(); // Does not matter here

        let binding = new Binding(abstract, concrete, shared, isCallback);

        console.log(binding);

        expect(binding.abstract).toBe(abstract);
        expect(binding.concrete).toBe(concrete);
        expect(binding.shared).toBe(shared);
        expect(binding.isCallback).toBe(isCallback);
    });

    it("fails when concrete is not a callback, object or null", function () {
        let abstract = faker.random.word();
        let concrete = faker.random.word(); // Invalid binding
        let shared = faker.random.boolean();

        let f = function(){
            return new Binding(abstract, concrete, shared);
        };

        expect(f).toThrowError(BindingException);
    });
});
