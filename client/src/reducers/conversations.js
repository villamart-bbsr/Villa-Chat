import { FETCH_CONVERSATIONS, FETCH_CONVERSATION, CREATE_CONVERSATION, UPDATE_GROUP_DETAILS } from '../constants/actionTypes';

const conversationReducer = (state = { conversations: [] }, action) => {
    switch (action.type) {
        case FETCH_CONVERSATIONS:
            return  { ...state, conversations: action.payload };

        case FETCH_CONVERSATION:
            return  { ...state, conversation: action.payload };

        case CREATE_CONVERSATION:
            return { ...state, conversations: [...state.conversations, action.payload] };    

        case UPDATE_GROUP_DETAILS:
            return {
                ...state,
                conversation: action.payload,
                conversations: state.conversations.map((conv) =>
                    conv._id === action.payload._id ? action.payload : conv
                )
            };

        default:
            return state;
    }
};

export default conversationReducer;

