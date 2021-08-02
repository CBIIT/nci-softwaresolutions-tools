import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Loader from "../common/loader";
import InputForm from "./input-form";
import { getResults } from "../../services/query";
import { resultsState } from "./analysis.state";
const { setResults, resetResults } = resultsState.actions;

export default function Analysis() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const results = useSelector(state => state.results);

  async function handleSubmit(params) {
    try {
      setLoading(true);
      const results = await getResults(params);
      dispatch(setResults(results));
    } catch (e) {
      console.error("handleSubmit", e);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    dispatch(resetResults());
  }

  return (
    <>
      <Loader fullscreen show={loading}>
        Loading
      </Loader>
      <Container className="my-3">
        <Row>
          <Col md={4}>
            <Card className="shadow-sm mb-3 position-relative" style={{ minHeight: "100px" }}>
              <Card.Body>
                <InputForm onSubmit={handleSubmit} onReset={handleReset} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Tab.Container id="results-tabs" defaultActiveKey="results-1">
              <Card className="shadow-sm mb-3" style={{ minHeight: "400px" }}>
                <Card.Header>
                  <Nav variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="results-1">Results Tab 1</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="results-2">Results Tab 2</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="results-3">Results Tab 3</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>
                <Card.Body>
                  <Tab.Content>
                    <Tab.Pane eventKey="results-1">
                      <h2 className="text-primary h3">Results 1</h2>
                      <pre>{JSON.stringify(results, null, 2)}</pre>
                    </Tab.Pane>
                    <Tab.Pane eventKey="results-2">
                      <h2 className="text-primary h3">Results  2</h2>
                      <pre>{JSON.stringify(results, null, 2)}</pre>
                    </Tab.Pane>
                    <Tab.Pane eventKey="results-3">
                      <h2 className="text-primary h3">Results  3</h2>
                      <pre>{JSON.stringify(results, null, 2)}</pre>
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Card>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
    </>
  );
}
