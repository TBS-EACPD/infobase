# GC InfoBase Infrastructure

This markdown file includes [mermaid](mermaid-js.github.io/mermaid) diagrams. GitHub's markdown viewer will render these. For local viewing/editing, install the VS Code mermaid preview and syntax highlighting extensions.

<!-- toc -->

- [High-level Architecture](#high-level-architecture)
  - [Grouped by subrepo](#grouped-by-subrepo)
  - [Grouped by environment](#grouped-by-environment)
- [Component Architectures](#component-architectures)
  - [Static content](#static-content)
    - [InfoBase CDN](#infobase-cdn)
    - [Sketch of typical static content loading sequence](#sketch-of-typical-static-content-loading-sequence)
  - [GraphQL API](#graphql-api)
  - [Form Backend API](#form-backend-api)

<!-- tocstop -->

## High-level Architecture

Notes:

- Arrows point in the direction data is flowing
- These high-level diagrams are for reference, they make certain simplifications and are light on explanations. See [Detailed Component Architectures](#detailed-component-architectures) for more granular per-component information
- These diagrams represent the production infrastructure. At the level of these diagrams, the only difference for "dev link" builds is that Azure plays no part in them and all static content comes from Google Cloud.
  - There are other important differences between prod and dev links, but they're all more granular than these high-level sections cover. The largest difference worth also mentioning here is that, currently, dev links _do not_ deploy their own form backend infrastructure, they just speak to the production forms API directly.

### Grouped by subrepo

```mermaid
flowchart TB
  subgraph client subrepo
    spa(React SPA)
    storage("Google Cloud Storage")
  end

  subgraph server subrepo
    data(GraphQL Google Cloud Function)
    server_mongo(Server DB, Mongo Atlas)
  end

  subgraph form_backend subrepo
    forms(Forms Google Cloud Function)
    forms_mongo(Forms DB, Mongo Atlas)
    slack(Slack alerts)
  end

  cloudflare(Cloudflare)
  azure("Azure (IMTD managed)")
  ga(Google Analytics)

  storage--Cloudlfare populates caches with static content--->cloudflare
  cloudflare--SPA fetches static content-->spa
  azure--SPA fetches static content--->spa
  data--SPA fetches GraphQL data-->spa
  forms--SPA fetches form templates--->spa
  spa--SPA sends completed forms--->forms
  spa--SPA sends events-->ga
  server_mongo--Function queries data-->data
  forms--Function writes valid submission-->forms_mongo
  forms--Function alerts on valid submission-->slack
```

Note the three outliers above. The static content hosted in IMTD's Azure environment, Cloudflare, and Google Analytics are all coupled to the "client subrepo", but have been left outside the grouping itself. I've done this as they all, to different extents, have configuration rules and management processes that exist outside of the repo (where as everything else is largely managed via committed scripts, configuration files, etc).

For legacy reasons the production site entry points, a set of four index-{variant}.html files, are hosted on infrastructure within the TBS IMTD Azure environment. Bureaucracy, emails, and meetings are required to touch these files, so unless it becomes necessary do not plan to change their content. I'll cover the role played by the entry point index files more [below](#static-content).

Cloudflare is simpler, it's sat between the client and the majority of the static content without issue for years. I'm highlighting it as there are certain caching configuration rules set via the management dashboard that don't appear in the repo. To understand what is and isn't cached by cloudflare (as part of our larger cache busting strategy) you'll need to get on that dashboard.

Viewing the Google Analytics data and making certain configuration changes requies [dashboard](analytics.google.com) access. Historically, as the production site is a page belonging to a domain (www.tbs-sct.canada.ca) which we do not control, our site owner status on Google Analytics had to be delegated by the recognized owners (SCMA, TBS). Additionally, the run-time analytics initialization is hard-coded in the index files hosted in the Azure environemnt. This, plus the tedious nature of extracting and reporting on data once it's in there, makes this a beast on its own and something I recommend [ultimately moving away from](https://github.com/TBS-EACPD/infobase/issues/1446).

### Grouped by environment

```mermaid
flowchart LR
  subgraph Google Cloud
    storage("Google Cloud Storage")
    data(GraphQL Google Cloud Function)
    forms(Forms Google Cloud Function)
  end

  subgraph Mongo Atlas
    server_mongo(Server DB)
    forms_mongo(Forms DB)
  end

  subgraph User's device
    spa(React SPA)
  end

  cloudflare(Cloudflare)
  azure("Azure (IMTD managed)")
  ga(Google Analytics)
  slack(Slack alerts)

  storage--Cloudlfare populates caches with static content--->cloudflare
  cloudflare--SPA fetches static content-->spa
  azure--SPA fetches static content--->spa
  data--SPA fetches GraphQL data-->spa
  forms--SPA fetches form templates--->spa
  spa--SPA sends completed forms--->forms
  spa--SPA sends events-->ga
  server_mongo--Function queries data-->data
  forms--Function writes valid submission-->forms_mongo
  forms--Function alerts on valid submission-->slack
```

## Component Architectures

### Static content

#### InfoBase CDN

```mermaid
sequenceDiagram
  participant browser as Browser
  participant cloudflare as Cloudflare
  participant storage as GCloud Storage

  browser->>cloudflare: GET cdn-rdc.ea-ad.ca/{content}
  alt Cacheable
    opt Is not in cache
      cloudflare->>storage: GET storage.googleapis.com/cdn-rdc.ea-ad.ca/{content}
      storage-->>cloudflare: storage.googleapis.com/cdn-rdc.ea-ad.ca/{content}
      cloudflare->>cloudflare: Add to cache
    end
    cloudflare->>cloudflare: Retrieve from cache
  else Not cacheable
    cloudflare->>storage: GET storage.googleapis.com/cdn-rdc.ea-ad.ca/{content}
    storage-->>cloudflare: storage.googleapis.com/cdn-rdc.ea-ad.ca/{content}
  end
  cloudflare-->>browser: cdn-rdc.ea-ad.ca/{content}
```

Our CDN domain is resolved by Cloudflare which proxies requests to the corresponding GCloud storage. This gives us:

- distributed caching; potential speed boost and takes load off the cloud storage (performance and cost bonus)
- fine grained caching rules; see configuration in the Cloudflare dashboard
- programatic cache resets; see selective Cloudflare cache clearing step in the deploy scripts
- easy and free HTTPS; Google storage itself only handles HTTP. Should we be concerned that the HTTPS is not end-to-end?
  - Secrecy is not a concern, all data from the CDN is public
  - privacy? Guess I don't actually know if Cloudflare includes initial requestor information when populating it's own cache, hm
  - integrity is still provided for the leg of the trip between cloudflare and the client, which covers the regional/local network boxes. What threat actors will be in a hop between Google and Cloudflare _and_ be willing to risk that access doing anything that threatens integrity? Well, maybe certain network-isolated state actors, hm

#### Sketch of typical static content loading sequence

```mermaid
sequenceDiagram
  participant browser as Browser at {domain + base path}/index-{variant}.html#35;{hash path}
  participant azure as IMTD Azure VM (resolves {domain + base path})
  participant cdn as InfoBase CDN
  participant ga as Google Analytics
  participant gf as Google Fonts

  browser->>azure: {domain + base path}/index-{variant}.html
  azure-->>browser: #%20;

  par index-{variant}.html resource
    browser->>ga: Analytics and tag manager init scripts
    ga-->>browser: #%20;

    browser->>cdn: header and footer SVGs
    cdn-->>browser: #%20;

    browser->>cdn: extended-bootstrap.css
    cdn-->>browser: #%20;

    browser->>cdn: app-{variant}.min.js, JS bundle entrypoint
    cdn-->>browser: #%20;
  end

  browser->>cdn: JS bundles for SPA init (polyfills, react + router and navigation level components, etc)
  cdn-->>browser: #%20;

  browser->>gf: Fonts
  gf-->>browser: #%20;

  browser->>cdn: "lookup" data bundle (legacy, populates core models, to be phased out at end of GraphQL port)
  cdn-->>browser: #%20;

  opt SPA run time resources, dependent on URL {hash path} location
    browser->>cdn: Additional JS bundles
    cdn-->>browser: #%20;

    browser->>cdn: Additional SVGs
    cdn-->>browser: #%20;

    browser->>cdn: Additional data bundles (legacy, to be phased out during GraphQL port)
    cdn-->>browser: #%20;
  end
```

Notes:

- see the `client/build_code` webpack configuration for more on the JS bundles. Note that they include CSS and text content (from yaml files) as well
- legacy "data bundles" come from two scripts in `client/build_code`, `copy_static_assets.js` and `write_footnote_bundles.js`
- `index-{variant}.html` files are not refreshed as part of the standard deploy, due to their legacy management outside of our CDN (in the production case). As a result, the resources directly requested from the html entry file are hardcoded too
  - `app-{variant}.min.js` must never be cached. It is the entry to the deploy-specific bundle . In practice it _is_ cached at the cloudflare level for performance; cached versions are flushed via the cloudflare API at deploy-time
  - other hardcoded index html resources may have relatively short client TTLs for performance, but are also flushed from cloudflare during deploys. Tradeoff that changes to them will not immediately propogate to all users
- `app-{variant}.min.js` needs to be as minimal as possible, it should only start the initial loading spinner and then kick off additional loading of the run time bundles. This gets the spinner going asap and makes up for the limited caching for this file

### GraphQL API

### Form Backend API
