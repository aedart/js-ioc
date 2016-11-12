# Js IoC

[Inverse of Control](https://en.wikipedia.org/wiki/Inversion_of_control) (IoC) Service Container for ES6.

Before you continue reading, you should know that this package is heavily inspired by [Taylor Otwell's](https://github.com/taylorotwell) [Service Container](https://laravel.com/docs/master/container) in [Laravel](https://laravel.com/).
Please go read the documentation, to gain a better understanding of what a Service Container is and how they are intended to work... and please do support Laravel!

**Limitations**

Because this is JavaScript, you will not have the same capabilities as a PHP version of the IoC, due to the "poor" support of [Reflections](https://en.wikipedia.org/wiki/Reflection_(computer_programming)).

## Contents

* [How to install](#how-to-install)
* [Import the IoC](#import-the-ioc)
* [Bindings](#bindings)
  * [Bind to a callback](#Bind to a callback)
  * [Bind to an instance](#bind-to-an-instance)
  * [Bind singletons](#bind-singletons)
  * [Aliases](#aliases)
* [Resolving nested dependencies](#resolving-nested-dependencies)
* [Delete Bindings](#delete-bindings)
* [Contribution](#contribution)
* [Acknowledgement](#acknowledgement)
* [Versioning](#versioning)
* [License](#license)

## How to install

```console
npm install @aedart/js-ioc
```

## Import the IoC

The IoC is exported as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern) instance, which means that you only have to import and then you can start using it straight away.

```javascript
import IoC from '@aedart/js-ioc';
```

## Bindings

The basic principle behind an IoC is that you "bind" a resource to the container. This allows you to resolve it (to fetch it) at some later point in your application.   

In other words, think of a binding as a [factory method](https://en.wikipedia.org/wiki/Factory_method_pattern).

### Bind to a callback

**Simple binding**

```javascript
import IoC from '@aedart/js-ioc';

// Your class
class Box {
    // ... implementation not shown .../
}

// Bind "my-box" to a callback
IoC.bind('my-box', () => {
    return new Box();
});

// Later in your application, you can resolve "my-box"
let box = IoC.make('my-box'); // Resolves to Box
```

**Binding with arguments**

```javascript
import IoC from '@aedart/js-ioc';

// Your class
class Box {
    // ... implementation not shown .../
}

// Bind "my-box" to a callback
IoC.bind('my-box', (ioc, params) => {
    return new Box(params.width, params.height);
});

// Later in your application, you can resolve "my-box"
let box = IoC.make('my-box', {width:50, height:60}); // Resolves to Box
```

### Bind to an instance

In this context, an instance is an object that can be "newed up" - e.g. a class that will be initialised.

```javascript
// Bind instance
IoC.bindInstance('my-box', Box);

// Later... resolve "my-box" - will return "new Box"
let box = IoC.make('my-box');
```

**Arguments**

You can also pass in arguments for the constructor, via the `make` method.

```javascript
// Bind instance
IoC.bindInstance('my-box', Box);

// Later... resolve "my-box" - will return "new Box"
let box = IoC.make('my-box', {width:50, height:60});
```

### Bind singletons

**Via callback**

```javascript
// Bind as a singleton
IoC.singleton('my-box', (ioc, params)=>{
    return new Box();
});

// Later in your application...
let boxA = IoC.make('my-box');
let boxB = IoC.make('my-box');

console.log(boxA === boxB); // true
```

**Via instance**

```javascript
// Bind as a singleton
IoC.singletonInstance('my-box', Box);

// Later in your application...
let boxA = IoC.make('my-box');
let boxB = IoC.make('my-box');

console.log(boxA === boxB); // true
```

**Set instance directly**

It is also possible for you to set an instance directly, via the `instances` property.

```javascript
// Your class
class Box {
    // ... implementation not shown .../
}

let box = new Box();
IoC.instances.set('my-box', box);

// Later ...
let myBox = IoC.make('my-box');
```

### Aliases

Once you have bound a resource, you can also assign an alias for it. This can be useful in situations where your resource needs to be resolved / obtained via different identifiers.

```javascript
// Binding first
IoC.bind('my-box', (ioc, params) => {
    // ... not shown .../
});

// Alias
IoC.alias('my-box', 'largeBox');

// Later...
let largeBox = IoC.make('largeBox');
```

## Resolving nested dependencies

To the extend of my knowledge, one cannot gain insight of what object or "scalar" types are expected by a class or method, using plain JavaScript.
Therefore, in order to resolve nested dependencies, this Service Container makes use of ["mata data"](https://github.com/aedart/js-meta), which can be assigned to any class or object.

In the following example, image that you have a class has a dependency. There are several ways that you can resolve it.
However, if you need the IoC to resolve that dependency automatically, then you need to provide a bit more information when binding.

```javascript
// Class A
class DimensionsCalculator {
    // ... implementation not shown ... //
}

// Class B
class Box {

    /**
     * @param {DimensionsCalculator} calculator
     */
    constructor(calculator){
        this.calculator = calculator;
    }
    
    // ... remaining not shown ... //
}

// Bind the calculator via callback (just as an example)
IoC.bind('calculator', (ioc, params) => {
    return new DimensionsCalculator();
});

// Bind the Box class - specify it's expected dependencies
IoC.bindInstance('my-box', Box, false, [
    '@ref:calculator'       // '@ref:' prefix MUST be present!
]);

// Later...
let box = IoC.make('my-box');

console.log(box.calculator); // DimensionsCalculator{}
```

Basically, any class or object that has "meta data" defined, with dependencies (`@ref:` prefixed), the IoC will attempt to resolve those dependencies.
 
For more information, please review the source code and the ["mata data"](https://github.com/aedart/js-meta) package.

## Delete Bindings

Sometimes it can be useful to remove (delete) bindings again. This is especially true, when you are writing various executable tests.

**Remove a single binding**
```javascript
IoC.for('my-box');
```

**Remove ALL bindings**
```javascript
IoC.flush();
```

-------------------------------------------------------------------------------
## Contribution

Have you found a defect ( [bug or design flaw](https://en.wikipedia.org/wiki/Software_bug) ), or do you wish improvements? In the following sections, you might find some useful information
on how you can help this project. In any case, I thank you for taking the time to help me improve this project's deliverables and overall quality.

### Bug Report

If you are convinced that you have found a bug, then at the very least you should create a new issue. In that given issue, you should as a minimum describe the following;

* Where is the defect located
* A good, short and precise description of the defect (Why is it a defect)
* How to replicate the defect
* (_A possible solution for how to resolve the defect_)

When time permits it, I will review your issue and take action upon it.

### Fork, code and send pull-request

A good and well written bug report can help me a lot. Nevertheless, if you can or wish to resolve the defect by yourself, here is how you can do so;

* Fork this project
* Create a new local development branch for the given defect-fix
* Write your code / changes
* Create executable test-cases (prove that your changes are solid!)
* Commit and push your changes to your fork-repository
* Send a pull-request with your changes
* _Drink a [Beer](https://en.wikipedia.org/wiki/Beer) - you earned it_ :)

As soon as I receive the pull-request (_and have time for it_), I will review your changes and merge them into this project. If not, I will inform you why I choose not to.

## Acknowledgement

* [Taylor Otwell](https://github.com/taylorotwell),  for his [Service Container](https://laravel.com/docs/master/container), that I'm using daily

## Versioning

This package follows [Semantic Versioning 2.0.0](http://semver.org/)

## License

[BSD-3-Clause](http://spdx.org/licenses/BSD-3-Clause), Read the LICENSE file included in this package