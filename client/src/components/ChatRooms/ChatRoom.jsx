import React, { useEffect, useRef, useState } from 'react';
import CreateIcon from '@material-ui/icons/Create';
import { Avatar, IconButton } from '@material-ui/core';

import Input from '../Auth/Input';
import SendIcon from '@material-ui/icons/Send';
import CallIcon from '@material-ui/icons/Call';
import Tooltip from '@material-ui/core/Tooltip';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEvent, eventMessage, updateEvent } from '../../actions/events';
import { getConversation, updateConversation } from '../../actions/conversations';
import chatImage from '../../assets/chat.gif';
import io from "socket.io-client";
import './ChatRooms.scss';
import moment from 'moment';
import GroupManagementModal from './GroupManagementModal';

const ChatRoom = () => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('profile')));
    const { event } = useSelector(state => state.events);
    const { conversation } = useSelector(state => state.conversations);
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [messages, setMessages] = useState([]);
    const [confirm, setImgUploadConfirm] = useState('');
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { roomId, type } = useParams();
    const socketRef = useRef();
    const location = useLocation();

    useEffect(() => {
        setCurrentUser(JSON.parse(localStorage.getItem('profile')));
    }, [location]);

    useEffect(() => {
        if (roomId && type) {
            dispatch(getConversation(roomId));
        } else {
            dispatch(getEvent(roomId));
        }
    }, [dispatch, roomId, type]);

    useEffect(() => {
        // Use environment variable for socket connection
        const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:3000";
        socketRef.current = io.connect(socketUrl);
    }, [])

    useEffect(() => {
        if (roomId) {
            scrollToBottom();
            socketRef.current.emit("join room", {roomID: roomId, username: currentUser.result.name });
            socketRef.current.on('chat message', (finalMessage) => {
                setMessages(oldMsgs => [...oldMsgs, {sender: finalMessage.sender, senderId: finalMessage.senderId, message: finalMessage.message, body: finalMessage.body, type: finalMessage.type, timestamp: new Date()}])
                scrollToBottom();
            });
        }
        // eslint-disable-next-line
    }, [roomId])

    useEffect(() => {
        scrollToBottom();
        if (type) {
            setMessages(conversation?.Messages);
        } else {
            setMessages(event?.Messages);
        }
    }, [event?.Messages, event, conversation?.Messages, conversation, type]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Send images if any are selected
        if (files.length > 0) {
            files.forEach((file, index) => {
                console.log('Creating file message with file data:', file.data?.substring(0, 50) + '...');
                const finalMessage = { 
                    sender: currentUser.result.name, 
                    senderId: currentUser.result._id, 
                    message: message || `📷 ${file.name}`, // Use filename if no message
                    body: file.data, 
                    type: "file", 
                    timestamp: new Date() 
                };
                console.log('Final message object:', finalMessage);
                socketRef.current.emit('chat message', finalMessage);
                setMessages(oldMsgs => [...oldMsgs, finalMessage]);
                if (type) {
                    dispatch(updateConversation(finalMessage, roomId));    
                } else {
                    dispatch(eventMessage(finalMessage, roomId));
                }
            });
            setFiles([]);
        } else if (message) {
            // Send text message if no files but message exists
            const finalMessage = { sender: currentUser.result.name, senderId: currentUser.result._id, message: message, type: "text", timestamp: new Date() };
            socketRef.current.emit('chat message', finalMessage);
            setMessages(oldMsgs => [...oldMsgs, finalMessage]);
            if (type) {
                dispatch(updateConversation(finalMessage, roomId));    
            } else {
                dispatch(eventMessage(finalMessage, roomId));
            }
        }
        
        // Update event timestamp if needed
        if (!type && (files.length > 0 || message)) {
            dispatch(updateEvent(roomId, {
                UpdatedAt: new Date(),
            }));
        }
        
        // Clear inputs
        if (files.length > 0 || message) {
            scrollToBottom();
            setMessage('');
            setImgUploadConfirm('');
        }
    }

    const callNow = () => {
        const finalMessage = { sender: currentUser.result.name, senderId: currentUser.result._id, message: `${currentUser.result.name} has started a video call. Click on the call icon to join the call.`, type: "text", timestamp: new Date() };
        socketRef.current.emit('chat message', finalMessage);
        setMessages(oldMsgs => [...oldMsgs, finalMessage]);
        if (type) {
            dispatch(updateConversation(finalMessage, roomId));    
        } else {
            dispatch(eventMessage(finalMessage, roomId));
            dispatch(updateEvent(roomId, {
                UpdatedAt: new Date(),
            }));
        }
    }

    const renderMessages = (message, index) => {
        console.log('Rendering message:', message.type, message);
        if (message.type === "file") {
            if (message.senderId === currentUser.result._id) {
                return (
                    <div key={index} className="chatroom__message">
                        <div className="mychat">
                            <span>{moment(message.timestamp).format("DD/MM, hh:mm")}</span>
                            <img src={message.body} alt="" style={{ width: 250, height: "auto" }} />
                            <p key={index}>{message.message}</p>
                        </div>
                    </div>
                );
            }
            return (
                <div key={index} className="chatroom__message">
                    <div className="peerchat">
                        <Avatar alt={message.sender.charAt(0)}>{message.sender.charAt(0)}</Avatar>
                        <div className="peer">
                            <span>{message.sender}</span>
                            <span>{moment(message.timestamp).format("DD/MM, hh:mm")}</span>
                            <img src={message.body} alt="" style={{ width: 250, height: "auto" }} />
                            <p key={index}>{message.message}</p>
                        </div>
                    </div>
                </div>
            );
        } else {
            if (message.senderId === currentUser.result._id) {
                return (
                    <div key={index} className="chatroom__message">
                        <div className="mychat">
                            <span>{moment(message.timestamp).format("DD/MM, hh:mm")}</span>
                            <p key={index}>{message.message}</p>
                        </div>
                    </div>
                );
            }
            return (
                <div key={index} className="chatroom__message">
                    <div className="peerchat">
                        <Avatar alt={message.sender.charAt(0)}>{message.sender.charAt(0)}</Avatar>
                        <div className="peer">
                            <span>{message.sender}</span>
                            <span>{moment(message.timestamp).format("DD/MM, hh:mm")}</span>
                            <p key={index}>{message.message}</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    const handleFileInputClick = (inputRef) => {
        if (inputRef) {
            inputRef.click();
        }
    }

    const handleOpenGroupModal = () => {
        setGroupModalOpen(true);
    }

    const handleCloseGroupModal = () => {
        setGroupModalOpen(false);
    }

    if (event && roomId && messages && !type) {
        return (
            <div className="chatroom">
                <div className="chatroom__header">
                    <div className="chatroom__headerleft">
                        <Avatar>{event.Subject.charAt(0)}</Avatar>
                        {event ? <h5>{event.Subject}</h5> : <h5>Teams Clone Chat</h5>}
                        <Tooltip title="Edit">
                            <IconButton onClick={handleOpenGroupModal}>
                                <CreateIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="chatroom__headerright">
                        <Link to={`/room/${roomId}`} target="_blank">
                            <Tooltip title="Call">
                                <IconButton onClick={() => {callNow()}}>
                                    <CallIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </div>
                </div>
                <div id="messages" className="chatroom__body">
                    {messages.sort((a, b) => a - b)?.map(renderMessages)}
                    <div ref={messagesEndRef} />
                </div>
                <div>
                    {/* Image Preview Area */}
                    {files.length > 0 && (
                        <div className="image__preview__container" style={{
                            padding: '10px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            {files.map((file, index) => (
                                <div key={index} className="image__preview" style={{
                                    position: 'relative',
                                    display: 'inline-block'
                                }}>
                                    <img 
                                        src={file.data} 
                                        alt={file.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            border: '2px solid #ddd'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFiles = files.filter((_, i) => i !== index);
                                            setFiles(newFiles);
                                            setImgUploadConfirm(newFiles.length > 0 ? `${newFiles.length} image(s) selected and ready to send!` : '');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ×
                                    </button>
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#666',
                                        textAlign: 'center',
                                        marginTop: '2px',
                                        wordBreak: 'break-all',
                                        maxWidth: '80px'
                                    }}>
                                        {file.name.length > 12 ? file.name.substring(0, 12) + '...' : file.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <form className="chatroom__sendMessage">
                        <div className="message__imageSelector" onClick={() => {handleFileInputClick(fileInputRef.current)}}>
                            <PhotoLibraryIcon style={{ color: "#464775" }} />
                            <input 
                                ref={fileInputRef}
                                className="message__image" 
                                type="file" 
                                accept="image/*"
                                multiple={true} 
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const selectedFiles = Array.from(e.target.files);
                                    console.log('Files selected:', selectedFiles);
                                    console.log('Number of files:', selectedFiles.length);
                                    console.log('File names:', selectedFiles.map(f => f.name));
                                    
                                    const processFiles = async () => {
                                        try {
                                            const filePromises = selectedFiles.map((file, index) => {
                                                return new Promise((resolve, reject) => {
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        console.log(`File ${index + 1} processed:`, file.name);
                                                        resolve({
                                                            name: file.name,
                                                            data: reader.result,
                                                            size: file.size,
                                                            type: file.type
                                                        });
                                                    };
                                                    reader.onerror = () => {
                                                        console.error(`Error reading file ${file.name}:`, reader.error);
                                                        reject(reader.error);
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            });
                                            
                                            const processedFiles = await Promise.all(filePromises);
                                            console.log('All files processed successfully:', processedFiles);
                                            setFiles(prevFiles => {
                                                const newFiles = [...prevFiles, ...processedFiles];
                                                setImgUploadConfirm(`${newFiles.length} image(s) selected and ready to send!`);
                                                return newFiles;
                                            });
                                        } catch (error) {
                                            console.error('Error processing files:', error);
                                            setImgUploadConfirm('Error processing some images. Please try again.');
                                        }
                                    };
                                    
                                    if (selectedFiles.length > 0) {
                                        processFiles();
                                    }
                                    // Reset the input value to allow selecting the same files again if needed
                                    e.target.value = '';
                                }}
                            />
                        </div>
                        <Input name="message" label="Type a new message" value={message} handleChange={handleChange} autoFocus />
                        <IconButton type="submit" onClick={(e) => {handleSubmit(e)}}>
                            <SendIcon />
                        </IconButton>
                    </form>
                </div>
                <p className="image__text">{confirm}</p>
            </div>
        )
    } else if (conversation && roomId && messages) {
        return (
            <div className="chatroom">
                <div className="chatroom__header">
                    <div className="chatroom__headerleft">
                        <Avatar>{conversation.Subject.charAt(0)}</Avatar>
                        {conversation ? <h5>{conversation.Subject}</h5> : <h5>Teams Clone Chat</h5>}
                        <Tooltip title="Edit">
                            <IconButton onClick={handleOpenGroupModal}>
                                <CreateIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="chatroom__headerright">
                        <Link to={`/room/${roomId}/1`} target="_blank">
                            <Tooltip title="Call">
                                <IconButton onClick={() => {callNow()}}>
                                    <CallIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </div>
                </div>
                <div id="messages" className="chatroom__body">
                    {messages.sort((a, b) => a - b)?.map(renderMessages)}
                    <div ref={messagesEndRef} />
                </div>
                <div>
                    {/* Image Preview Area */}
                    {files.length > 0 && (
                        <div className="image__preview__container" style={{
                            padding: '10px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            {files.map((file, index) => (
                                <div key={index} className="image__preview" style={{
                                    position: 'relative',
                                    display: 'inline-block'
                                }}>
                                    <img 
                                        src={file.data} 
                                        alt={file.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            border: '2px solid #ddd'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFiles = files.filter((_, i) => i !== index);
                                            setFiles(newFiles);
                                            setImgUploadConfirm(newFiles.length > 0 ? `${newFiles.length} image(s) selected and ready to send!` : '');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ×
                                    </button>
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#666',
                                        textAlign: 'center',
                                        marginTop: '2px',
                                        wordBreak: 'break-all',
                                        maxWidth: '80px'
                                    }}>
                                        {file.name.length > 12 ? file.name.substring(0, 12) + '...' : file.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <form className="chatroom__sendMessage">
                        <div className="message__imageSelector" onClick={() => {handleFileInputClick(fileInputRef.current)}}>
                            <PhotoLibraryIcon style={{ color: "#464775" }} />
                            <input 
                                ref={fileInputRef}
                                className="message__image" 
                                type="file" 
                                accept="image/*"
                                multiple={true} 
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const selectedFiles = Array.from(e.target.files);
                                    console.log('Files selected:', selectedFiles);
                                    console.log('Number of files:', selectedFiles.length);
                                    console.log('File names:', selectedFiles.map(f => f.name));
                                    
                                    const processFiles = async () => {
                                        try {
                                            const filePromises = selectedFiles.map((file, index) => {
                                                return new Promise((resolve, reject) => {
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        console.log(`File ${index + 1} processed:`, file.name);
                                                        resolve({
                                                            name: file.name,
                                                            data: reader.result,
                                                            size: file.size,
                                                            type: file.type
                                                        });
                                                    };
                                                    reader.onerror = () => {
                                                        console.error(`Error reading file ${file.name}:`, reader.error);
                                                        reject(reader.error);
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            });
                                            
                                            const processedFiles = await Promise.all(filePromises);
                                            console.log('All files processed successfully:', processedFiles);
                                            setFiles(prevFiles => {
                                                const newFiles = [...prevFiles, ...processedFiles];
                                                setImgUploadConfirm(`${newFiles.length} image(s) selected and ready to send!`);
                                                return newFiles;
                                            });
                                        } catch (error) {
                                            console.error('Error processing files:', error);
                                            setImgUploadConfirm('Error processing some images. Please try again.');
                                        }
                                    };
                                    
                                    if (selectedFiles.length > 0) {
                                        processFiles();
                                    }
                                    // Reset the input value to allow selecting the same files again if needed
                                    e.target.value = '';
                                }}
                            />
                        </div>
                        <Input name="message" label="Type a new message" value={message} handleChange={handleChange} autoFocus />
                        <IconButton type="submit" onClick={(e) => {handleSubmit(e)}}>
                            <SendIcon />
                        </IconButton>
                    </form>
                </div>
                <p className="image__text">{confirm}</p>
                
                {/* Group Management Modal */}
                <GroupManagementModal 
                    open={groupModalOpen}
                    onClose={handleCloseGroupModal}
                    conversation={conversation}
                    currentUser={currentUser}
                />
            </div>
        )
    } else {
        return (
            <div className="emptychat">
                <h4>Start discussions with your teams and friends!<br/>Start by creating a new chat or open up an existing chat.</h4>
                <img src={chatImage} alt="chat page" />
            </div>
        )
    }
}

export default ChatRoom