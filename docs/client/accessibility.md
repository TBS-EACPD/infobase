# Accessibility strategy

## Introduction

The [Government of Canada standard on accessibility](https://www.tbs-sct.gc.ca/pol/doc-eng.aspx?id=23601) requires that web content meets [WCAG 2.0 standards](https://www.w3.org/TR/WCAG20/#conformance-reqs) at the AA conformance level.

This document was written as an informal way of introducing members of the team to our approach towards making the InfoBase accessible, what we've done, and what opportunities for improvement exist.

## Approach

### Historical approach: crawling and generating static site

When InfoBase first started there was some effort to make the main site accessible but it was insufficient.

Our first attempt to make the entire site accessible was by generating a fallback text-only static site. This was done as a static site which didn't require javascript. This meant that we used a program that acts like a web browser (PhantomJS) to crawl every possible page/route (i.e. for all departments, every infographic, every report builder scenario...), remove the graphs and other non-compliant elements, and then move on to the next page/route.

This took a long time to run, often crashed and was difficult to debug. We ended up not running it on every deployment of the public site, so it got out of date.

### Current Approach

The primary way GC InfoBase fulfills accessibility requirements consists of providing a [conforming alternate version](https://www.w3.org/TR/UNDERSTANDING-WCAG20/conformance.html#uc-conforming-alt-versions-head); specifically, a text-only version. This text-only version provides tabular versions of all of the graphs shown in infographics, as well as a text-only user interface for navigation.

In addition, we make the non-text-only version of GC InfoBase accessible to the largest number of users through a variety of strategies. These strategies--many of which are synonymous with good web design generally--are invisible to many users of the site and are described in detail below.

## Current status

The InfoBase text-only version can be accessed at http://tbs-sct.gc.ca/ems-sgd/edb-bdd/index-basic-eng.html, through the link at the bottom of every page as well as via a hidden link at the top of every page. To show the hidden link, load the InfoBase and press TAB and then ENTER to follow the link. The text-only version displays the majority of the InfoBase content in tabular format, including tabular versions of all(?) of the infographic panels and many of the sub-applications.

Additional strategies toward different aspects accessibility of main website include:

* Ensuring text/background colours meet WCAG AA contrast ratio thresholds
* Avoiding the use of colour alone (i.e., without text labels) to indicate information. If colours are used, colourblind-safe colour schemes are used (e.g. in the Treemap colour scales)
* Keyboard-only navigation of all pages is supported through the addition of tab-navigation to elements that don't natively support it
* The site should adapt gracefully to enlarging text and font sizes
* Alt text / transcriptions are added to images and video (where they occur)
* Using [ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) to indicate functionality when the element is performing a different role, e.g. when a link is styled to look like a button. In theory these can help screen readers interpret the page, but older SR hardware may not recognize these and we can't 100% rely on them (which is why there is the fallback text-only version of the site)

## Potential improvements

Currently, there is no text-only version of 2 sub-applications (assuming that the functionality of the text-only versions is equal to that of the standard versions):
* The government at a glance partition diagram
* The treemap explorer

Other potential improvements:

* It may be possible to produce tabular versions of these sub-applications, or linking to the report builder for that data.
* Tabular versions of infographic tables could be accessible from the main page, i.e. flipping back and forth could be supported.
* Improved use of semantic markup (using elements such as sections and headers) could improve screen reader usability.
