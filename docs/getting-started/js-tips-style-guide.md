# The not-about-InfoBase InfoBase Developer guide

The InfoBase has a lot of new coders, both familiar and unfamiliar with javascript. Naturally you'll be on stack overflow a lot, but this document can answer some of your questions in advance or at least point you towards things to learn. It also resents some of our common preferred patterns. If you see weird code somewhere, the technique might be explained here. This document doubles as a somewhat complete\* record of our official code style guidelines. You don't have to be nervous about copying code from here because it's good style and the "right way" of doing things.

\* other aspects of our code style practices are baked in to our linting rules. Keep an eye out for linter warnings as you code! More in-the-weeds project best practices will naturally come up in the process of code reviews

If you're reading through this and understand nothing, good! At least you know what you don't know now. Google anything that isn't clear (or ask someone, we're glad to help).

## Table of Contents

- [The not-about-InfoBase InfoBase Developer guide](#the-not-about-infobase-infobase-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [Jumping off points](#jumping-off-points)
  - [Javascript coding conventions](#javascript-coding-conventions)
  - [Other Javascript tips and recipes](#other-javascript-tips-and-recipes)

## Jumping off points

New to javascript? Here are some places to start learning from:

- Start by learning lodash. Most data manipulation code should be written in lodash, and lodash is full of helpful utilities to boot. There's no point in wasting time learning to iterate over objects or arrays using plain javascript (.map and .forEach are in the spec as of ES5, but JS itself will never match all of lodash's features).
  - [lodash.js docs](https://lodash.com/docs/4.17.11)
  - [some article on medium.com](https://firstdoit.com/reduce-your-problems-with-functional-programming-getting-started-with-underscore-or-lodash-86d78aad6338#.9wid6bo2l)
  - [follow-up article on chaining, very useful](https://firstdoit.com/chain-your-solutions-with-underscore-513fba67ec1f#.8xtlf3qrl) (this article is on underscore, which is equivalent to lodash in most respects)
  - Note: before you write any generic piece of code, see if lodash already provides that functionality. For instance, lodash has functions for
    - Making sure a function can only be called every x milliseconds (debounce)
    - creating arbitrary unique IDs
    - Checking the types (`_.isNumber`, `_.isUndefined`, etc. )
  - Make sure you understand `_.chain`, `_.map`, `_.filter` and `_.reduce`
- DOM fundamentals (assuming you know basic HTML, if not start there)
  - [Mozilla docs (best reference for this stuff)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
  - [selectors and querySelector (also very relevant to CSS)](https://www.kirupa.com/html5/finding_elements_dom_using_querySelector.htm)
  - Note that direct DOM manipulation gets messy at any sort of scale, and is **not** used in the InfoBase. Having some practice with these fundamentals will be very useful though. The InfoBase is thoroughly [React](https://reactjs.org/) powered, with the odd corner of [D3](https://d3js.org/).

## Javascript coding conventions

Our (un)official (and somewhat incomplete) rules for code style:

- Pay attention to our linter rules! Most linter warnings can be fixed automatically, but it will be better overall if you get in to the habit of writing in the linter-passing style from the start
- <u>Arrow functions</u>
  - returning an object literal with ES6 arrow functions : Wrap it in parentheses ` arr.map( val => ({ n: n, n_sq : n*n }) )`
    - without the parentheses, the parser doesn't know whether the curly brackets are a block expression or an object literal.
  - Should I use `=> value` or `=> { return value; } ` ?
    - The first, only bother with a body on an arrow function when there are side effects or when you need more than one expression
- Avoid array indices
  - Dealing with pairs
    - Ugly: `[ [1,'one'] , [2,'two] ].map( (pair) => pair[0] )`
    - Pretty: `[ [1,'one'] , [2,'two] ].map( ([num,name]) => num )`
  - Dealing with array-based records (e.g. from a csv)
    - ugly: `const a = line[0]; const b = line[1]; ... e = line[5];`
    - `const [a,b,c,d,e] = line`
    - Note: sometimes I use 'named indices' to refer to stuff
      - `const [ name_ix, text_ix, year_ix] = d3.range(0,3); const name = line[name_ix];`
- Iterating structures : Don't use that for loop!
  - the **only** case for for loops: iterating over hundreds of items (at least) _when_ you can optimize by exiting early with a `break`. Even then, a lodash method like `_.find` that already exists early is usually good enough and more elegant.
  - `_.each(structure, func(val,key_or_index) )` and `arr.forEach(func(val,index))` are better than for loops, but it's better not to use them, since they can only do useful work through _side-effects_, which are to be avoided
  - Instead, if you're processing data into a new variable, better to use lodash helpers for functionally creating new data structures
- Identifier names
  - HTML ID or class: `lower-case-separated-by-dashes`. When styling DOM for a cohesive element, use [BEM](http://getbem.com/) naming conventions
  - Javascript classes in `PascalCase` (camelCase + capital first letter)
  - Object oriented style code (class methods and properties) can be `camelCase`. Functional style code can be `snake_case`. If unsure, stick to `snake_case`, we don't have much object oriented code and are considering dropping the naming convention distinction since it's hard to enforce
  - When ambiguous, don't be afraid to make the type a part of the name
    - e.g. `dept_id` is better than `dept` for a department key
  - Don't use vague identifiers like `data`, `data_temp`.
  - **Don't be afraid to make long variable names, the minification proccess will make sure it doesn't matter**
  - If you need to define a constant value for use throughout the a file, put its name in capitals, e.g. `const TOP_ITEMS = 20;` Note that this is a newer convention and there's probably tons of examples that don't conform to it. Feel free to change them.
- `const` vs `let` vs `var`
  - in our code, `var` indicates that it is old code, could be a constant or not.
  - let indicates that it is a variable that may change values,
    - **Do not go change old `var`s to `let` in an effort to 'modernize code'. ** This screws with the convention that `let` indicates a changing value. `let`s/any value mutation is an anti-pattern in the InfoBase regardless, prefer using `const`s and saving modified values in to new variables rather than mutating their original variable
  - `const` indicates that the value will not change
    - If it's array or object, the reference is constant, but its _contents_ may still change. We'd prefer that they don't still, but mutating an existing object does have its uses
- Vertical formatting
  - most programmers put the high-level (callers) above callees. Due to the nature of javascript, we do the opposite. Sometimes code is run immediately and needs its callees to be defined. For that reason, our vertical formatting is like this:
    - imports
    - callees (usually functions private to the module)
    - callers
    - exports (as a single export object, direct exports throughout in the file are acceptable, but do)
- Globals
  - Currently, all app globals are set as a constant value which is injected by `WebPack`. We don't do this in general, preferring modular code.
  - If you really think there is a valid reason to set a global, it must be injected from `build_code/webpack_common.js` inside the `DefinePlugin` function. From there, a runtime constant must be created and exported from `src/core/inject_build_constants.ts`
  - In order to access the globals, you can import the constants from `src/core/inject_build_constants.ts` like so: `import { const_name } from "src/core/injected_build_constants.ts"`
  - Since these globals are injected during runtime, they are all immutable, not being able to be store new data

## Other Javascript tips and recipes

- [This is a useful guide from mozilla](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets) on developing accessible Javascript widgets.
- ES5 'getters'
  - If you see something along the lines of `get prop_name(){ ... }` as an object's property, javascript will call that function every time you try to access obj.prop_name and return that function's result. This is mostly for brevity, or for hacky ways to emulate an old property based API with a function call based API. When should you use these? When it means you can cut down the memory used by an object by using a getter instead of a property.
- **Promises** and **async/await**. Go learn about both
- Common mistakes
  - Don't use `==`, always use `===`
  - You can't check properties on an undefined valued object
    - e.g. `var u = null; u.e` will bug. It's safer to use `(u && u.e)`
- <u>Common idioms </u>
  - Falsey and Truthy values
    - Boolean values exist in javascript, but it's common to use other types of variables as booleans
    - `if(a){ alert('true') } ` will alert true _unless_ `a` is one of the following
      1. `null`
      2. `undefined`
      3. `""`
      4. `0`
      5. `false`
      6. `NaN`
    - `!!a` can be used to coerce `a` to `true` or `false` (pretty much useless)
    - `!a` is basically shorthand for `!(!!a)` it will coerce `a` into a boolean type and reverse it.
  - A common anti-pattern is to declare an uninitialized `let` followed by a set of `if` statements to conditionally set a value for the `let`. E.g. ` let u; if( e ){ u=5; } else { u=10;}` two alternatives: * when the cases are limited/simple, use a *ternary*: `const u = e ? 5 : 10;` * when things are more complicated, consider an _immediately invoked function_: `const u = ( () => { if (e){ return 5; } else { return 10; } })();`
  - Since checking properties on an undefined object raises an error, you can use _short-circuiting_ to avoid errors.
    - `if(e[prop] ){ }` will bug if e is null/undefined
    - ugly: `if(e) { if(e[prop]) { ...code here } } }`
    - idiomatic: `if(e && e[prop] ){ ...code here }`
    - in `(a() && b())` , b only gets called if a succeeds
    - conversely, in `a() || b()`, `b` only gets called if `a()` is falsey
  - If you need to check for `null` or `undefined` to provide a default, use the nullish coalescing operator `??`
    - `const a = undefined`
    - Not preferred: `a ? a : "default"` (check if a is truthy, if so, return a)
    - Preferred: `a ?? "default"`
    - Note: this is a new syntax provided in ES2020, and the code base only recently gained support for ES2020. Feel free to update the codebase where applicable if appropriate
    - Documentation: [Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)
