TODO:

- integration tests between files and their own yaml, in cases where the yaml contains logic, will be something of their own special case
- won't be writing these soon, LOTS of cross-cutting systems that will need something like global mocking or lots of pre-test setup steps
  - probably make sure injected build constants all have defaults via test setup script, although always mocking them _might_ also work (... except for anything initialized pre-test?)
  - .interop.scss might be an issue, that's a fancy custom loader and I haven't thought through how jest will deal with it (might need to tweak how the interop.scss loader works, maybe write actual modules instead of just types)
  - Subjects, Tables, and other data stores...
  - text_maker
    - integration tests that need to test yaml will need handlebar helpers initialized, probably just do that from the integration test setup script
    - integration tests will need a transform to handle yaml in a consistent way to our custom yaml loader
