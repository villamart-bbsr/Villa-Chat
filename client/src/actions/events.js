import { CREATE, DELETE, FETCH_ALL, FETCH_EVENT, UPDATE, DELETE_BY_DATE_CREATORID } from '../constants/actionTypes';
import * as api from '../api/index';

export const getEvent = (id) => async (dispatch) => {
    try {
        const { data } = await api.fetchEvent(id);
        dispatch({ type: FETCH_EVENT, payload: data })
    } catch (error) {
        console.log(error.message);
    }
}

export const getEventByCreatorIdDate = (date) => async (dispatch) => {
    try {
        const { data } = await api.fetchEventByCreatorIdDate(date);
        dispatch({ type: FETCH_EVENT, payload: data });
    } catch (error) {
        console.log(error.message);
    }
}

export const getEvents = () => async (dispatch) => {
    try {
        const { data } = await api.fetchEvents();
        dispatch({ type: FETCH_ALL, payload: data })
        console.log(data);
    } catch (error) {
        console.log(error.message);
    }
}

export const createEvent = (event) => async (dispatch) => {
    try {
        const { data } = await api.createEvent(event);
        dispatch({ type: CREATE, payload: data })
    } catch (error) {
        console.log(error.message);
    }
}

export const updateEvent = (id, event) => async (dispatch) => {
    try {
        const { data } = await api.updateEvent(id, event);
        console.log(data);
        dispatch({ type: UPDATE, payload: data })
    } catch (error) {
        console.log(error.message);
    }
}

export const updateEventByCreatorIdDate = (date, event) => async (dispatch) => {
    try {
        const { data } = await api.updateEventByCreatorIdDate(date, event);
        dispatch({ type: UPDATE, payload: data })
    } catch (error) {
        console.log(error.message);
    }
}

export const deleteEvent = (id) => async (dispatch) => {
    try {
        await api.deleteEvent(id);
        dispatch({ type: DELETE, payload: id })
    } catch (error) {
        console.log(error.message);
    }
}

export const deleteEventByCreatorIdDate = (date) => async (dispatch) => {
    try {
        await api.deleteEventByCreatorIdDate(date);
        dispatch({ type: DELETE_BY_DATE_CREATORID, payload: date })
    } catch (error) {
        console.log(error.message);
    }
}

export const eventMessage = (value, id) => async (dispatch) => {
    try {
        const { data } = await api.sendMessage(value, id);
        console.log(data);
    } catch (error) {
        
    }
}
