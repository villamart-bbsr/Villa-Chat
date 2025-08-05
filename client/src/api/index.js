import axios from 'axios';

const API = axios.create({ 
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('profile')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
    }
    return req;
});

// Auth endpoints
export const signIn = (profile) => API.post('/user/signin', profile);
export const signUp = (profile) => API.post('/user/signup', profile);
export const microsoftSignup = (profile) => API.post('/user/microsoftsignup', profile);

// Event endpoints
export const fetchEvent = (id) => API.get(`/events/${id}`);
export const fetchEventByCreatorIdDate = (date) => API.get(`/events/${date}/getEvent`);
export const fetchEvents = () => API.get('/events');
export const createEvent = (newEvent) => API.post('/events', newEvent);
export const updateEvent = (id, event) => API.patch(`/events/${id}`, event);
export const updateEventByCreatorIdDate = (date, event) => API.patch(`/events/${date}/updateEvent`, event);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const deleteEventByCreatorIdDate = (date) => API.delete(`/events/${date}/delEvent`);

// User endpoints
export const getUsers = () => API.get('/users');
export const getUsersBySearch = (searchQuery) => {
    console.log('🌐 API: Making search request for:', searchQuery);
    console.log('🔗 API: Request URL:', `/users/search?searchQuery=${searchQuery}`);
    return API.get(`/users/search?searchQuery=${searchQuery}`);
};

// Messaging endpoints
export const sendMessage = (message, id) => API.post(`/events/${id}/eventMsg`, message);

// Conversation endpoints
export const fetchConversations = () => API.get('/conversations');
export const fetchConversation = (id) => API.get(`/conversations/${id}`);
export const updateConversation = (message, id) => API.patch(`/conversations/${id}`, message);
export const createConversation = (newConversation) => API.post('/conversations', newConversation);
export const updateGroupDetails = (id, groupData) => API.put(`/conversations/${id}/group`, groupData);