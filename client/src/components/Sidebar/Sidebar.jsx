import React, { useEffect, useState } from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import './Sidebar.scss';
import SidebarItem from './SidebarItem';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { v1 as uuid } from 'uuid';
import { useDispatch } from 'react-redux';
import { createEvent } from '../../actions/events';
import moment from 'moment';
// import { GitHubLogin } from '@react-oauth/github'; // NEW
import { getAccessToken } from '../../api/github';

function Sidebar() {
    const [auth, setAuth] = useState(JSON.parse(localStorage.getItem('git_oauth')));
    const location = useLocation();
    const history = useHistory();
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('profile')));
    const [videoId, setVideoId] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        setCurrentUser(JSON.parse(localStorage.getItem('profile')));
        setAuth(JSON.parse(localStorage.getItem('git_oauth')));
    }, [location]);

    // const handleGitHubSuccess = async (credentialResponse) => {
    //     try {
    //         const result = await getAccessToken(credentialResponse.code); // your backend handles `code` exchange
    //         console.log(result);
    //         localStorage.setItem('git_oauth', JSON.stringify(result));
    //         setAuth(result);
    //     } catch (error) {
    //         console.error("GitHub Login Error:", error);
    //     }
    // };

    // const handleGitHubError = () => {
    //     console.error("GitHub login failed");
    // };

    const createId = () => {
        const id = uuid();
        history.push(`/board/${id}`);
    };

    const isActiveRoute = (path) => {
        const currentPath = location.pathname;
        if (path === '/chat') return currentPath === '/chat';
        if (path === '/github') return currentPath === '/github';
        if (path === '/calendar') return currentPath === '/calendar';
        if (path === '/board') return currentPath.startsWith('/board/');
        if (path === '/room') return false;
        return false;
    };

    const createNewEvent = () => {
        const meetingId = uuid();
        setVideoId(meetingId);
        dispatch(createEvent({
            Subject: `Meeting on ${moment(new Date()).format("DD/MM/YYYY")}`,
            StartTime: new Date(),
            EndTime: new Date(new Date().setHours(new Date().getHours() + 1)),
            _id: meetingId,
            Creator: currentUser?.result?.name,
            CreatorId: currentUser?.result?._id,
        }));
    };

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__logo">
                    <div className="logo-icon">VC</div>
                </div>
            </div>

            <div className="sidebar__content">
                <Link to={`/room/${videoId}`} target="_blank">
                    <div onClick={createNewEvent}>
                        <SidebarItem 
                            icon="https://img.icons8.com/ios/36/000000/video-conference.png"
                            text="New Meeting"
                            hoverIcon="https://img.icons8.com/ios-filled/36/48bb78/video-conference.png"
                            primary={true}
                            isActive={isActiveRoute('/room')}
                        />
                    </div>
                </Link>

                <Link to="/chat">
                    <SidebarItem
                        icon="https://img.icons8.com/fluent-systems-regular/48/000000/chat-message.png"
                        text="Chat"
                        hoverIcon="https://img.icons8.com/fluent-systems-filled/48/48bb78/chat-message.png"
                        isActive={isActiveRoute('/chat')}
                    />
                </Link>

                {/* {auth ? (
                    <Link to="/github">
                        <SidebarItem
                            icon="https://img.icons8.com/ios/36/000000/github--v1.png"
                            text="GitHub"
                            hoverIcon="https://img.icons8.com/ios-filled/36/48bb78/github.png"
                            isActive={isActiveRoute('/github')}
                        />
                    </Link>
                ) : (
                    <div className="auth__button">
                        <GitHubLogin
                            onSuccess={handleGitHubSuccess}
                            onError={handleGitHubError}
                            authorizationParams={{
                                client_id: 'f6099a354e555e602bcb',
                                scope: 'read:user repo admin:org',
                                redirect_uri: `${window.location.origin}/github`, // optional
                            }}
                        />
                    </div>
                )} */}

                <div onClick={createId}>
                    <SidebarItem
                        icon="https://img.icons8.com/ios/36/000000/whiteboard.png"
                        text="Whiteboard"
                        hoverIcon="https://img.icons8.com/ios-filled/36/48bb78/whiteboard.png"
                        isActive={isActiveRoute('/board')}
                    />
                </div>

                <Link to="/calendar">
                    <SidebarItem
                        icon="https://img.icons8.com/fluent-systems-regular/48/000000/calendar--v1.png"
                        text="Calendar"
                        hoverIcon="https://img.icons8.com/fluent-systems-filled/48/48bb78/calendar--v1.png"
                        isActive={isActiveRoute('/calendar')}
                    />
                </Link>
            </div>

            <div className="sidebar__footer">
                <div className="sidebar__more">
                    <MoreHorizIcon />
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
