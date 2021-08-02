import { useSelector, useDispatch } from "react-redux";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { formValuesState } from "./analysis.state";
const { mergeFormValues, resetFormValues } = formValuesState.actions;

export default function InputForm({ onSubmit, onReset }) {
  const formValues = useSelector(state => state.formValues);
  const dispatch = useDispatch();

  function handleChange(event) {
    let { name, value } = event.target;
    dispatch(mergeFormValues({ [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(formValues);
    }
  }

  function handleReset(event) {
    event.preventDefault();
    dispatch(resetFormValues())
    resetFormValues();
    if (onReset) {
      onReset();
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit} onReset={handleReset}>
        <h2 className="h5 text-primary mb-4">Sample Input Form</h2>

        <Form.Group controlId="sampleInput" className="mb-3">
          <Form.Label className="required">Sample Input</Form.Label>
          <Form.Control
            type="text"
            name="sampleInput"
            placeholder="Enter sample input"
            value={formValues.sampleInput}
            onChange={handleChange}></Form.Control>
        </Form.Group>

        <div className="text-end">
          <Button type="reset" variant="danger-outline" className="me-1">
            Reset
          </Button>

          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
}
