import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PinInput from 'react-pin-input';
import './VerifyOTP.css';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png'
import { BASE_URL } from '../../assets/Baseurl'


const VerifyOTP = () => {
    const [pin, setPin] = useState('');
    const [style, setStyle] = useState({});
    const [error, setError] = useState('');
    const navi = useNavigate();
    const location = useLocation();
    const state = location.state;

    useEffect(() => {
        if (state === null) {
            navi('/login');
        }
    }, [navi, state]);

    const d = location.state.email;
    const from = location.state.from;
    console.log(from)
    console.log(from === "register")
    const originalFormData = location.state.formdata;

    const handleVerify = async () => {
        if (from === "forgetPassword") {
            console.log("hot 2")
            try {

                const response = await axios.post(`${BASE_URL}/designer/verifyOtp`, {
                    email: d,
                    otp: pin
                });
                const myFunction = () => {
                    setError('');
                    navi('/resetPassword', { state: d });
                };
                if (response.data.status) {
                    setStyle({ font: "small-caption", color: "green", marginTop: "10px" })
                    setError("OTP VERIFY SUCCESSFULLY..!");
                    setTimeout(myFunction, 3000);
                }
                else {
                    if (pin) {
                        setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                        setError("USER NOT REGISTERED..!");
                    }
                    else {
                        setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                        setError('OTP FIELD IS REQUIRED..!')
                    }
                    setTimeout(setError(''), 3000);
                }
            } catch (error) {
                if (pin) {
                    setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                    setError("OTP IS INVALID..!");
                }
                else {
                    setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                    setError('OTP FIELD IS REQUIRED..!')
                }
                setTimeout(() => { setError(''); }, 3000);
                console.error(error.message);
            }
        }
        else if (from === "register") {
            try {
                const formData = new FormData();

                for (const key of Object.keys(originalFormData)) {
                    const value = originalFormData[key];
                    formData.append(key, value);
                }

                formData.append('otp', pin);
                const response = await axios.post(`https://4447-2405-201-2014-30ea-302c-ff41-2ef6-f45d.ngrok-free.app/designer/register`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        "ngrok-skip-browser-warning": "true" // Set the specified header
                    }
                });
                console.log("object")
                console.log(response);

                console.log(response.data);
                alert('Registered successfully!');
                navi("/login");
            } catch (error) {
                console.error(error.message);
                alert('Registration failed. Please try again.');
            }
        }

    };

    return (
        <body>
            <div className="verify-otp-container">
                <img className='logo' src={logo} alt='logo' />
                <div className="form-container">
                    <p className='extext'><b>PLEASE ENTER THE OTP <br /> SHARED VIA EMAIL</b></p>
                    <PinInput className='pininput'
                        inputStyle={{ borderColor: '#5E8562', borderRadius: '10px' }}
                        length={4} // Specify the length of the PIN
                        focus // Automatically focus on the input field
                        secret // Hide the PIN characters
                        onChange={(value) => setPin(value)} // Handle PIN input change
                    />
                    <button onClick={handleVerify} className="verify-button">Verify</button>
                    {error && <p style={style}>{error}</p>}
                </div>
            </div>
        </body>
    );
};

export default VerifyOTP;
