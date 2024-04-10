import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png'
import userlogo from '../../assets/userlogo.svg'
import passlogo from '../../assets/passwordlogo.svg'
import { BASE_URL } from '../../assets/Baseurl'

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navi = useNavigate();


    const handleLogin = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/designer/login`, {
                email: email,
                password: password
            });
            const { token } = response.data;
            console.log(token);
            const expirationTime = new Date().getTime() + 3600000; // 1 hour in milliseconds
            sessionStorage.setItem('token', JSON.stringify({ value: token, expirationTime }));
            console.log(response.data);
            alert('Login successful!');
            navi('/');
            // Reset fields after successful login
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error(error.message);
            alert('Login failed. Please try again.');
        }
    };

    useEffect(() => {
        // Check if token exists and if it's expired
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            const { value, expirationTime } = JSON.parse(storedToken);
            if (expirationTime > new Date().getTime()) {
                // Token is valid, navigate to home page
                navi('/');
            } else {
                // Token has expired, remove it from sessionStorage
                sessionStorage.removeItem('token');
                navi('/login');
            }
        }
    }, [navi]);


    return (
        <body>
            <div className="login-container">
                <img className='logo' src={logo} alt='logo' />
                <div className="form-container">
                    <div className="input-group">
                        <div className='grp1' style={{ display: "flex", flexDirection: "row" }}>
                            <img className='userlogo' src={userlogo} alt='logo' />
                            <label className="input-label">EMAIL </label>
                        </div>

                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Please Enter Your Email"
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <div className='grp2' style={{ display: "flex", flexDirection: "row" }}>
                            <img className='passlogo' src={passlogo} alt='logo' />
                            <label className="input-label" style={{ marginLeft: "2px" }}>PASSWORD </label>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Please Enter Your Password"
                            className="input-field"
                        />
                        <div className='forgotpassword'>
                            <label htmlFor="forgotpassword" onClick={() => { navi('/forgetPassword') }}>Forgot Password?</label>
                        </div>
                    </div>
                    <button
                        onClick={handleLogin}
                        className="login-button"
                    >
                        CONTINUE
                    </button>
                    <div className='extra'>
                        <p>
                            New User
                        </p>
                        <p className='reg' onClick={() => { navi("/register") }}>
                            Create An Account
                        </p>
                    </div>
                </div>
            </div>
        </body>
    )
}

export default Login
