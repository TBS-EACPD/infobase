# CSS tips

Most CSS in the InfoBase is written in [Sass](https://sass-lang.com/) (files ending in .scss). Sass is a super set of CSS, adding a bunch of useful syntax like functions and mix-ins. Start by learning CSS more broadly, you can more or less stick to picking up Sass by going to the Sass docs whenever you see non-standard CSS while working with the InfoBase source code. Sass is compiled to CSS during our build process.

- Where to start?
  - [learn layout](http://learnlayout.com/)
  - We use a lot of [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/)
- What are floats?
  - If a container only has float children, its height will be zero. You need to clear it, usually by adding a dummy `<div style={{clear: "both"}}></div>` as the container's last child..
- What is flex box?
  - Flexbox is used to create uni-dimensional layouts.
  - Uni-dimensional in the sense that it is not a grid. It makes it easy to render a collection of elements in rows, columns, reverse order, tons of spacing options, but it doesn't get the job done when you want to align _both_ cols _and_ rows. It might _help_, e.g. bootstrap 4 uses flex-box instead of floats for its column layout.
  - If you have a series of panels to show, and you want to spread them over multiple columns but don't care to align their heights, flex box can help.
  - If you understand the basics of justifyContent, alignItems and align-self, and still can't get the layout you want, see [this interesting Stack Overflow answer](https://stackoverflow.com/questions/32551291/in-css-flexbox-why-are-there-no-justify-items-and-justify-self-properties) on the use of auto-margins in flex box
  - ​Due to cross browser issues, it's often necessary to have `width:100%` on flex-items. If you want equal height columns, it's often better to have nested flex containers than to use `height:100%`.

# React Tips

React's really useful, but I can't think of much in the way of useful things to say about it. It's made working on the InfoBase a whole lot more enjoyable. Google it, read the docs, ask questions, and have fun!

- Read the docs!
- once you know the basics, [read this book](https://developmentarc.gitbooks.io/react-indepth/content/) that explains the lifecycle hooks in depth
- also take a look at [this article](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html) on React Components, Elements, and Instances
- if working on stateful components, try to centralize all the state into a single top-level component and having all the other components just take props.
- recall that setState is really weird and is sometimes asynchronous.
- if you have an object that you want to become props, instead of repeating yourself, you can use object spread notation:

```javascript
<MyComponent {...myObjectOfProps} /> //is better than
<MyComponent prop1={myObjectOfProps.prop1} prop2={myObjectofProps.prop2} ... />
```

# Data visualization (D3, SVG, making it accessible, etc. ) tips

_The following's still applicable, but a bit out of date_. Data viz mostly means [nivo](https://nivo.rocks/) these days.

In the InfoBase, data viz mostly means D3.js. D3's got everything and the kitchen sink, and it's long been the top dog when it comes to web based data visualizations. It's also a bit of a [learning nightmare](https://medium.com/dailyjs/the-trouble-with-d3-4a84f7de011f) ([what's the kitchen sink got to do with data viz anyway](https://medium.com/@Elijah_Meeks/d3-is-not-a-data-visualization-library-67ba549e8520)). Good news is that, for every article pointing out the difficulties with learning D3, there's thousands of articles and resources out there for actually learning it. Start with Google, read these tips later, and ask us any questions you have outside of all that!

- SVG has a few drawbacks

  - not totally accessible, so we often overlay it with html
    - Can't wrap text
    - Can't be given tab index and be focused/blurred by tabbing
    - This usually means having 2 very similar D3 selection code, one for svg and one for overlayed html
  - z-index doesn't work, you have to make sure what you want to display on a top layer gets drawn last

- D3 selections can be confusing
  - d3_selector.selectAll() will return a weird-array of DOM nodes that are children of d3_selector's node(s)
    - calling .data(data, key_function) on it computes a 3 part join (enter, update, exit) of the above array and the data array
      - exit is what D3 'decides' is in the DOM but not in the data_array
      - update is what D3 'identifies' as being in both the DOM and the data_array
      - enter is what D3 'decides' is in the data_array but not the DOM
      - how does D3 decide?
        - D3 will compute keys for selection and data_array, by calling key_function on each item in data_array and and on the **data** attribute of each DOM element in the DOM selection. It will perform key comparison to find the 3 joins.
  - What is **data** ?
    - when you append elements using d3, you're implicitly calling .attr('**data**', function(d){return d;}) on it. DO NOT override this behaviour, just be aware of it.
    - If the data array changes value (i.e. a totally new array) OR if an element itself get replaced with a totally new reference, d3 will be blind to the update unless .data is called again. This shouldn't matter anyway because it's an anti-pattern to not call .data when updating your DOM.
  - Hierarchical selections
    - Often, you don't just want to make a flat list into elements, you may want a list of lists, for instance if you're stacking/grouping bars in a bar chart
    - calling .select on a d3 selection will preserve the existing data grouping.
    - calling .selectAll on a d3 selection will create a new data grouping. In the usual case, you have an array of arrays (or array of objects with arrays as properties), let's say data looks like `var data = [ { vals: [1,2,3], key:'x' } , { vals: [4,5,6], key: 'y' } ]` then if data is bound to some `d3_selection`, to nest and use the inner vals arrays, you'd call `d3_selection.selectAll('div').data(function(d){ return d.vals });` If you append divs using enter(),
    - [read this](https://bost.ocks.org/mike/nest/)
- Accessibility
  - Often, you want some elements of the graph to have mouse-events such as hoverLabels. In bar charts and lines, for instance, hovering over a bar or dot on the line will create a popover element displaying what number you're looking at. In order to make this accessible, we appended some dummy divs that we appended to the document in the same order as the <rect> (bars in the bar chart) and <circle> (dots over lines). By setting the html attribute tabindex=0 on each of these dummy divs, we allow the user to tab over them. Then, we bind some data to these dummy divs so that when they get clicked, we have all the information we need to position a popover with the correct number.

# Colours

As of May 2019, all pages on InfoBase should use standard colours unless absolutely necessary. Use the variables defined below rather than manually inputting hex codes or rgb colours. Some of these colours are canada.ca design requirements and can't be easily changed.

There is a document (ai/pdf) called infobase_colours.ai in the creative cloud shared folder under InfoBase. It summarizes a lot of what's written here and allows you to see the colours.

## Standard colours

Main UI colours are defined in `core/colour_defs.js` and `common_css/_common_variables.scss` for javascript and css access respectively. These will need to be kept manually in sync unless we figure out some way of getting around it.

Colours are injected into window globals as (e.g.) `window.infobase_color_constants.primaryColor`.

Main colours are:

- primaryColor (canada.ca dark navy)
- secondaryColor (a bright blue)
- tertiaryColor (grey)
- highlightColor (red)

In some cases, a lightened or decreased opacity transformed version of one of these colours is used for some elements, but in general it is better to match elements that already exist rather than generating a new variant.

## Text

Dark text is `textColor` (#333). Light text (on dark backgrounds) is `textLightColor` (#f0f8ff)

Adherence to the canada.ca link colour requirements is patchy, but lots of our links are styled to look like buttons and vice versa.

Light text has sufficient contrast against `primaryColor` and `secondaryColor`. Do not use light or dark text on top of `tertiaryColor`, it doesn't have sufficient contrast with either.

If you want to double check, you can input foreground and background colours on the [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/).

## Colour schemes (for graphs)

Colour schemes include 3 variants of a categorical colour scheme, as well as sequential colour schemes for numeric values encoded with colour.

### Categorical

The main colour scheme is used when there aren't text labels on top of chart elements. It's named `newIBCategoryColors`, but is also available as a d3 colour scale via a global `infobase_colors()`

There is an additional "smart" colour scheme (`infobase_colors_smart()`) that takes in a label and checks whether it matches one of several "Not applicable" labels. If it does, it outputs grey, and otherwise outputs the standard colour scheme colour for that label.

For graphs where there will be text or labels printed on top of coloured elements, there is `newIBLightCategoryColors` (for dark text) and `newIBDarkCategoryColors` (for light text). The dark scheme replaces the gold/brown with pink, so it doesn't quite match the rest of the colour schemes.

### Sequential

There are four sequential colour schemes: `sequentialBlues`, `sequentialReds`, `sequentialGreens`, and `sequentialPurples`. These are used when the colour itself represents a numerical value such as spending, rather than a category.

Dark text only has sufficient contrast on the lightest 3 colours of these schemes.

Don't use reds and greens together. It won't be distinguishable for people with colour blindness. Use blues and reds if you want red to represent negative values. Bonus, the blues will match the rest of the Infobase!

## Breakpoints

For media queries and other logic based on screen size ranges, use the standard breakpoints in `src/common_css/common_variables.scss` and `src/core/breakpoint_def.js`. Whenever possible, prefer logic based on min-width, as the grid system transitions at min-width.
