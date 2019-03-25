// Based on https://stackoverflow.com/a/51160727
export function first_true_promise(original_promises) {
  const new_promises = original_promises.map(
    promise => new Promise(
      (resolve, reject) => promise.then(response => response && resolve(true), reject)
    )
  );
  new_promises.push( Promise.all(original_promises).then( () => false ) );
  return Promise.race(new_promises);
}