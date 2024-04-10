import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png'
import passlogo from '../../assets/passwordlogo.svg'
import './ResetPassword.css'
import { BASE_URL } from '../../assets/Baseurl'
import axios from 'axios';


const ResetPassword = () => {
    const location = useLocation();
    const state = location.state;
    const navi = useNavigate();
    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [style, setStyle] = useState({});
    const [error, setError] = useState('');
    console.log(state);

    useEffect(() => {
        if (state === null) {
            navi('/login');
        }
    }, [navi, state]);

    const handleSubmit = async () => {
        try {
            if (password === confPassword) {
                const response = await axios.post(`${BASE_URL}/designer/resetpass`, {
                    email: state,
                    password: password,
                    conf_password: confPassword
                });
                console.log(response);
                const myFunction = () => {
                    setError('');
                    navi('/login');
                };

                if (response.data.status) {
                    setStyle({ font: "small-caption", color: "green", marginTop: "10px" })
                    setError("PASSWORD RESET SUCCESSFULLY..!");
                    setTimeout(myFunction, 3000);
                }
                else {
                    if (password && confPassword) {
                        setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                        setError("USER NOT REGISTERED..!");
                    }
                    else {
                        setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                        setError('PASSWORD & CONFIRM PASSWORD ARE REQUIRED FIELDS..!')
                    }
                    setTimeout(setError(''), 3000);
                }
            } else {

                setStyle({ font: "small-caption", color: "red", marginTop: "10px" });
                setError("CONFIRM PASSWORD IS NOT SAME AS PASSWORD..!");
                setTimeout(() => { setError('') }, 3000);
            }


        } catch (error) {

            if (password && confPassword) {
                setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                setError("USER NOT REGISTERED..!");

                if (error.response.status === 406) {
                    setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                    setError("YOU CAN'T ADD YOUR PREVIOUS PASSWORD..!");
                }
            }
            else {
                setStyle({ font: "small-caption", color: "red", marginTop: "10px" })
                setError('PASSWORD & CONFIRM PASSWORD ARE REQUIRED FIELDS..!')
            }
            setTimeout(() => { setError('') }, 3000);
            console.error(error.message);
        }
    };

    return (
        <body>
            <div className='resetContainer'>
                <img className='logo' src={logo} alt='logo' />
                <div className="form-container">
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
                    </div>
                    <div className="input-group">
                        <div className='grp2' style={{ display: "flex", flexDirection: "row" }}>
                            <img className='passlogo' src={passlogo} alt='logo' />
                            <label className="input-label" style={{ marginLeft: "2px" }}>CONFIRM PASSWORD </label>
                        </div>
                        <input
                            type="password"
                            value={confPassword}
                            onChange={(e) => setConfPassword(e.target.value)}
                            placeholder="Please Confirm Your Password"
                            className="input-field"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="submit-button"
                    >
                        RESET PASSWORD
                    </button>
                    {error ?
                        (<p style={style}>{error}</p>) : (<></>)}
                </div>
            </div>
        </body>
    )
}

export default ResetPassword
