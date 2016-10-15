"use strict";

import IoCError from './../../../src/Exceptions/IoCError';

describe("IoC Error", function () {

    it("can fail with an IoC Error", function () {

        let f = function () {
            throw new IoCError();
        };

        expect(f).toThrowError(IoCError, 'IoC Error');
    });

});
