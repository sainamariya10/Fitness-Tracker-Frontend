import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import API from "../api";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call backend login endpoint
      const response = await API.post('/auth/login', loginData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      
      // Redirect based on role
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
        alert("Login Successful");

    } catch (error) {
      // Handle different error types
      if (error.response) {
        setError(error.response.data?.message || 'Login failed. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Left Section */}
      <div style={styles.left}>
        <h1 style={styles.heading}>Get moving.</h1>
        <p style={styles.subtext}>Track your fitness, your way.</p>
      
      </div>

      {/* Right Section */}
      <div style={styles.right}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Log in</h2>

          {/* Error Message Display */}
          {error && <div style={styles.errorMessage}>{error}</div>}

          <div style={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              style={styles.input}
              value={loginData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="Enter your password" 
              style={styles.input}
              value={loginData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.options}>
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" style={styles.link}>Forgot password?</a>
          </div>

          <button 
            style={styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div style={styles.signup}>
            New here? <Link to="/register" style={styles.link}>Sign up</Link>
          </div>

          {/* Demo Credentials */}
          <div style={styles.demoBox}>
            <p style={styles.demoTitle}>Demo Credentials:</p>
            <p style={styles.demoText}>Email: user@fitapp.com</p>
            <p style={styles.demoText}>Password: UserSecurePassword123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  left: {
    flex: 1,
    backgroundImage:
      "url('https://i.pinimg.com/736x/76/0f/a8/760fa8024ccc13e15b595c8c084ab919.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px",
  },

  heading: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  subtext: {
    fontSize: "18px",
  },

  right: {
    flex: 1,
    backgroundColor: "#100b0b",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  loginBox: {
    width: "350px",
  },

  title: {
    marginBottom: "20px",
    fontSize: "28px",
    color: "#fff",
  },

  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
  },

  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    marginTop: "5px",
  },

  options: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "15px",
    color: "#fff",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#00bfa5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "15px",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },

  signup: {
    textAlign: "center",
    fontSize: "14px",
    marginTop: "10px",
    color: "#fff",
  },

  link: {
    color: "#00bfa5",
    textDecoration: "none",
    cursor: "pointer",
  },

  errorMessage: {
    backgroundColor: "#ff6b6b",
    color: "#fff",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "center",
  },

  demoBox: {
    backgroundColor: "#1a1a1a",
    padding: "12px",
    borderRadius: "5px",
    marginTop: "15px",
    fontSize: "12px",
    color: "#00bfa5",
    border: "1px solid #00bfa5",
  },

  demoTitle: {
    margin: "0 0 8px 0",
    fontWeight: "bold",
  },

  demoText: {
    margin: "4px 0",
  },
};

export default Login;
