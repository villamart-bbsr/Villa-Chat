import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Chip,
    Avatar,
    Typography,
    Box,
    IconButton,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper
} from '@material-ui/core';
import { Close as CloseIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateGroupDetails } from '../../actions/conversations';
import { getUsersBySearch } from '../../actions/users';

const GroupManagementModal = ({ open, onClose, conversation, currentUser }) => {
    const dispatch = useDispatch();
    const { users } = useSelector(state => state.users);
    
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Initialize form data when conversation changes
    useEffect(() => {
        if (conversation) {
            setGroupName(conversation.Subject || '');
            setMembers(conversation.Attendees || []);
        }
    }, [conversation]);

    // Handle user search
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timeoutId = setTimeout(() => {
                dispatch(getUsersBySearch(searchQuery));
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, dispatch]);

    // Update search results
    useEffect(() => {
        if (users?.searchResults) {
            // Filter out already added members
            const memberIds = members.map(member => member.value);
            const filteredResults = users.searchResults.filter(
                user => !memberIds.includes(user._id)
            );
            setSearchResults(filteredResults);
        }
    }, [users?.searchResults, members]);

    const handleAddMember = (user) => {
        const newMember = {
            label: user.name,
            value: user._id
        };
        setMembers(prev => [...prev, newMember]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveMember = (memberToRemove) => {
        setMembers(prev => prev.filter(member => member.value !== memberToRemove.value));
    };

    const handleSave = async () => {
        if (!groupName.trim()) {
            alert('Please enter a group name');
            return;
        }

        setLoading(true);
        try {
            const groupData = {
                Subject: groupName.trim(),
                Attendees: members
            };
            
            await dispatch(updateGroupDetails(conversation._id, groupData));
            onClose();
        } catch (error) {
            console.error('Error updating group:', error);
            alert('Failed to update group. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = conversation?.Admin?.id === currentUser?.result?._id;

    if (!isAdmin) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Group Information
                    <IconButton
                        style={{ position: 'absolute', right: 8, top: 8 }}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="textSecondary">
                        Only the group admin can edit group details.
                    </Typography>
                    <Box mt={2}>
                        <Typography variant="subtitle2">Group Name:</Typography>
                        <Typography variant="body1">{conversation?.Subject}</Typography>
                    </Box>
                    <Box mt={2}>
                        <Typography variant="subtitle2">Admin:</Typography>
                        <Typography variant="body1">{conversation?.Admin?.name}</Typography>
                    </Box>
                    <Box mt={2}>
                        <Typography variant="subtitle2">Members ({members.length}):</Typography>
                        <Box mt={1}>
                            {members.map((member) => (
                                <Chip
                                    key={member.value}
                                    avatar={<Avatar>{member.label.charAt(0)}</Avatar>}
                                    label={member.label}
                                    style={{ margin: '4px' }}
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Edit Group Details
                <IconButton
                    style={{ position: 'absolute', right: 8, top: 8 }}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        label="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        variant="outlined"
                        margin="normal"
                    />
                </Box>

                <Box mb={3}>
                    <Typography variant="subtitle1" gutterBottom>
                        Group Members ({members.length})
                    </Typography>
                    
                    {/* Current Members */}
                    <Box mb={2}>
                        {members.map((member) => (
                            <Chip
                                key={member.value}
                                avatar={<Avatar>{member.label.charAt(0)}</Avatar>}
                                label={member.label}
                                onDelete={() => handleRemoveMember(member)}
                                deleteIcon={<DeleteIcon />}
                                style={{ margin: '4px' }}
                                color={member.value === currentUser?.result?._id ? "primary" : "default"}
                            />
                        ))}
                    </Box>

                    {/* Add New Members */}
                    <Box position="relative">
                        <TextField
                            fullWidth
                            label="Search and add members"
                            variant="outlined"
                            placeholder="Type to search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        {/* Search Results Dropdown */}
                        {searchQuery.length >= 2 && searchResults.length > 0 && (
                            <Paper 
                                style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    left: 0, 
                                    right: 0, 
                                    zIndex: 1000,
                                    maxHeight: 200,
                                    overflow: 'auto'
                                }}
                            >
                                <List>
                                    {searchResults.map((user) => (
                                        <ListItem 
                                            key={user._id} 
                                            button 
                                            onClick={() => handleAddMember(user)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar>{user.name.charAt(0)}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={user.name}
                                                secondary={user.email}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                        
                        {/* No Results Message */}
                        {searchQuery.length >= 2 && searchResults.length === 0 && (
                            <Paper 
                                style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    left: 0, 
                                    right: 0, 
                                    zIndex: 1000,
                                    padding: 16
                                }}
                            >
                                <Typography variant="body2" color="textSecondary">
                                    No users found
                                </Typography>
                            </Paper>
                        )}
                        
                        {/* Search Hint */}
                        {searchQuery.length > 0 && searchQuery.length < 2 && (
                            <Paper 
                                style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    left: 0, 
                                    right: 0, 
                                    zIndex: 1000,
                                    padding: 16
                                }}
                            >
                                <Typography variant="body2" color="textSecondary">
                                    Type at least 2 characters to search
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="caption" color="textSecondary">
                        Note: You are the group admin and cannot remove yourself from the group.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    color="primary" 
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GroupManagementModal;
