import { first_true_promise } from './models/general_utils.js/index.js';

describe("first_true_promise", function(){

  it("Given an array of promises, resolves to true after the first promise resolves truthy, or false if none resolve truthy", async () => {
    // Based on https://stackoverflow.com/a/51160727
    var test_first_true_promise = test_values => first_true_promise(
      test_values.map(
        (test_value) => new Promise((resolve) => {
          setTimeout(() => resolve(test_value), Math.round(Math.random() * 1000));
        })
      )
    );

    const test_results = await Promise.all([
      test_first_true_promise([true, true, true]),
      test_first_true_promise([false, false, false]),
      test_first_true_promise([true, false, false]),
      test_first_true_promise([false, true, false]),
      test_first_true_promise([false, false, true]),
    ]);
    
    return expect(test_results).toEqual([true, false, true, true, true]);
  });

});