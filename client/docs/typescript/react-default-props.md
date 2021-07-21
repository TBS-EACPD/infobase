# React Default Props

With React 17.0 + TS 4.2, there are some gotchas when it comes to typing React components that have default prop values.

It's not (currently) trivial to have prop defaults that:

1. are optional on the component interface
2. _don't_ report `undefined` as a potential value
3. are represented properly when recovering the component's prop types externally bonus) are easy to maintain and not _too_ confusing

I'm going to jump straight to documenting the solutions. The reasoning and second-order issues with other solutions aren't too important, and might change with future React or TS updates. For now we will use these consistent approaches and, if better options become clear later, we'll at least have a relatively easy time updating. If you really need more history on it, there's a lot of discussion documented in the original PR https://github.com/TBS-EACPD/infobase/pull/1191.

## Class Components

There's a little bit of React/TypeScript magic behind the scenes, so the normal rules aren't exactly followed. I'll point out where that happens.

Steps for a simple case (additional patterns for tricky cases below):

1. declare the prop defaults, e.g.

```
const SomeComponentDefaultProps = {
 title: "bleh",
 disabled: false,
};
```

(Reminder: if a prop like`title` can be a string _or_ react component, use the `React.ReactNode` type)

2. declare the prop types/interface, unioned or extending from the type of the defaults. Do not re-declare types for any props with defaults!

```
const SomeComponentDefaultProps = ...
type SomeComponentProps = typeof SomeComponentDefaultProps & {
  style?: React.CSSProperties;
};
```

3. declare the class with the combined prop type and the default props

```
const SomeComponentDefaultProps = ...
type SomeComponentProps = ...
class SomeComponent extends React.Component<SomeComponentProps> {
  static defaultProps = SomeComponentDefaultProps;
  ...
```

Done! Looks a little weird though, right? If you look at `SomeComponentProps`, the props with defaults do not appear to be optional! This is the bit of magic I mentioned, the type system magically knows that they _are_ optional when actually using the component because of `static defaultProps` (guess React is big enough that TS devs worked this out for them). The reason this is preferable to declaring the props with defaults as optional explicitly, the standard way, is that if you do that then the type system will include `undefiend` as a possible value even though we know the component's `defaultProps` would prevent that.

Note: totally still room for optional props that do not take defaults. I included one in step 2 of the example above to point that out. Be careful no to confuse optional props and props with defaults!

Additional gotchas:

1.  - Problem: the type infered from the default might not be complete
    - Fix: just use an `as MoreComplexType` statement within the default props declaration, e.g.

```
const SomeComponentDefaultProps = {
 height: 100 as string | number,
};
```

2.  - Problem: as mentioned, there's magic inside the class component. The type `SomeComponentProps` itself still thinks the props with defaults are required, so outside of the class component declaration it isn't that useful. For an additional gotcha, the standard react utility type pattern `React.ComponentProps<typeof SomeComponentProps>` doesn't recover the desired type either!
    - Fix: there's a pattern that does work, we have a utility type that implements it in `src/types/util_types.d.ts`, exported as `ComponentProps`. If you use that, you'll recover the type information with the correct mix of required/optional props.

## Function Components

The straightforward case. Just type it as you would any function with default values.

_Do not_ use `React.FunctionalComponent` (https://github.com/facebook/create-react-app/pull/8177) or `SomeComponent.defaultProps` (set to be deprecated anyway).

_Do_ use our util type `ComponentProps<typeof SomeComponent>` instead of `React.ComponentProps` if you need to reuse the prop types in an external module.
