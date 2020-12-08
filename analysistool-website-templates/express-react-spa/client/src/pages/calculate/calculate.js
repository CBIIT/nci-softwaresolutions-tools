import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { LoadingOverlay } from '@cbiitss/react-components';
import { actions as paramsActions } from '../../services/store/params';
import { actions as resultsActions } from '../../services/store/results';
import { actions as messagesActions } from '../../services/store/messages';
import { fetchJSON } from '../../services/query';
import { InputForm } from './input-form';
import { Results } from './results';
const actions = { ...paramsActions, ...resultsActions, ...messagesActions };

export function Calculate() {
    const dispatch = useDispatch();
    const params = useSelector(state => state.params)
    const results = useSelector(state => state.results);
    const messages = useSelector(state => state.messages);
    const addMessage = message => dispatch(actions.addMessage(message));
    const mergeResults = results => dispatch(actions.mergeResults(results));
    const mergeParams = params => dispatch(actions.mergeParams(params));
    const resetParams = _ => dispatch(actions.resetParams());
    const resetResults = _ => dispatch(actions.resetResults());
    const resetMessages = _ => dispatch(actions.resetMessages());
    const removeMessageByIndex = index => dispatch(actions.removeMessageByIndex(index));

    async function handleSubmit(params) {
        mergeParams(params);
        resetResults();
        resetMessages();
        window.scrollTo(0, 0);

        try {
            mergeResults({loading: true});
            const results = await fetchJSON('api/submit', {
                method: 'post',
                body: JSON.stringify(params)
            });
            mergeResults({value: results});
        } catch (e) {
            addMessage({type: 'danger', text: e.message});
        } finally {
            mergeResults({loading: false});
        }
    }

    function handleReset() {
        resetParams();
        resetResults();
        resetMessages();
    }
    
    return <>
        <LoadingOverlay active={results.loading} overlayStyle={{ position: 'fixed' }} />
        <div className="container my-4">

            <div className="row">
                <div className="col-md-4">
                    <InputForm 
                        params={params} 
                        onSubmit={handleSubmit} 
                        onReset={handleReset}
                        className="mb-4 shadow" />
                </div>
                <div className="col-md-8">
                    <Results results={results} params={params}>
                        {messages.map((message, i) =>
                            <Alert
                                className="white-space-pre-wrap shadow"
                                key={`results-alert-${i}`}
                                variant={message.type}
                                dismissible
                                onClose={e => removeMessageByIndex(i)}>
                                {message.text}
                            </Alert>)}
                    </Results>
                </div>
            </div>
        </div>
    </>
}