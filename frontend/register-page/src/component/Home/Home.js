import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../assets/Baseurl";
import userlogo from '../../assets/userlogo.svg'
import 'bootstrap/dist/css/bootstrap.min.css';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import './Home.css'

const Home = () => {
  const navi = useNavigate();
  const [profile, setProfile] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  let storedToken;

  useEffect(() => {
    // Check if token exists and if it's expired
    storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      const { expirationTime } = JSON.parse(storedToken);
      if (expirationTime > new Date().getTime()) {
        // Token is valid, navigate to home page
        navi("/");
      } else {
        // Token has expired, remove it from sessionStorage
        sessionStorage.removeItem("token");
        navi("/login");
      }
    } else {
      navi("/login");
    }
  }, [navi]);

  const fetchProfile = async () => {
    try {
      storedToken = sessionStorage.getItem("token");
      const { value } = JSON.parse(storedToken);
      const response = await axios.get(`${BASE_URL}/designer/getDesigner`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          'Authorization': `Bearer ${value}`
        }
      });
      setProfile(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  };


  const fetchnewOrderList = async () => {
    try {
      storedToken = sessionStorage.getItem("token");
      const { value } = JSON.parse(storedToken);
      const response = await axios.get(`${BASE_URL}/designer/latestOrder`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          'Authorization': `Bearer ${value}`
        }
      });
      setOrderList(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const changeStatus = async (id,status) => {
    try {
      const response = await axios.get(`${BASE_URL}/designer/updateStatus`);
    } catch (err) {
      console.error(err.message);
    }
  }

  const fetchprevOrderList = async () => {
    try {
      storedToken = sessionStorage.getItem("token");
      const { value } = JSON.parse(storedToken);
      const response = await axios.get(`${BASE_URL}/designer/previousOrder`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          'Authorization': `Bearer ${value}`
        }
      });
      setOrderList(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchnewOrderList();
  }, [storedToken]);

  return (
    <div className="home-container">
      <div className="header-container">
        <div className="intro" >
          <img src={`${BASE_URL}/images/${profile.profile_pic}`} alt="userlogo" />
          <h4>{profile.name}</h4>
        </div>
        <div className="navbar">
          <h3 onClick={() => { fetchnewOrderList(); }}>New Orders</h3>
          <h3 onClick={() => { fetchprevOrderList(); }}>Previous Orders</h3>
        </div>
      </div>
      {/* servicelist.map(firm => ({ value: firm._id, label: firm.serviceName })) */}
      <div className="data-container">
        {orderList.length === 0 ? (<p style={{ fontSize: "medium", color: "red" }}>No Orders Yet..!!</p>) : (<>
          {orderList.map((order) => (
            <div className="card" key={order._id}>
              <div className="card-header">
                <div className="details">
                  <img src={`${BASE_URL}/images/${order.consumerId.images}`} alt="userlogo" />
                  <p>{order.consumerId.name}</p>
                </div>
                <div className="status">
                  {order.status === "pending" ? (
                    <>
                      <button type="button" onClick={changeStatus(order._id,"success")} className="btn btn-outline-success"><p>Completed</p></button>
                      <button type="button" onClick={changeStatus(order._id,"danger")} className="btn btn-outline-danger"><p>Cancelled</p></button>
                    </>
                  ) : (<>{order.status === "completed" ? (<button type="button" className="btn btn-success"><p>Completed</p></button>) : (<button type="button" className="btn btn-danger"><p>Canceled</p></button>)}
                  </>)}
                </div>
              </div>

              <div className="card-body">
                <div className="descriptionMain">
                  <p className="description">Description</p>
                  <p className="descdata">{order.orderDesc}</p>
                </div>
                <div className="orderMain">
                  <p className="order">Order on</p>
                  <p className="orderdata">{order.orderDate}</p>
                </div>
                <div className="image">
                  <img src={`${BASE_URL}/images/${order.photo}`} alt="HEHEH" />
                </div>
              </div>
            </div>
          ))}

        </>)}
      </div>
      <div className={`footercontainer ${visible ? '' : 'hide-footer'}`}>
        <div className="card">
          <div className="card-header">
            <div className="home">
              <HomeIcon fontSize="large" />
              <p>Home</p>
            </div>
            <div className="profile">
              <PersonIcon fontSize="large" />
              <p>Profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
