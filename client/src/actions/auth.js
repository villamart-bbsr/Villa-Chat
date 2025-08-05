import { AUTH } from '../constants/actionTypes';
import * as api from '../api/index';

export const signin = (form, history) => async (dispatch) => {
    try {
        console.log('🔐 Signin action called with:', form);
        const { data } = await api.signIn(form);
        console.log('✅ Signin successful:', data);
        dispatch({ type: AUTH, data });
        history.push('/calendar');
    } catch (error) {
        console.error('❌ Signin error:', error);
        console.error('Error response:', error.response?.data);
    }
}

export const signup = (form, history) => async (dispatch) => {
    try {
        console.log('📝 Signup action called with:', form);
        const { data } = await api.signUp(form);
        console.log('✅ Signup successful:', data);
        dispatch({ type: AUTH, data });
        history.push('/calendar')
    } catch (error) {
        console.error('❌ Signup error:', error);
        console.error('Error response:', error.response?.data);
    }
}

export const microsoftSignup = (form, data, history) => async (dispatch) => {
    try {
        // eslint-disable-next-line no-unused-vars
        const { res } = await api.microsoftSignup(form);
        dispatch({ type: AUTH, data });
        history.push('/calendar')
    } catch (error) {
        console.log(error);
    }
}