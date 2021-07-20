# React Default Props

With React 17.0 + TS 4.2, there are some gotchas when it comes to typing React components that have default prop values.

It's not (currently) trivial to have prop defaults that:

1. are optional on the component interface
2. _don't_ report `undefined` as a potential value
3. are represented properly when recovering the component's prop types externally bonus) are easy to maintain and not _too_ confusing

I'm going to jump straight to documenting the solutions. The reasoning and second-order issues with other solutions aren't too important, and might change with future React or TS updates. For now we will use these consistent approaches and, if better options become clear later, we'll at least have a relatively easy time updating. If you really need more history on it, there's a lot of discussion documented in the original PR https://github.com/TBS-EACPD/infobase/pull/1191.

## Class Components

The more complicated case.

TODO: finalize pattern in practice and document it here.

## Function Components

The straightforward case. Just type it as you would any function with default values.

_Do not_ use `React.FunctionalComponent` (https://github.com/facebook/create-react-app/pull/8177) or `SomeComponent.defaultProps` (set to be deprecated eventually).

_Do_ use our util type `ComponentProps<typeof SomeComponent>` instead of `React.ComponentProps` if you need to reuse the prop types in an external module.
