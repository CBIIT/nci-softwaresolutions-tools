import React, { useState } from 'react';

export function InputForm({ 
    className = '', 
    onSubmit = (formValue) => {},
    onReset = (formValue) => {},
}) {

    /** Default values for the form */
    const defaultFormValue = {
        a: '',
        b: '',
        c: ''
    };

    /** Getter and setter for the form's input values */
    const [formValue, setFormValue] = useState({...defaultFormValue});

    /**
     * Merges an event target's value into formValue
     * @param {React.FormEvent} event 
     */
    function handleChange(event) {
        let { name, type, checked, value } = event.target;

        if (type === 'checkbox')
            value = Boolean(checked);

        else if (type === 'number')
            value = Number(value);

        setFormValue({ ...formValue, [name]: value });
    }

    /**
     * Calls onSubmit with the current formValue
     * @param {React.FormEvent} event 
     */
    function handleSubmit(event) {
        event.preventDefault();
        onSubmit && onSubmit(formValue);
    }

    /**
     * Resets the current formValue and calls onReset
     * @param {React.FormEvent} event 
     */
    function handleReset(event) {
        event.preventDefault();
        setFormValue(defaultFormValue);
        onReset && onReset(defaultFormValue);
    }

    /**
     * Validates current parameters
     * @param {any} params 
     * @return {Boolean} True if valid, false if invalid
     */
    function validate(formValue) {
        // sample validation logic
        return (formValue.a && formValue.b && formValue.c);
    }

    return (
        <form className={className}>
            <div className="form-group">
                <label htmlFor="a" className="font-weight-semibold">Value A</label>
                <input type="number" id="a" name="a" className="form-control" value={formValue.a} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label htmlFor="b" className="font-weight-semibold">Value B</label>
                <input type="number" id="b" name="b" className="form-control" value={formValue.b} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label htmlFor="c" className="font-weight-semibold">Value C</label>
                <input type="number" id="c" name="c" className="form-control" value={formValue.c} onChange={handleChange} />
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
                    disabled={!validate(formValue)}
                    onClick={handleSubmit}>
                    Submit
                </button>
            </div>


        </form>
    );
}