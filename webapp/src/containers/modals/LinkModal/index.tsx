import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import Modal from 'components/modal';
import Form from 'components/form';
import ResultPanel from 'components/resultPanel';

import plugin_constants from 'plugin_constants';

import {toggleShowLinkModal} from 'reducers/linkModal';
import {getLinkModalState} from 'selectors';

import usePluginApi from 'hooks/usePluginApi';
import useForm from 'hooks/useForm';
import useApiRequestCompletionState from 'hooks/useApiRequestCompletionState';

import Utils from 'utils';

const LinkModal = () => {
    const {linkProjectModal: linkProjectModalFields} = plugin_constants.form;

    // Hooks
    const {
        formFields,
        errorState,
        setSpecificFieldValue,
        onChangeFormField,
        resetFormFields,
        isErrorInFormValidation,
    } = useForm(linkProjectModalFields);
    const {makeApiRequestWithCompletionStatus, state, getApiState} = usePluginApi();
    const dispatch = useDispatch();

    // State variables
    const {visibility, organization, project} = getLinkModalState(state);
    const [showResultPanel, setShowResultPanel] = useState(false);

    // Function to hide the modal and reset all the states.
    const resetModalState = () => {
        dispatch(toggleShowLinkModal({isVisible: false, commandArgs: []}));
        resetFormFields();
        setShowResultPanel(false);
    };

    // Opens link project modal
    const handleOpenLinkProjectModal = () => {
        resetModalState();
        dispatch(toggleShowLinkModal({isVisible: true, commandArgs: []}));
    };

    // Handles on confirming link project
    const onConfirm = () => {
        if (!isErrorInFormValidation()) {
            // Make POST api request
            makeApiRequestWithCompletionStatus(
                plugin_constants.pluginApiServiceConfigs.createLink.apiServiceName,
                formFields as LinkPayload,
            );
        }
    };

    useApiRequestCompletionState({
        serviceName: plugin_constants.pluginApiServiceConfigs.createLink.apiServiceName,
        payload: formFields as LinkPayload,
        handleSuccess: () => {
            setShowResultPanel(true);
            dispatch(toggleShowLinkModal({isVisible: true, commandArgs: [], isActionDone: true}));
        },
    });

    // Set modal field values
    useEffect(() => {
        setSpecificFieldValue({
            organization,
            project,
        });
    }, [visibility]);

    const {isLoading, isError, error} = getApiState(plugin_constants.pluginApiServiceConfigs.createLink.apiServiceName, formFields as LinkPayload);

    return (
        <Modal
            show={visibility}
            title='Link New Project'
            onHide={resetModalState}
            onConfirm={onConfirm}
            confirmBtnText='Link New Project'
            cancelDisabled={isLoading}
            confirmDisabled={isLoading}
            loading={isLoading}
            showFooter={!showResultPanel}
            error={Utils.getErrorMessage(isError, 'LinkProjectModal', error as ApiErrorResponse)}
        >
            <>
                {
                    showResultPanel ? (
                        <ResultPanel
                            header='Project linked successfully.'
                            primaryBtnText='Link new project'
                            secondaryBtnText='Close'
                            onPrimaryBtnClick={handleOpenLinkProjectModal}
                            onSecondaryBtnClick={resetModalState}
                        />
                    ) : (
                        Object.keys(linkProjectModalFields).map((field) => (
                            <Form
                                key={linkProjectModalFields[field as LinkProjectModalFields].label}
                                fieldConfig={linkProjectModalFields[field as LinkProjectModalFields]}
                                value={formFields[field as LinkProjectModalFields] ?? null}
                                onChange={(newValue) => onChangeFormField(field as LinkProjectModalFields, newValue)}
                                error={errorState[field as LinkProjectModalFields]}
                                isDisabled={isLoading}
                            />
                        ))
                    )
                }
            </>
        </Modal>
    );
};

export default LinkModal;
