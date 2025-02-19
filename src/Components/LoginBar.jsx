import React from 'react';
import './LoginBar.css';

const LoginBar = () => {
    return (
        <div className="login-bar">
            <input type="text" placeholder="Username" className="login-input" />
            <input type="password" placeholder="Password" className="login-input" />
            <button className="login-button">Login</button>
        </div>
    );
};

export default LoginBar;
