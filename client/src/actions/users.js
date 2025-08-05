import * as api from '../api/index';
import { FETCH_USERS, FETCH_USERS_BY_SEARCH } from '../constants/actionTypes';

export const getUsers = () => async (dispatch) => {
    try {
        const { data } = await api.getUsers();
        dispatch({ type: FETCH_USERS, payload: data })
    } catch (error) {
        console.log(error);
    }
}

export const getUsersBySearch = (searchQuery) => async (dispatch) => {
    try {
        console.log('🔍 Searching for users with query:', searchQuery);
        const { data } = await api.getUsersBySearch(searchQuery);
        console.log('✅ Search API response:', data);
        dispatch({ type: FETCH_USERS_BY_SEARCH, payload: data });
        return data;
    } catch (error) {
        console.error('❌ Search API error:', error);
        console.error('Error details:', error.response?.data || error.message);
    }
}