import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    password: '',
    weightTarget: '70',
    dailyCalorieTarget: '2000',
    stepCountTarget: '10000'
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Call backend signup endpoint
      const response = await API.post('/auth/signup', {
        ...formData,
        age: Number(formData.age),
        weightTarget: Number(formData.weightTarget),
        dailyCalorieTarget: Number(formData.dailyCalorieTarget),
        stepCountTarget: Number(formData.stepCountTarget)
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);

      // Redirect to home
      navigate('/home');
      alert("Signup Successful");
      
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || 'Registration failed. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Fitness Tracker today</p>
        
        {/* Error Message Display */}
        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              onChange={handleChange} 
              value={formData.name}
              style={styles.input} 
              required 
            />
            <input 
              type="number" 
              name="age" 
              placeholder="Age" 
              onChange={handleChange} 
              value={formData.age}
              style={{ ...styles.input, width: '30%' }} 
              required 
            />
          </div>

          <select 
            name="gender" 
            onChange={handleChange} 
            value={formData.gender}
            style={styles.select} 
            required
          >
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            onChange={handleChange} 
            value={formData.email}
            style={styles.input} 
            required 
          />

          <input 
            type="tel" 
            name="phone" 
            placeholder="Phone Number" 
            onChange={handleChange} 
            value={formData.phone}
            style={styles.input} 
            required 
          />

          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            value={formData.password}
            style={styles.input} 
            required 
          />

          {/* Fitness Goals */}
          <div style={styles.goalsSection}>
            <h4 style={styles.goalsTitle}>Fitness Goals (Optional)</h4>
            
            <input 
              type="number" 
              name="weightTarget" 
              placeholder="Target Weight (kg)" 
              onChange={handleChange} 
              value={formData.weightTarget}
              style={styles.input} 
            />

            <input 
              type="number" 
              name="dailyCalorieTarget" 
              placeholder="Daily Calorie Target" 
              onChange={handleChange} 
              value={formData.dailyCalorieTarget}
              style={styles.input} 
            />

            <input 
              type="number" 
              name="stepCountTarget" 
              placeholder="Step Count Target" 
              onChange={handleChange} 
              value={formData.stepCountTarget}
              style={styles.input} 
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: "url('https://i.pinimg.com/1200x/53/7a/a3/537aa345e021ef6c853009b550ba6347.jpg')",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '20px'
  },
  card: {
    backgroundColor: '#f7e6e6',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '450px',
    boxSizing: 'border-box'
  },
  title: {
    margin: '0 0 8px 0',
    textAlign: 'center',
    color: '#00695e',
    fontSize: '28px',
    fontWeight: '700'
  },
  subtitle: {
    margin: '0 0 24px 0',
    textAlign: 'center',
    color: '#2d5fc2',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  row: {
    display: 'flex',
    gap: '12px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f9fafb',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f9fafb',
    color: '#374151'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#005f56',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#4b5563'
  },
  link: {
    color: '#005f56',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  errorMessage: {
    backgroundColor: '#ff6b6b',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center',
  },
  goalsSection: {
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '8px'
  },
  goalsTitle: {
    margin: '0 0 12px 0',
    color: '#005f56',
    fontSize: '14px',
    fontWeight: '600'
  }
};

export default Register;
