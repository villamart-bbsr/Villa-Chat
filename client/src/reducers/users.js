import { FETCH_USERS_BY_SEARCH, FETCH_USERS } from '../constants/actionTypes';

const userReducer = (state = { users: [], searchResults: [] }, action) => {
    switch (action.type) {
        case FETCH_USERS:
            return {
                ...state,
                users: action.payload
            };

        case FETCH_USERS_BY_SEARCH:
            return {
                ...state,
                searchResults: action.payload
            };

        default:
            return state;
    }
};

export default userReducer;
