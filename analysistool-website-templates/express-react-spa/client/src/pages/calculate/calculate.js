import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { LoadingOverlay } from '../../components/loading-overlay/loading-overlay';
import { InputForm } from './input-form';
import { Results } from './results';
import { fetchJSON } from '../../services/query';

export function Calculate() {
    const [results, setResults] = useState({});
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    /**
     * Handles form submission and saves results
     * @param {object} params 
     */
    async function handleSubmit(params) {
        setResults({});
        setMessages([]);

        try {
            setLoading(true);
            const results = await fetchJSON('submit', {
                method: 'POST',
                body: params
            });
            setResults(results);
        } catch (error) {
            setMessages([{ type: 'danger', text: error }]);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Handles form reset events
     */
    function handleReset() {
        setResults({});
        setMessages([]);
        setLoading(false);
    }

    /**
     * Removes a message from the list of messages
     * @param {number} index 
     */
    function removeMessage(index) {
        setMessages(messages.filter((e, i) => i !== index))
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