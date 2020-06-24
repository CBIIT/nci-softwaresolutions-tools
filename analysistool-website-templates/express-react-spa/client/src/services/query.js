
/**
 * Converts an object to a query string
 * @param {{[s: string]: any}} params Specifies the object to convert
 * @returns {string} The converted query string
 */
export function asQueryString(params) {
    return '?' + Object.entries(params)
        .map(keyValue => keyValue
            .map(String)
            .map(encodeURIComponent)
            .join('='))
        .join('&')
}

/**
 * Fetches a JSON resource
 * @param {string} url - Specifies URL of resource to fetch.
 * @param {object} options - Specifies options passed to fetch.
 * If options.params exists, it will be converted to a query
 * string and appended to the url
 * @returns {Promise<object>} A JSON resource
 * @throws {Promise<string>} The response body if an exception occured
 */
export async function fetchJSON(url, options) {

    // converts query parameters to a string if provided
    if (options.params) {
        url += asQueryString(options.params);
    }

    // creates fetch options 
    let fetchOptions = Object.assign({}, options, {
        headers: {
            ...options.headers,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: typeof options.body == 'string'
            ? options.body
            : JSON.stringify(options.body)
    });

    console.log(options, fetchOptions);

    const response = await fetch(url, fetchOptions);

    if (response.ok) {
        return await response.json();
    } else {
        throw(await response.text());
    }
}