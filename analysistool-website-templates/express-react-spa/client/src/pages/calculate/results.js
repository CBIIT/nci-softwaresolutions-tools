import React from "react";
import { Card } from "react-bootstrap";

export function Results({ results, children }) {
  return (
    <>
      <Card className="shadow">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h1 className="h5 my-0">Results</h1>
        </Card.Header>
        <Card.Body>
          {children}
          {results.value ? (
            <pre>{JSON.stringify(results.value, null, 4)}</pre>
          ) : (
            <p className="lead text-center my-5">Please submit calculation parameters</p>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
