import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Avatar,
    Paper,
    Typography,
    Button,
    Box,
    IconButton,
    Divider,
    Card,
    CardContent
} from '@material-ui/core';
import {
    ArrowBack as ArrowBackIcon,
    Chat as ChatIcon,
    Email as EmailIcon,
    Person as PersonIcon
} from '@material-ui/icons';
import { createConversation } from '../../actions/conversations';
import './Profile.scss';

const Profile = () => {
    const { userId } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('profile'));
    const { users } = useSelector(state => state.users);

    useEffect(() => {
        // Find user from the users list or fetch from API
        if (users?.users) {
            const foundUser = users.users.find(user => user._id === userId);
            if (foundUser) {
                setProfileUser(foundUser);
                setLoading(false);
            }
        }
        
        // If user not found in current users list, you could fetch from API here
        if (!profileUser && userId) {
            // For now, we'll show a placeholder if user not found
            setLoading(false);
        }
    }, [userId, users, profileUser]);

    const handleBackClick = () => {
        history.goBack();
    };

    const handleStartChat = async () => {
        if (!profileUser || !currentUser) return;

        try {
            // Create new conversation with this user
            const newConversation = {
                Subject: `${profileUser.name} and ${currentUser.result.name}`,
                UpdatedAt: new Date(),
                Attendees: [
                    { label: profileUser.name, value: profileUser._id },
                    { label: currentUser.result.name, value: currentUser.result._id }
                ]
            };
            
            const result = await dispatch(createConversation(newConversation));
            
            // Navigate to the new conversation
            if (result && result._id) {
                history.push(`/chat/${result._id}/1`);
            }
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <Typography variant="h6">Loading profile...</Typography>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="profile-not-found">
                <Paper className="profile-container">
                    <Box display="flex" alignItems="center" mb={2}>
                        <IconButton onClick={handleBackClick}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" style={{ marginLeft: '16px' }}>
                            Profile Not Found
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                        The user profile you're looking for could not be found.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleBackClick}
                        style={{ marginTop: '16px' }}
                    >
                        Go Back
                    </Button>
                </Paper>
            </div>
        );
    }

    const isOwnProfile = currentUser?.result?._id === profileUser._id;

    return (
        <div className="profile">
            <Paper className="profile-container">
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={handleBackClick}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" style={{ marginLeft: '16px' }}>
                            {isOwnProfile ? 'My Profile' : 'User Profile'}
                        </Typography>
                    </Box>
                    {!isOwnProfile && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ChatIcon />}
                            onClick={handleStartChat}
                        >
                            Start Chat
                        </Button>
                    )}
                </Box>

                {/* Profile Card */}
                <Card className="profile-card">
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar 
                                src={profileUser.photoUrl} 
                                alt={profileUser.name}
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    marginRight: '24px',
                                    fontSize: '2rem'
                                }}
                            >
                                {profileUser.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    {profileUser.name}
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <EmailIcon style={{ marginRight: '8px', color: '#666' }} />
                                    <Typography variant="body1" color="textSecondary">
                                        {profileUser.email}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <PersonIcon style={{ marginRight: '8px', color: '#666' }} />
                                    <Typography variant="body2" color="textSecondary">
                                        User ID: {profileUser._id}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider style={{ margin: '24px 0' }} />

                        {/* Profile Information */}
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Profile Information
                            </Typography>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Display Name
                                </Typography>
                                <Typography variant="body1">
                                    {profileUser.name}
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Email Address
                                </Typography>
                                <Typography variant="body1">
                                    {profileUser.email}
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Status
                                </Typography>
                                <Typography variant="body1" style={{ color: '#4caf50' }}>
                                    Available
                                </Typography>
                            </Box>
                        </Box>

                        {!isOwnProfile && (
                            <>
                                <Divider style={{ margin: '24px 0' }} />
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Quick Actions
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ChatIcon />}
                                        onClick={handleStartChat}
                                        style={{ marginRight: '16px' }}
                                    >
                                        Send Message
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<EmailIcon />}
                                        href={`mailto:${profileUser.email}`}
                                    >
                                        Send Email
                                    </Button>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Paper>
        </div>
    );
};

export default Profile;
