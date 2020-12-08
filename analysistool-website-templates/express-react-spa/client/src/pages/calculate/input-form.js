import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';
import { getInitialState } from '../../services/store/params';

export function InputForm({
    className = '', 
    params, 
    onSubmit = _ => {},
    onReset = _ => {}
}) {
    const [formValue, setFormValue] = useState(params);
    const [validated, setValidated] = useState(false);
    useEffect(() => setFormValue(params), [params]);

    function handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        setValidated(true);
        if (e.target.checkValidity()) 
            onSubmit(formValue);
    }

    function handleReset(e) {
        e.preventDefault();
        setFormValue(getInitialState());
        setValidated(false);
        onReset();
    }

    function handleChange(ev) {
        const { name, value } = ev.target;
        setFormValue({
            ...formValue,
            [name]: value
        });
    }

    return (
        <form 
            noValidate
            className={validated ? 'was-validated' : 'needs-validation'}
            onSubmit={handleSubmit} 
            onReset={handleReset} >
            <Card className={className}>
                <Card.Header className="bg-primary text-white">
                    <h1 className="h5 my-0">Parameters</h1>
                </Card.Header>
                <Card.Body>
                    <div className="form-group">
                        <label 
                            htmlFor="a" 
                            className="font-weight-bold">
                            Parameter A
                        </label>
                        <input
                            id="a" 
                            name="a" 
                            type="number"
                            value={formValue.a}
                            onChange={handleChange}
                            className="form-control" 
                            required />
                        <div className="invalid-feedback">
                            This field is required.
                        </div>
                    </div>

                    <div className="form-group">
                        <label 
                            htmlFor="b" 
                            className="font-weight-bold">
                            Parameter B
                        </label>
                        <input
                            id="b" 
                            name="b" 
                            type="number"
                            value={formValue.b}
                            onChange={handleChange}
                            className="form-control"
                            required />
                        <div className="invalid-feedback">
                            This field is required.
                        </div>                            
                    </div>
                        
                </Card.Body>
                <Card.Footer className="text-right bg-white">
                    <Button variant="danger-outline" type="reset" className="mr-2">Clear</Button>
                    <Button variant="primary" type="submit">Submit</Button>
                </Card.Footer>
            </Card>
        </form>
    );
}
