import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Sketch from 'react-p5';
import io from "socket.io-client";
import DeleteIcon from '@material-ui/icons/Delete';
import './Blackboard.scss';
import { IconButton } from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Tooltip from '@material-ui/core/Tooltip';

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Blackboard = () => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('profile')));
    const [weight, setWeight] = useState(3);
    const [color, setColor] = useState('#ffffff');
    const [copied, setCopied] = useState(false);
    const [activeTool, setActiveTool] = useState('white');
    const [p5, setP5] = useState();
    const socketRef = useRef();
    const { roomId } = useParams();
    const location = useLocation();

    useEffect(() => {
        setCurrentUser(JSON.parse(localStorage.getItem('profile')));
    }, [location]);

    const setup = (p5, canvasParentRef) => {
        setP5(p5);
        // eslint-disable-next-line
        const canvas = p5.createCanvas(1920, 1080).parent(canvasParentRef);
        // Enhanced dark green background instead of grey
        p5.background("rgb(10, 61, 46)");

        // Use environment variable for socket connection
        const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:3000";
        socketRef.current = io.connect(socketUrl);
        socketRef.current.emit("join room", {roomID: roomId, username: currentUser.result.name });

        socketRef.current.on('mouse', (data) => {
            p5.stroke(data.color);
            p5.strokeWeight(data.weight);
            p5.line(data.x, data.y, data.px, data.py);
        });
        socketRef.current.on('erase', () => {
            p5.background("rgb(10, 61, 46)");
        });
    }

    const changeToRed = () => {
        setColor('#e74c3c');
        setWeight(3);
        setActiveTool('red');
    }
    
    const changeToBlue = () => {
        setColor('#3498db');
        setWeight(3);
        setActiveTool('blue');
    }
    
    const changeToWhite = () => {
        setColor('#ffffff');
        setWeight(3);
        setActiveTool('white');
    }
    
    // Add green color option
    const changeToGreen = () => {
        setColor('#2ecc71');
        setWeight(3);
        setActiveTool('green');
    }
    
    const erase = () => {
        setColor('#0a3d2e');
        setWeight(30);
        setActiveTool('eraser');
    }

    const mouseDragged = (p5) => {
        const data = {
            x: p5.mouseX,
            y: p5.mouseY,
            px: p5.pmouseX,
            py: p5.pmouseY,
            color: color,
            weight: weight
        }
        socketRef.current.emit('mouse', data);
        p5.stroke(color);
        p5.strokeWeight(weight);
        p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
    }

    const resetSketch = (p5) => {
        p5.background("rgb(10, 61, 46)");
        socketRef.current.emit('erase');
    }

    const saveCanvas = (p5) => {
        p5.saveCanvas('collaborative-board', 'png');
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

    // Get client URL from environment variable
    const clientUrl = process.env.REACT_APP_CLIENT_URL || "https://teams-clone-client.netlify.app";

    return (
        <div className="blackboard__canvas">
            <h2>Collaborative Board</h2>
            <Sketch setup={setup} mouseDragged={mouseDragged} resetSketch={resetSketch} className="blackboard__canvas" />
            <div className="options">
                
                <div className="primary-action" onClick={() => {saveCanvas(p5)}}>
                    <Tooltip title="Save Board" placement="left">
                        <img src="https://img.icons8.com/fluent/48/000000/save-all.png" alt="save canvas" />
                    </Tooltip>
                </div>
                
                <CopyToClipboard text={`${clientUrl}/board/${roomId}`}>
                    <div className="primary-action" onClick={() => {handleClick()}}>
                        <Tooltip title="Copy Board Link" placement="left">
                            <img src="https://img.icons8.com/color/48/000000/share--v1.png" alt="copy invite" />
                        </Tooltip>
                    </div>
                </CopyToClipboard>
                
                <Snackbar open={copied} autoHideDuration={4000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success">
                        Board link copied! 🎨
                    </Alert>
                </Snackbar>
                
                {/* Color buttons with active state */}
                <button 
                    className={`colorbutton ${activeTool === 'white' ? 'active-tool' : ''}`}
                    onClick={() => {changeToWhite()}} 
                    style={{ backgroundColor: "#ffffff" }} 
                    alt="white"
                />
                
                <button 
                    className={`colorbutton ${activeTool === 'green' ? 'active-tool' : ''}`}
                    onClick={() => {changeToGreen()}} 
                    style={{ backgroundColor: "#2ecc71" }} 
                    alt="green"
                />
                
                <button 
                    className={`colorbutton ${activeTool === 'blue' ? 'active-tool' : ''}`}
                    onClick={() => {changeToBlue()}} 
                    style={{ backgroundColor: "#3498db" }} 
                    alt="blue"
                />
                
                <button 
                    className={`colorbutton ${activeTool === 'red' ? 'active-tool' : ''}`}
                    onClick={() => {changeToRed()}} 
                    style={{ backgroundColor: "#e74c3c" }} 
                    alt="red"
                />
                
                <div className="stroke">
                    <label htmlFor="weight">Stroke</label>
                    <input 
                        type="range" 
                        id="weight" 
                        min="1" 
                        max="50" 
                        value={weight} 
                        onChange={(e) => {setWeight(parseInt(e.target.value))}} 
                    />
                    <span>{weight}px</span>
                </div>
                
                <div className={activeTool === 'eraser' ? 'active-tool' : ''} onClick={() => {erase()}}>
                    <Tooltip title="Eraser" placement="left">
                        <img src="https://img.icons8.com/color/48/000000/erase.png" alt="erase" />
                    </Tooltip>
                </div>
                
                <Tooltip title="Clear Board" placement="left">
                    <IconButton onClick={() => {resetSketch(p5)}}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    )
}

export default Blackboard