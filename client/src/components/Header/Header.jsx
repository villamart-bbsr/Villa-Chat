import React, { useEffect, useState, useCallback } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { Avatar, Button, Paper, List, ListItem, ListItemAvatar, ListItemText, ClickAwayListener, IconButton, InputBase, ListItemSecondaryAction, Tooltip } from '@material-ui/core';
import { Chat as ChatIcon, Person as PersonIcon } from '@material-ui/icons';
import { ReactComponent as Apps } from '../../assets/apps.svg'
import { useHistory, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMsal } from '@azure/msal-react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import decode from 'jwt-decode';
import { getUsersBySearch } from '../../actions/users';
import { getConversations, createConversation } from '../../actions/conversations';
import './Header.scss'

const Header = () => {
    const { instance } = useMsal();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    
    // Search functionality state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const { users, searchResults } = useSelector(state => state.users);
    const { conversations } = useSelector(state => state.conversations);
    const finalSearchResults = searchResults || [];

    useEffect(() => {
        const token = user?.token;

        if (token) {
            const decodedToken = decode(token);
            if (decodedToken.exp * 1000 < new Date().getTime()) {
                logoutHandler();
            }
        }
        setUser(JSON.parse(localStorage.getItem('profile')));
        
        // Fetch conversations for search functionality
        if (user?.token) {
            dispatch(getConversations());
        }
    }, [location, dispatch, user?.token]);

    // Debug search results
    useEffect(() => {
        console.log('🔄 Header: Raw users state:', users);
        console.log('🔍 Header: Raw searchResults:', searchResults);
        console.log('✅ Header: Final search results:', finalSearchResults);
        console.log('📊 Header: Final search results length:', finalSearchResults?.length || 0);
        console.log('👁️ Header: Show search results:', showSearchResults);
    }, [users, searchResults, finalSearchResults, showSearchResults]);

    const logoutHandler = (instance) => {
        if (user.result.idTokenClaims?.sub) {
            instance.logoutPopup()
            .then(() => {
                dispatch({ type: 'LOGOUT' });
                history.push('/');
                setUser(null);
            })
            .catch(e => {
                console.error(e);
            });
        } else {
            dispatch({ type: 'LOGOUT' });
            history.push('/');
            setUser(null);
        }
        setAnchorEl(null);
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Search functionality methods
    const debouncedSearch = useCallback((query) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(async () => {
            if (query.trim() && query.length > 2) {
                console.log('🔍 Header: Starting search for:', query);
                try {
                    const result = await dispatch(getUsersBySearch(query));
                    console.log('📊 Header: Search completed, results:', result);
                    setShowSearchResults(true);
                } catch (error) {
                    console.error('❌ Header: Search failed:', error);
                }
            } else {
                console.log('⏹️ Header: Search query too short or empty');
                setShowSearchResults(false);
            }
        }, 300);
        
        setSearchTimeout(timeout);
    }, [dispatch, searchTimeout]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleSearchFocus = () => {
        if (searchQuery.trim() && searchResults.length > 0) {
            setShowSearchResults(true);
        }
    };

    const handleSearchResultClick = async (selectedUser) => {
        setSearchQuery('');
        setShowSearchResults(false);
        
        try {
            // Look for existing conversation with this user
            const existingConversation = conversations?.find(conv => 
                conv.Attendees?.some(attendee => attendee.value === selectedUser._id)
            );
            
            if (existingConversation) {
                // Navigate to existing conversation
                history.push(`/chat/${existingConversation._id}/1`);
            } else {
                // Create new conversation with this user
                const newConversation = {
                    Subject: `${selectedUser.name} and ${user?.result?.name}`,
                    UpdatedAt: new Date(),
                    Attendees: [
                        { label: selectedUser.name, value: selectedUser._id },
                        { label: user?.result?.name, value: user?.result?._id }
                    ]
                };
                
                // Dispatch create conversation action
                const result = await dispatch(createConversation(newConversation));
                
                // Navigate to the new conversation
                if (result && result._id) {
                    history.push(`/chat/${result._id}/1`);
                } else {
                    console.error('Failed to create conversation');
                }
            }
        } catch (error) {
            console.error('Error navigating to conversation:', error);
        }
    };

    const handleProfileClick = (selectedUser) => {
        setSearchQuery('');
        setShowSearchResults(false);
        // Navigate to user profile page
        history.push(`/profile/${selectedUser._id}`);
    };

    const handleClickAway = () => {
        setShowSearchResults(false);
    };

    return (
        <div className="header">
            <div className="header__logo">
                <Apps />
                <h5 className="d-none d-md-block">Microsoft Teams</h5>
            </div>
            {user ?
                <ClickAwayListener onClickAway={handleClickAway}>
                    <div className="header__search" style={{ position: 'relative' }}>
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                        />
                        {showSearchResults && finalSearchResults.length > 0 && (
                            <Paper 
                                className="search__results"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    marginTop: '4px'
                                }}
                            >
                                <List>
                                    {finalSearchResults.map((user) => (
                                        <ListItem 
                                            key={user._id}
                                            style={{ paddingRight: '120px' }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={user.photoUrl} alt={user.name}>
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={user.name} 
                                                secondary={user.email}
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Start Chat">
                                                    <IconButton 
                                                        edge="end" 
                                                        onClick={() => handleSearchResultClick(user)}
                                                        style={{ marginRight: '8px' }}
                                                    >
                                                        <ChatIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Profile">
                                                    <IconButton 
                                                        edge="end" 
                                                        onClick={() => handleProfileClick(user)}
                                                    >
                                                        <PersonIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                        {showSearchResults && searchQuery.trim() && finalSearchResults.length === 0 && (
                            <Paper 
                                className="search__results"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    padding: '16px',
                                    marginTop: '4px'
                                }}
                            >
                                <div style={{ textAlign: 'center', color: '#666' }}>
                                    No users found for "{searchQuery}"
                                </div>
                            </Paper>
                        )}
                    </div>
                </ClickAwayListener>
            : null}
            <div className="header__options">
                <MoreHorizIcon />
                {user ? (
                    <>
                    <h6>{user.result.name}</h6>
                    <div className="header__profile">
                        {user.result.idTokenClaims?.sub ?
                            <div>
                                <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                                    <Avatar src={user.result.photoUrl} alt={user.result.name}>{user.result.name.charAt(0)}</Avatar>
                                </Button>
                                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => {handleClose()}}>
                                    <MenuItem onClick={() => {
                                        handleClose();
                                        history.push(`/profile/${user.result._id}`);
                                    }}>Profile</MenuItem>
                                    <MenuItem onClick={() => {logoutHandler(instance)}}>Logout</MenuItem>
                                </Menu>
                            </div>
                        : 
                            <div>
                                <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                                    <Avatar src={user.result.photoUrl} alt={user.result.name}>{user.result.name.charAt(0)}</Avatar>
                                </Button>
                                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => {handleClose()}}>
                                    <MenuItem onClick={() => {
                                        handleClose();
                                        history.push(`/profile/${user.result._id}`);
                                    }}>Profile</MenuItem>
                                    <MenuItem onClick={() => {logoutHandler()}}>Logout</MenuItem>
                                </Menu>
                            </div>
                        }
                    </div>
                    </>
                ):  <Link to="/">
                        <Button className="microsoft__login ml-auto" fullWidth variant="contained">
                            Sign in
                        </Button>
                    </Link>
                }
            </div>
        </div>
    )
}

export default Header
