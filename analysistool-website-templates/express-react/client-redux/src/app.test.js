import { render, screen } from "@testing-library/react";
import App from "./app";

test("renders heading", () => {
  render(<App />);
  const element = screen.getByText(/sample application template/i);
  expect(element).toBeInTheDocument();
});
