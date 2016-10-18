"use strict";

import HasDependencies from '../../../src/Contracts/HasDependencies';

describe("Has Dependencies Contract", function () {

    it("fails when attempting to invoke static method", function () {
        let f = function(){
            HasDependencies.dependencies();
        };

        expect(f).toThrowError(TypeError);
    });

    it("fails when when invoking none-overwritten method in sub-class", function () {

        class MyClass extends HasDependencies {}

        let f = function(){
            MyClass.dependencies();
        };

        expect(f).toThrowError(TypeError);
    });

    it("returns dependencies in sub-class", function () {

        const a = 'a';
        const b = 'b';
        const c = 'c';

        class MyClass extends HasDependencies {

            static dependencies(){
                return [a, b, c];
            }
        }

        let dependencies = MyClass.dependencies();

        expect(dependencies).toContain(a);
        expect(dependencies).toContain(b);
        expect(dependencies).toContain(c);
    });
});
