import React from 'react';

export function Results({ results }) {
    if (!Object.keys(results).length)
        return null;

    return <>
        <pre>{JSON.stringify(results, null, 2)}</pre>
    </>

}