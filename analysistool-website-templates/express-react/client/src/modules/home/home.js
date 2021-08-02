import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import HomeImage from "./images/home.svg";

export default function Home() {
  return (
    <>
      <div className="cover-image py-5 mb-4 shadow-sm" style={{ backgroundImage: `url(${HomeImage})` }}>
        <Container>
          <h1 className="display-4 mb-4">
            <span className="d-inline-block py-4 border-bottom border-dark">Application Template</span>
          </h1>

          <p className="lead">Application description</p>
          <NavLink className="btn btn-outline-primary" to="analysis">
            Sample Call to Action
          </NavLink>
        </Container>
      </div>

      <Container className="mb-4">
        <Row>
          <Col md={4}>
            <h2 className="text-primary">Sample Introduction</h2>
          </Col>
          <Col md={8}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam scelerisque ligula vel velit pulvinar, ac
              tempor urna finibus. Nullam ornare nibh vitae tellus cursus, nec consequat dui aliquam. Donec eget nisl eu
              ligula vulputate congue id fermentum tortor. In a augue a sem accumsan sagittis. Aenean commodo, purus at
              pretium ultricies, enim mauris mattis orci, nec porttitor tellus turpis eu sapien. Donec luctus, purus nec
              dapibus pharetra, libero lacus commodo ex, vitae pharetra enim orci eget nunc. Integer vitae turpis
              commodo, ullamcorper neque id, pretium sem. Aliquam tempor consequat nibh id tincidunt. Sed sed mauris eu
              lectus dignissim luctus. Donec ac sagittis sapien. Sed lobortis ipsum in sapien lacinia, eget imperdiet
              nisl molestie. Ut consequat, sem id gravida maximus, nibh elit ornare risus, non ullamcorper felis est
              eget lacus.
            </p>

            <p>
              Vestibulum non odio auctor, varius eros quis, mollis tortor. Aenean tincidunt metus ac ante condimentum
              maximus. Duis commodo odio nec eros condimentum, ut vulputate ligula placerat. Quisque mauris massa,
              imperdiet at auctor in, ultrices id mi. Phasellus eget ullamcorper purus. Curabitur ut dolor diam.
              Pellentesque laoreet massa et efficitur eleifend. Cras accumsan lectus at nulla facilisis aliquet. Donec
              bibendum felis at quam molestie, at mollis felis posuere. Praesent imperdiet nisl non dignissim congue.
              Praesent faucibus dapibus sagittis. Aliquam non est ultrices, porttitor diam non, lobortis velit. Praesent
              vulputate massa at tincidunt facilisis.
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}
