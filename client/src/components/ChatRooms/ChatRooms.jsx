import React, { useEffect, useState } from 'react';
import ChatRoomItem from './ChatRoomItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import './ChatRooms.scss'
import { useSelector, useDispatch } from 'react-redux';
import { IconButton } from '@material-ui/core';
import CreateChatModal from './CreateChatModal';
import { useLocation } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import { getUsers } from '../../actions/users';

const ChatRooms = () => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('profile')));
    const { events } = useSelector((state) => state.events);
    const { conversations } = useSelector((state) => state.conversations);
    const users = useSelector((state) => state.users);
    const [options, setOptions] = useState([]);
    const [isShowing, setIsShowing] = useState(false);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        setCurrentUser(JSON.parse(localStorage.getItem('profile')));
        // Fetch users when component loads to populate attendee options
        dispatch(getUsers());
    }, [location, dispatch]);

    const openCreateChatModal = () => {
        setIsShowing(true);
        // Clear previous options and rebuild from current users
        setOptions([]);
        
        // Access the users array from the updated reducer structure
        const usersList = users.users || [];
        const newOptions = [];
        
        usersList.forEach(user => {
            if (user._id !== currentUser.result._id) {
                newOptions.push({ value: user._id, label: user.name });
            }
        });
        
        setOptions(newOptions);
        
        // If no users available, fetch them
        if (usersList.length === 0) {
            dispatch(getUsers());
        }
    }

    const closeCreateChatModal = () => {
        setIsShowing(false);
        setOptions([]);
    }

    return (
        <div className="chatrooms">
            { isShowing ? <div onClick={() => {closeCreateChatModal()}} className="back-drop"></div> : null }
            <div className="chatrooms__header">
                <div className="header__left">
                    <h5>Chat</h5>
                    <ExpandMoreIcon />
                </div>
                <div className="header__right">
                    <Tooltip title="New Chat">
                        <IconButton onClick={() => {openCreateChatModal()}}>
                            <img src="https://img.icons8.com/fluent-systems-regular/48/000000/edit-chat-history.png" alt="new chat" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <div className="chatrooms__rooms">
                {events.concat(conversations).sort((a, b) => new Date(b.UpdatedAt) - new Date(a.UpdatedAt)).map((event) => {
                    return (
                        <ChatRoomItem key={event._id} event={event} />
                    )
                })}
            </div>
            <CreateChatModal className="modal" show={isShowing} close={closeCreateChatModal} options={options} />
        </div>
    )
}

export default ChatRooms
