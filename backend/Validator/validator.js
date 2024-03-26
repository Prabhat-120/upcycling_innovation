const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/; 
// Validate password strength (e.g., minimum length, presence of special characters)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const isValidPassword = function (password) {
    if (passwordRegex.test(password)) return true;
    return false;
  };

  const isValidEmail = function (email) {
    if (emailRegex.test(email)) return true;
    return false;
  };

  module.exports = {
    isValidPassword:isValidPassword,
    isValidEmail:isValidEmail
}