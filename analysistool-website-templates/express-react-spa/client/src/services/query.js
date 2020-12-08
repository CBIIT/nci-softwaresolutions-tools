/**
 * Serializes an object as a query string
 * @param {object} obj
 */
export function asQueryString(obj) {
    const query = [];
    for (let key in obj) {
      let value = obj[key];
  
      // treat arrays as comma-delineated lists
      if (Array.isArray(value)) 
        value = value.join(',');
  
      // exclude undefined or null values
      if (![undefined, null].includes(value))
        query.push([key, value].map(encodeURIComponent).join('='));
    }
    return '?' + query.join('&');
}
  
export function fetchJSON(url, params) {
    return fetch(url, {
        ...params,
        headers: {
            ...(params ? params.headers : null), 
            'Content-Type': 'application/json',
            'Accept': 'applciation/json',
        },
    }).then(response => response.json());
}

export function query(url, params, fetchParams) {
    return fetchJSON(`${url}${asQueryString(params)}`, fetchParams);
}
