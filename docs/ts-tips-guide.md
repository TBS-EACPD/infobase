Typescript was newly introducted into Infobase in early 2021 and is under a process of migration. Likewise, newly added files ideally will also be built in typescript to save on the migration process.

## Table of Contents
- [Basics](#basics)
- [Importing modules](#importing-modules)
- [Node modules](#node-modules)
- [Lodash](#lodash)
- [React](#react)

## Basics
These will be used in most cases of development of the front end Infobase

[Variable Types](https://www.typescriptlang.org/docs/handbook/basic-types.html)

[Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) - In most cases, interface will be used to define the prop types that are accepted by a component

## Importing modules
Typescript by nature does not allow you to import a file with endings `.ts` and `.tsx`, however, webpack will automatically search for these files so that we don't have to provide a file type declaration.

Incorrect: `import "./foo/bar.ts"` or `import "./foo/bar.tsx"`

Correct: `import "./foo/bar"` where bar is file type `.ts`/`.tsx`

## Node modules
Not all modules that are downloaded using npm are guaranteed to support typescript out of the box as it will depend if the original package was written in typescript. Fear not! As VSCode should alert you if you the package you are using has no type support. Hovering over the error will provide you more information on how to solve missing type support. Often, packages will have a seperate type definition module that you can download using npm to fill the type gap. These files generally start with `@types`. The image below shows an example of a missing type definition for a package and the appropriate solution:

## Lodash
As mentioned in the JS tips and styles guideline doc, lodash is a a commonly used package in InfoBase for generic data manipulation. However Lodash is one of these packages written in javascript, but fortunately has a type definition extention `@types/lodash`.
In some cases, you may run into odd typings for return values by lodash.
For example, if using the lodash [mapValues](https://lodash.com/docs/4.17.15#mapValues) method on an object, the expected return is `{[keys: string]: boolean}` even if that's not what we want! In this case, there might be some sort of error on variable usage somewhere in the code that will trace back to a lodash usage.
Because lodash is designed for very general use cases, there are many type overrides that determine the input and outputs that a function should provide.
To view these overrides to see why a type might not be matching, `command + left click` on a lodash method to open up the type overrides that are being used.
Observe below the different type overrides for `mapValues` and why passing and object as an argument results in a return expectation of `{[keys: string]: boolean}`

## React
Here are some tips I took from [here](https://medium.com/@martin_hotell/10-typescript-pro-tips-patterns-with-or-without-react-5799488d6680)
Not all of it is applicable to Infobase (since they're already implemented), but these ones look to be helpful:
- Don't use the public accessor since all members within classes are public by default
- Don't use the private accessor since it won't actually make classes private in runtime
- Don't use the protected accessor since there should already be a better patterns to be using supplied by React (for example `Higher Order Components`)
- Don't use enum because it can't be used with babel and produces unnecessary boilerplate code

When using default props, move it from the outside to a static class variable: `static defaultProps = {...}`