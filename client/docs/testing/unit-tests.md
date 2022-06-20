# Unit tests

Name convention: [module].unit-test.[js|ts|tsx]  
Command: `npm run unit-tests`

TODO: some of these tips are more global testing things, but I'll leave them here for now so they get seen

## Tips

1. Mock most things! TODO: some of these examples could be turned in to defaults or reusable mocks, but right now all unit tests are responsible for their own mocks.

- mock `text_maker`s to just return their text keys by default e.g.
  ```
    import { trivial_text_maker } from "src/models/text";
    jest.mock("src/models/text");
    const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
    typeof trivial_text_maker
    >;
    mocked_trivial_text_maker.mockImplementation((key: string) => key);
  ```
  - note the `as jest.MockedFunction<typeof ...>` in the previous example, necessary to fill in the type information
- You can mock `global`s too, just remember to retain the original and revert the mocking when done e.g.

  ```
    const orignal_fetch = global.fetch;
    const mocked_fetch = jest.fn(() => Promise.resolve({}));
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.fetch = mocked_fetch as any;
    });
    beforeEach(() => {
      mocked_fetch.mockClear();
    });
    afterAll(() => {
      global.fetch = orignal_fetch;
    });
  ```

- mock different `injected_build_constants` in seperate files with naming convention: `ComponentName--InjectedBuildConstant.unit-test.tsx` (ex: `Checkbox--a11y.unit-test.tsx`). Mocking these types of constants have proven to be tricky. Seems like there is no clear solution to mocking one constant with different values in one file. Only the first mocked value is considered in a file. However, it is possible to mock exported functions (and manipulate the function's return). Can look to convert these constants to functions later on to allow for all mockings to be done within one file.
  ```
    jest.mock("src/core/injected_build_constants", () => ({
      is_a11y_mode: true,
    }));
  ```

2. When testing a case that _should_ throw an error, wrap your test code in `with_console_error_silenced` from `testing_utils.ts`. Otherwise error output will clutter up the console even if caught. Note: not useful for a promise that rejects with an error, silence those as necessary with a `.catch(() => undefined)`.

3. `jest-test-gen` package can be somewhat useful for producing a quick test template, especially for a file with lots of imports to mock/individual exports to test. Run with `npx jest-test-gen <path to file>`. Warning, the output needs to be renamed, potentially cleaned up (e.g. might not want to keep all of the mocks), and double checked (e.g. I've seen it fail to make place holder tests for some exports before, not certain why yet). A decent starting point template though.
