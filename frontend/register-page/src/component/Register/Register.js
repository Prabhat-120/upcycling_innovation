import React, { useEffect, useState, useRef } from 'react';
import Select from "react-select";
import axios from 'axios';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../assets/Baseurl';
import user from '../../assets/UserImage.svg'
import userlogo from '../../assets/userlogo.svg'
import passlogo from '../../assets/passwordlogo.svg'
import cameraIcon from '../../assets/cameraIcon.svg'
import emaillogo from '../../assets/Mail.svg'
import biologo from '../../assets/bio.svg'
import loclogo from '../../assets/location.svg'
import aerrow from '../../assets/Aerrow.svg'




function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profile_pic, setProfile_pic] = useState(null); // Changed initial value to null
    const [categorieslist, setCategorieslist] = useState([]);
    const [servicelist, setServicelist] = useState([]);
    const [SubServicelist, setSubServicelist] = useState([]);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [subServices, setSubServices] = useState([]);
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    // const [otp, setOtp] = useState('');
    const [mob, setmob] = useState('');
    const fileInputRef = useRef(null);
    const navi = useNavigate();


    // Function to handle registration
    const handleRegister = async () => {


        // Create a new FormData object
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('categories', JSON.stringify(categories));
        formData.append('password', password);
        //formData.append('otp', otpNumber);
        formData.append('location', location);
        formData.append('services', JSON.stringify(services));
        formData.append('subservices', JSON.stringify(subServices));
        formData.append('Bio', bio);
        formData.append('mob', mob);
        if (profile_pic) {
            formData.append('profile_pic', profile_pic);
        }

        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        try {
            const response = await axios.post(`${BASE_URL}/sendotp`, { email: email });
            // console.log("hit");
            console.log(response);
        } catch (error) {
            console.error(error.message);
        }

        const data = {
            email: email,
            from: "register",
            formdata: formDataObject
        }



        navi('/VerifyOTP', { state: data });

        // try {
        //     const response = await axios.post(`https://e966-2405-201-2014-30ea-bdaf-8fab-b88e-2237.ngrok-free.app/designer/register`, formData, {
        //         headers: {
        //             'Content-Type': 'multipart/form-data',
        //             "ngrok-skip-browser-warning": "true" // Set the specified header
        //         }
        //     });
        //     console.log("object")
        //     console.log(response);

        //     console.log(response.data);
        //     alert('Registered successfully!');
        //     setName('');
        //     setEmail('');
        //     setCategories('');
        //     setPassword('');
        //     setOtp('');
        //     setLocation([]);
        //     setBio('');
        //     setmob('');
        //     setServices('');
        //     setSubServices('');
        //     if (fileInputRef.current) {
        //         fileInputRef.current.value = '';
        //     }
        //     // Clear profile_pic state
        //     setProfile_pic(null);
        //     navi("/login");
        // } catch (error) {
        //     console.error(error.message);
        //     alert('Registration failed. Please try again.');
        // }
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


    // Function to handle OTP sending
    // const handleotp = async () => {
    //     try {
    //         const response = await axios.post(`${BASE_URL}/sendotp`, { email: email });
    //         // console.log("hit");
    //         console.log(response);
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // };

    // Function to handle image change
    const onImageChange = (e) => {

        const selectedFile = e.target.files[0];
        setProfile_pic(selectedFile);
    }

    // Function to fetch all categories
    const fetchAllcat = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/designer/getCategories`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            setCategorieslist(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchAllService = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/designer/getServices`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            setServicelist(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchAllSubService = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/designer/getSubServices`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            setSubServicelist(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Function to clear form data
    // const clearForm = () => {
    //     // Clearing form fields
    //     setName('');
    //     setEmail('');
    //     setCategories('');
    //     setPassword('');
    //     setOtp('');
    //     if (fileInputRef.current) {
    //         fileInputRef.current.value = '';
    //     }
    //     // Clear profile_pic state
    //     setProfile_pic(null);
    // };

    // Fetch categories on component mount
    useEffect(() => {
        fetchAllcat();
        fetchAllService();
        fetchAllSubService();
    }, []);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            marginTop: "10px",
            outline: "0",
            borderWidth: '0 0 2px',
            borderColor: '#5E8562',
            //mixBlendMode: "multiply",
            marginBottom: "10px",
            borderColor: !state.isFocused ? "#5E8562" : "#5E8562",
            backgroundColor: "#FFF7F0",
            boxShadow: state.isFocused ? "0 0 0 1px #FFF7F0" : " #5E8562",
            "&:hover": {
                borderColor: state.isFocused ? "#5E8562" : "#5E8562"
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            borderRadius: "15px",
            padding: "3px",
            backgroundColor: "#E5BB95", // Set background color to green
            color: "#fff", // Set text color to white
            marginRight: "5px"
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#fff", // Set text color to white
            fontSize: "14px"
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#fff", // Set remove icon color to white
            ":hover": {
                backgroundColor: "#E5BB95", // Set background color on hover
                color: "#fff" // Set text color to white on hover
            }
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        option: (provided) => ({
            ...provided,
            backgroundColor: "white", // Set a solid background color for options
            ":hover": {
                backgroundColor: "#red" // Set background color on hover
            }
        }),
        placeholder: (provided) => ({
            ...provided,
            fontFamily: 'Times New Roman, Times, serif',
            color: "#5E8562", // Set font family for the placeholder
            textAlign: "left" // Align placeholder text to the left
        })
    };

    //  console.log(servicelist)
    // console.log(categories)
    // console.log(services)
    // console.log(subServices)


    return (
        <body>
            <div className="register-container">
                <div className="headerdiv" style={{ width: '300px', display: "flex", flexDirection: 'row' }}>
                    <h2 style={{ float: 'left', cursor: "pointer" }}><img onClick={() => { navi("/login") }} src={aerrow} alt='back' /></h2>
                    <h2 style={{ marginLeft: '75px' }}>Register Here !</h2>
                </div>

                <div className='form-container'>
                    <div className="group1">
                        {profile_pic ? (
                            <img src={URL.createObjectURL(profile_pic)} alt='user logo' />
                        ) : (
                            <img src={user} alt='user logo' />
                        )}
                    </div>
                    <div className="uploadbtn">
                        <img onClick={() => fileInputRef.current.click()} src={cameraIcon} alt="camera" />
                    </div>
                    <div className="input-group">
                        <div className="grp1">
                            <img className='userlogo' src={userlogo} alt='logo' />
                            <label className='input-label' htmlFor="name"><b>NAME</b></label>
                        </div>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enater Name'
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <div className="grp1">
                            <img className='userlogo' src={emaillogo} alt='logo' />
                            <label className='input-label' htmlFor="email"><b>EMAIL</b></label>
                        </div>

                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enater Email'
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <div className="grp1">
                            <img className='userlogo' src={emaillogo} alt='logo' />
                            <label className='input-label' htmlFor="mobile"><b>PHONE NUMBER</b></label>
                        </div>

                        <input
                            type="text"
                            id="mob"
                            value={mob}
                            onChange={(e) => setmob(e.target.value)}
                            placeholder='Enater Phone Number'
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <div className="grp1">
                            <label className='input-label' htmlFor="categories"><b>PRODUCT CATEGORY</b></label>
                        </div>

                        <Select
                            isMulti
                            id="categories"
                            value={categories}
                            placeholder="Select Product"
                            options={categorieslist.map(firm => ({ value: firm._id, label: firm.productName }))}
                            onChange={(selectedOptions) => setCategories(selectedOptions)}
                            //className="input-field"
                            styles={customStyles}
                        />
                    </div>

                    {/* Select Services */}
                    <div className="input-group">
                        <div className="grp1">
                            <label className='input-label' htmlFor="services"><b>SERVICES</b></label>
                        </div>
                        <Select
                            isMulti
                            id="services"
                            value={services}
                            placeholder="Select Service"
                            options={servicelist.map(firm => ({ value: firm._id, label: firm.serviceName }))}
                            onChange={(selectedOptions) => setServices(selectedOptions)}
                            //className="input-field"
                            styles={customStyles}
                        />
                    </div>

                    {/* Select Sub-Services */}
                    <div className="input-group">
                        <div className="grp1">
                            <label className='input-label' htmlFor="subServices"><b>SUB SERVICES</b></label>
                        </div>
                        <Select
                            isMulti
                            id="subServices"
                            value={subServices}
                            placeholder="Select Sub Services"
                            options={SubServicelist.map(firm => ({ value: firm._id, label: firm.subServiceName }))}
                            onChange={(selectedOptions) => setSubServices(selectedOptions)}
                            //className="input-field"
                            styles={customStyles}
                        />
                    </div>

                    {/* Location */}
                    <div className="input-group">
                        <div className="grp1">
                            <img className='userlogo' src={loclogo} alt='logo' />
                            <label className='input-label' htmlFor="location"><b>Location</b></label>
                        </div>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder='Enter Location'
                            className="input-field"
                        />
                    </div>

                    {/* Bio */}
                    <div className="input-group">
                        <div className="grp1">
                            <img className='userlogo' src={biologo} alt='logo' />
                            <label className='input-label' htmlFor="bio"><b>BIO</b></label>
                        </div>
                        <input
                            type="text"
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder='Enter Bio'
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <div className="grp1">
                            <img className='passlogo' src={passlogo} alt='logo' />
                            <label className='input-label' htmlFor="password"><b>PASSWORD</b></label>
                        </div>

                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder='Enater Password'
                        />
                    </div>

                    {/* <div className="input-group">
                    <div className="grp1">
                        <label className='input-label' htmlFor="otp"><b>OTP</b></label>
                    </div>

                    <input
                        type="number"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input-field"
                        placeholder='Enater OTP'
                    />
                </div> */}

                    <div className="extra">
                        <label style={{ display: 'none' }} className='input-label' htmlFor="profile_pic"><b>Profile Picture:</b></label>
                        <input
                            style={{ display: 'none' }}
                            type="file"
                            id="profile_pic"
                            onChange={onImageChange}
                            className="input-field"
                            ref={fileInputRef}
                        />
                    </div>
                    <div className="button-container">
                        <button onClick={handleRegister} className="register-button">Register</button>
                        {/* <button onClick={handleotp} className="otp-button">Send OTP</button> */}
                    </div>
                </div>
            </div>
        </body>
    );
}

export default Register;
