export function getResults(params) {
  // replace the following stub
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1e9),
        params,
      });
    }, Math.random() * 1000);
  });
}
