import React, { useEffect, useState } from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import '../Sidebar/Sidebar.scss';
import SidebarItem from '../Sidebar/SidebarItem';
import { useLocation, useParams } from 'react-router-dom';
import { getAccessToken } from '../../api/github';
import LoginGithub from 'react-login-github';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const VideoSidebar = () => {
    const [auth, setAuth] = useState(JSON.parse(localStorage.getItem('git_oauth')));
    const location = useLocation();
    const { roomId, type } = useParams();
    const [copied, setCopied] = useState(false);
  
    useEffect(() => {
        setAuth(JSON.parse(localStorage.getItem('git_oauth')));
    }, [location]);

    const onSuccess = async(response) => {
        const result = await getAccessToken(response.code);
        console.log(result);
        localStorage.setItem('git_oauth', JSON.stringify(result));
    }
    const onFailure = response => console.error(response);

    const close = (id) => {
        var element = document.getElementById(id);
        element.classList.add("d-none");
    }
    
    
    const open = (id) => {
        var element = document.getElementById(id);
        element.classList.remove("d-none");
    }

    const openGitHub = () => {
        close("video");
        close("board");
        open("github");
    }

    const openVideo = () => {
        close("github");
        close("board");
        open("video");
    }

    const openBoard = () => {
        close("github");
        close("video");
        open("board");
    }

    const handleClick = () => {
        setCopied(true);
    };
    
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setCopied(false);
    };

    return (
        <div className="sidebar">
            <div onClick={() => {openVideo()}}>
                <SidebarItem 
                    icon="https://img.icons8.com/ios/36/000000/video-conference.png"
                    text="Video"
                    hoverIcon="https://img.icons8.com/ios/36/6264A7/video-conference.png"
                />
            </div>
            <div onClick={() => {openGitHub()}}>
            {auth ?
                <SidebarItem 
                    icon="https://img.icons8.com/ios/36/000000/github--v1.png"
                    text="GitHub"
                    hoverIcon="https://img.icons8.com/ios-filled/36/6264A7/github.png"
                />
            :
                <LoginGithub clientId="f6099a354e555e602bcb"
                    onSuccess={onSuccess}
                    onFailure={onFailure}
                    scope="admin:org repo user"
                    className="auth__button"
                >
                    <SidebarItem
                        icon="https://img.icons8.com/ios/36/000000/github--v1.png"
                        text="GitHub"
                        hoverIcon="https://img.icons8.com/ios-filled/36/6264A7/github.png"
                    />
                </LoginGithub>
            }
            </div>
            <div onClick={() => {openBoard()}}>
                <SidebarItem 
                    icon="https://img.icons8.com/ios/36/000000/whiteboard.png"
                    text="Blackboard"
                    hoverIcon="https://img.icons8.com/ios-filled/36/6264A7/whiteboard.png"
                />
            </div>
            <div>
                <CopyToClipboard text={type ? `https://teams-clone-client.netlify.app/room/${roomId}/${type}` : `https://teams-clone-client.netlify.app/room/${roomId}`}>
                    <div onClick={() => {handleClick()}}>
                        <SidebarItem 
                            icon="https://img.icons8.com/ios-filled/50/000000/share--v1.png"
                            text="Copy Invite"
                            hoverIcon="https://img.icons8.com/ios-filled/50/6264A7/share--v1.png"
                        />
                    </div>
                </CopyToClipboard>
                <Snackbar open={copied} autoHideDuration={6000} onClose={() => {handleClose()}}>
                    <Alert onClose={() => {handleClose()}} severity="success">
                        Meeting link copied to clipboard!
                    </Alert>
                </Snackbar>
            </div>
            <div className="sidebarItem">
                <MoreHorizIcon />
            </div>
        </div>
    )
}

export default VideoSidebar
