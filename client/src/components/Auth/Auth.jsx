import teams from '../../assets/teams_login.svg';
import teams_register from '../../assets/register.svg';
import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import Input from './Input';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signin, signup, microsoftSignup } from '../../actions/auth';
import { useIsAuthenticated } from "@azure/msal-react";
import './Auth.scss';

const initialState = { firstName: '', lastName: '', email: '', password: null, confirmPassword: '' };

const Auth = () => {
    const dispatch = useDispatch();
    const { instance } = useMsal();
    const history = useHistory();
    const [isSignup, setIsSignup] = useState(false);
    const [form, setForm] = useState(initialState);
    const [showPassword, setShowPassword] = useState(false);
    const isAuthenticated = useIsAuthenticated();

    const handleLogin = async (instance) => {
        dispatch({ type: 'LOGOUT' });
        instance.loginPopup(loginRequest)
        .then(async (data) => {
            const token = data.accessToken;
            try {
                dispatch({ type: 'AUTH' , data: { result: data.account, token } });
                try {
                    dispatch(microsoftSignup({ email: data.account.username, name: data.account.name }, { result: data.account, token }, history))
                } catch (e) {
                    history.push('/calendar');
                }
            } catch (error) {
                console.log(error);
            }
        })
        .catch(e => {
            console.error(e);
        });
    }
    
    const handleLogout = (instance) => {
        instance.logoutPopup()
        .then(() => {
            dispatch({ type: 'LOGOUT' });
            history.push('/');
        })
        .catch(e => {
            console.error(e);
        });
    }

    const handleShowPassword = () => setShowPassword(!showPassword);

    const switchMode = () => {
        setForm(initialState);
        setIsSignup((prevIsSignup) => !prevIsSignup);
        setShowPassword(false);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('Form submitted:', { isSignup, form });
        console.log('Form data:', form);

        if (isSignup) {
            console.log('Attempting signup with data:', form);
            dispatch(signup(form, history));
        } else {
            console.log('Attempting signin with data:', form);
            dispatch(signin(form, history));
        }
    }

    return (
        <div className="auth">
            <div className="auth__container">
                {/* Left Side - Auth Form */}
                <div className="auth__left">
                    <div className="auth__form">
                        <div className="auth__header">
                            <h2 className="auth__title">Villa Chat</h2>
                            <p className="auth__subtitle">
                                {isSignup ? 'Create your account' : 'Welcome back'}
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="auth__form-content">
                            {isSignup && (
                                <div className="auth__name">
                                    <Input name="firstName" label="First Name" handleChange={handleChange} autoFocus half />
                                    <Input name="lastName" label="Last Name" handleChange={handleChange} half />
                                </div>
                            )}
                            <Input name="email" label="Email Address" handleChange={handleChange} type="email" />
                            <Input name="password" label="Password" handleChange={handleChange} type={showPassword ? 'text' : 'password'} handleShowPassword={handleShowPassword} />
                            {isSignup && <Input name="confirmPassword" label="Repeat Password" handleChange={handleChange} type="password" />}
                            
                            <Button type="submit" fullWidth variant="contained" color="primary" className="auth__submit">
                                {isSignup ? 'Create Account' : 'Sign In'}
                            </Button>
                            
                            <div className="auth__divider">
                                <span>or</span>
                            </div>
                            
                            {isAuthenticated ? (
                                <Button className="auth__microsoft" fullWidth variant="outlined" onClick={() => handleLogout(instance)}>
                                    <img src="https://img.icons8.com/color/48/000000/microsoft.png" alt="" />
                                    Sign Out from Microsoft
                                </Button>
                            ) : (
                                <Button className="auth__microsoft" fullWidth variant="outlined" onClick={() => handleLogin(instance)}>
                                    <img src="https://img.icons8.com/color/48/000000/microsoft.png" alt="" />
                                    Continue with Microsoft
                                </Button>
                            )}
                        </form>
                        
                        <div className="auth__switch">
                            <Button onClick={switchMode} className="auth__switch-btn">
                                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Right Side - Content Area */}
                <div className="auth__right">
                    <div className="auth__content">
                        {!isSignup ? (
                            <div className="auth__welcome">
                                <img src={teams} alt="Villa Chat" className="auth__image" />
                                <h3>Connect with Your Team</h3>
                                <p>Villa Chat brings your team together with seamless communication and collaboration tools.</p>
                                <div className="auth__features">
                                    <div className="feature">
                                        <span className="feature__icon">💬</span>
                                        <span>Real-time messaging</span>
                                    </div>
                                    <div className="feature">
                                        <span className="feature__icon">🎥</span>
                                        <span>Video conferencing</span>
                                    </div>
                                    <div className="feature">
                                        <span className="feature__icon">📁</span>
                                        <span>File sharing</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="auth__welcome">
                                <img src={teams_register} alt="Join Villa Chat" className="auth__image" />
                                <h3>Join Villa Chat Today</h3>
                                <p>Start collaborating with your team in a whole new way. Create your account and experience the future of team communication.</p>
                                <div className="auth__stats">
                                    <div className="stat">
                                        <span className="stat__number">10K+</span>
                                        <span className="stat__label">Active Users</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat__number">500+</span>
                                        <span className="stat__label">Teams</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;