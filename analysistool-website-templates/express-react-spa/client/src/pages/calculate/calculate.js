import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { LoadingOverlay } from '../../components/loading-overlay/loading-overlay';
import { InputForm } from './input-form';
import { Results } from './results';
import { fetchJSON } from '../../services/query';

import {
    dispatchCalculate, getInitialState,
} from '../../services/store';
import { useSelector } from 'react-redux';

export function Calculate() {

    /** Getters for values in redux */
    const{
        results,
        messages,
        loading,
    } = useSelector((state) => state.calculate);

    /**
     * Handles form submission and saves results
     * @param {object} params 
     */
    async function handleSubmit(params) {
        dispatchCalculate({ results: {} })
        dispatchCalculate({ messages: [] })

        try {
            dispatchCalculate({ loading: true })
            const results = await fetchJSON('submit', {
                method: 'POST',
                body: params
            });
            dispatchCalculate({ results: results })
        } catch (error) {
            dispatchCalculate({ messages: [{ type: 'danger', text: error }] })
        } finally {
            dispatchCalculate({ loading: false })
        }
    }

    /**
     * Handles form reset events
     */
    function handleReset() {
        dispatchCalculate(getInitialState().calculate)
    }

    /**
     * Removes a message from the list of messages
     * @param {number} index 
     */
    function removeMessage(index) {
        const messageList = messages.filter((e, i) => i !== index);
        dispatchCalculate({ messages: messageList });
    }

    return (
        <div className="container my-4">
            <LoadingOverlay active={loading} />
            <h1 className="h4 mb-4">Calculation</h1>
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <InputForm className="card-body" onSubmit={handleSubmit} onReset={handleReset} />
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            {messages.map((message, i) =>
                                <Alert
                                    key={`message-${i}`}
                                    variant={message.type}
                                    dismissible
                                    onClose={e => removeMessage(i)}>
                                    {message.text}
                                </Alert>
                            )}
                            {<Results results={results} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}