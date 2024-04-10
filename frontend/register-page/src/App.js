import './App.css';
import Register from './component/Register/Register';
import {
  BrowserRouter as Router,
  Routes,
  Route} from "react-router-dom";
import Login from './component/Login/Login';
import Home from './component/Home/Home';
import ForgetPassword from './component/ForgetPassword/ForgetPassword';
import VerifyOTP from './component/VerifyOTP/VerifyOTP';
import ResetPassword from './component/ResetPassword/ResetPassword';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path='/register' Component={Register} />
          <Route exact path='/login' Component={Login} />
          <Route exact path='/' Component={Home} />
          <Route exact path='/forgetPassword' Component={ForgetPassword} />
          <Route exact path='/VerifyOTP' Component={VerifyOTP} />
          <Route exact path='/resetPassword' Component={ResetPassword} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
