# .interop.scss Modules

"Magic" pattern for defining variables that can be shared between Sass and JS/TS modules.

## DOs

- define variables with Sass syntax, `$something: value;`, always at the top level\*
- use camelCase names
- use normal `@import "....interop.scss"` in other scss modules
- use `import { ... } from "....interop.scss"` in JS/TS modules
- if beneficial to organization, create an `index.scss` the uses `@forward "....interop.scss"` to collect multiple interop exports
  - pair it with an `index.ts` module that uses `export * from "....interop.scss"`
  - note the `index.scss` does not use `.interiop.scss` and can't be imported from by JS/TS
  - small maintenance burden, will want to keep these in sync...

## DO-NOTs

- no manual css `:export`s, ephemeral `:export`s are added at compile time by a custom webpack loader
- no Sass flow control (ifs, loops, etc), variables declared within these are not top level\*

\* here, "top level" means outside of _any_ blocks, no leading whitespace before the `$`. This is required by the current implementation of the custom webpack loader that dynamically adds export statemnts at compile time. To be fair, non-top level scss vars are either 1) local to some other scope or 2) inside control flow. Case 1 obviously shouldn't be exported. 2 is a little more grey-area. Although I think these interop values should generally be treated as style constants and include no logic, the main reason is because the custom loader can't be expected to support all of Sass' branching syntax.

## Other gotchas

- small headache, but changes in the generated types won't be picked up until the subsequent build. Generally they trigger one when they change, but you may need to save a change, or possibly even restart the build process in the worst case, before the types are picked up on.
