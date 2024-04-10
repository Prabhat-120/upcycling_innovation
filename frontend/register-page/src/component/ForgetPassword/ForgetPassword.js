import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png'
import userlogo from '../../assets/userlogo.svg'
import './ForgetPassword.css';
import { BASE_URL } from '../../assets/Baseurl'

const ForgetPassword = () => {

    const [email, setEmail] = useState('');
    const [style, setStyle] = useState({});
    const [error, setError] = useState('');
    const navi = useNavigate();
    const data = {
        email: email,
        from: "forgetPassword"
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/designer/slfrp`, {
                email: email
            });
            const myFunction = () => {
                setError('');
                navi('/VerifyOTP', { state: data });
            };
            if (response.data.status) {
                setStyle({ font: "small-caption", color: "green", marginTop: "10px" })
                setError("OTP SENT SUCCESSFULLY..!");
                setTimeout(myFunction, 3000);
            }
            else {
                if (email) {
                    setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                    setError("USER NOT REGISTERED..!");
                }
                else {
                    setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                    setError('EMAIL FIELD IS REQUIRED..!')
                }
                setTimeout(setError(''), 3000);
            }
        } catch (error) {
            if (email) {
                setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                setError("USER NOT REGISTERED..!");
            }
            else {
                setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                setError('EMAIL FIELD IS REQUIRED..!')
            }
            setTimeout(() => { setError(''); }, 3000);
            console.error(error.message);
        }
    };

    useEffect(() => {
        // Check if token exists and if it's expired
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            const { expirationTime } = JSON.parse(storedToken);
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
            <div className='ForgetPasswordContainer'>
                <img className='logo' src={logo} alt='logo' />
                <div className="form-container">

                    <div className="input-group">
                        <div className='grp1' style={{ display: "flex", flexDirection: "row" }}>
                            <img className='userlogo' src={userlogo} alt='logo' />
                            <label className="input-label">EMAIL </label>
                        </div>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Please Enter Your Email"
                            className="input-field"
                            required
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="submit-button"
                    >
                        SEND OTP
                    </button>
                    {error ?
                        (<p style={style}>{error}</p>) : (<></>)}

                </div>
            </div>
        </body>
    )
}

export default ForgetPassword
