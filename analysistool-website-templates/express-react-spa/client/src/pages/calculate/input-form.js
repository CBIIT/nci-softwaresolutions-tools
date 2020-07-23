import React from 'react';
import { useSelector } from 'react-redux';
import{
    dispatchInput,
    getInitialState,
} from "../../services/store";

export function InputForm({ 
    className = '', 
    onSubmit = (formValue) => {},
    onReset = (formValue) => {},
}) {

    /** Getters for values in redux */
    const {
        a,
        b,
        c,
    } = useSelector((state) => state.input);

    /**
     * Merges an event target's value into redux store
     * @param {React.FormEvent} event 
     */
    function handleChange(event) {
        let { name, type, checked, value } = event.target;

        if (type === 'checkbox')
            value = Boolean(checked);

        else if (type === 'number')
            value = Number(value);

        dispatchInput({[name]: value });
    }

    /**
     * Calls onSubmit with the current values in redux store
     * @param {React.FormEvent} event 
     */
    function handleSubmit(event) {
        event.preventDefault();
        console.log({a,b,c})
        onSubmit && onSubmit({a,b,c});
    }

    /**
     * Resets redux store and calls onReset
     * @param {React.FormEvent} event 
     */
    function handleReset(event) {
        const initialState = getInitialState().input;
        event.preventDefault();
        dispatchInput(initialState);
        onReset && onReset(initialState);
    }

    /**
     * Validates current parameters
     * @return {Boolean} True if valid, false if invalid
     */
    function validate() {
        // sample validation logic
        return (a && b && c);
    }

    return (
        <form className={className}>
            <div className="form-group">
                <label htmlFor="a" className="font-weight-semibold">Value A</label>
                <input type="number" id="a" name="a" className="form-control" value={a} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label htmlFor="b" className="font-weight-semibold">Value B</label>
                <input type="number" id="b" name="b" className="form-control" value={b} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label htmlFor="c" className="font-weight-semibold">Value C</label>
                <input type="number" id="c" name="c" className="form-control" value={c} onChange={handleChange} />
            </div>

            <div className="text-right">
                <button
                    type="reset"
                    className="btn btn-outline-danger mr-1"
                    onClick={handleReset}>
                    Reset
                </button>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!validate()}
                    onClick={handleSubmit}>
                    Submit
                </button>
            </div>


        </form>
    );
}