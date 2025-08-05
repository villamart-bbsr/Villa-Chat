import { FETCH_CONVERSATIONS, FETCH_CONVERSATION, CREATE_CONVERSATION, UPDATE_GROUP_DETAILS } from '../constants/actionTypes';
import * as api from '../api/index';

export const getConversations = () => async (dispatch) => {
    try {
        const { data } = await api.fetchConversations();
        dispatch({ type: FETCH_CONVERSATIONS, payload: data })
        console.log(data);
    } catch (error) {
        console.log(error.message);
    }
}

export const getConversation = (id) => async (dispatch) => {
    try {
        const { data } = await api.fetchConversation(id);
        dispatch({ type: FETCH_CONVERSATION, payload: data })
    } catch (error) {
        console.log(error.message);
    }
}

export const updateConversation = (value, id) => async (dispatch) => {
    try {
        const { data } = await api.updateConversation(value, id);
        console.log(data);
    } catch (error) {
        console.log(error.message);
    }
}

export const createConversation = (conversationData) => async (dispatch) => {
    try {
        const { data } = await api.createConversation(conversationData);
        dispatch({ type: CREATE_CONVERSATION, payload: data });
    } catch (error) {
        console.log(error.message);
    }
}

export const updateGroupDetails = (id, groupData) => async (dispatch) => {
    try {
        const { data } = await api.updateGroupDetails(id, groupData);
        dispatch({ type: UPDATE_GROUP_DETAILS, payload: data });
        return data;
    } catch (error) {
        console.log('Error updating group details:', error.message);
        throw error;
    }
}
