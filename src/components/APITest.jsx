import React, { useState, useEffect } from 'react';
import API from '../api';

/**
 * APITest Component - Comprehensive API endpoint testing tool
 * Use this to verify all backend endpoints are working correctly
 */
const APITest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Log a test result
  const logResult = (name, status, data) => {
    setResults(prev => [...prev, {
      name,
      status,
      data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Test 1: Health Check
  const testHealthCheck = async () => {
    try {
      const response = await API.get('/data');
      logResult('✅ Health Check', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Health Check', 'FAILED', error.message);
    }
  };

  // Test 2: Login
  const testLogin = async () => {
    try {
      const response = await API.post('/auth/login', {
        email: 'admin@fitapp.com',
        password: 'AdminSecurePassword123'
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      logResult('✅ Login', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Login', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 3: Get Home Summary
  const testHomeSummary = async () => {
    if (!token) {
      logResult('❌ Home Summary', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.get('/home/summary');
      logResult('✅ Home Summary', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Home Summary', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 4: Get User Profile
  const testProfile = async () => {
    if (!token) {
      logResult('❌ User Profile', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.get('/user/profile');
      logResult('✅ User Profile', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ User Profile', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 5: Add Workout
  const testAddWorkout = async () => {
    if (!token) {
      logResult('❌ Add Workout', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.post('/workouts', {
        exerciseType: 'Running',
        duration: 30,
        caloriesBurned: 300,
        date: new Date()
      });
      logResult('✅ Add Workout', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Add Workout', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 6: Get Workouts
  const testGetWorkouts = async () => {
    if (!token) {
      logResult('❌ Get Workouts', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.get('/workouts');
      logResult('✅ Get Workouts', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Get Workouts', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 7: Add Diet Log
  const testAddDiet = async () => {
    if (!token) {
      logResult('❌ Add Diet', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.post('/diet', {
        foodItem: 'Chicken Salad',
        calories: 350,
        mealType: 'lunch',
        date: new Date()
      });
      logResult('✅ Add Diet', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Add Diet', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 8: Get Diet Logs
  const testGetDiet = async () => {
    if (!token) {
      logResult('❌ Get Diet', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.get('/diet');
      logResult('✅ Get Diet', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Get Diet', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 9: Get Progress Charts
  const testProgressCharts = async () => {
    if (!token) {
      logResult('❌ Progress Charts', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.get('/progress/charts');
      logResult('✅ Progress Charts', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Progress Charts', 'FAILED', error.response?.data || error.message);
    }
  };

  // Test 10: Update Goals
  const testUpdateGoals = async () => {
    if (!token) {
      logResult('❌ Update Goals', 'FAILED', 'No token - Login first');
      return;
    }
    try {
      const response = await API.put('/goals', {
        weightTarget: 75,
        dailyCalorieTarget: 2200,
        stepCountTarget: 12000
      });
      logResult('✅ Update Goals', 'SUCCESS', response.data);
    } catch (error) {
      logResult('❌ Update Goals', 'FAILED', error.response?.data || error.message);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setResults([]);
    setLoading(true);
    await testHealthCheck();
    await testLogin();
    await new Promise(r => setTimeout(r, 500)); // Wait for token update
    
    // Get token from localStorage for remaining tests
    const newToken = localStorage.getItem('token');
    if (newToken) {
      setToken(newToken);
      await testHomeSummary();
      await testProfile();
      await testAddWorkout();
      await testGetWorkouts();
      await testAddDiet();
      await testGetDiet();
      await testProgressCharts();
      await testUpdateGoals();
    }
    setLoading(false);
  };

  // Clear results
  const clearResults = () => setResults([]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 API Endpoint Testing Tool</h1>
      
      <div style={styles.buttonContainer}>
        <button style={styles.runAllBtn} onClick={runAllTests} disabled={loading}>
          {loading ? '⏳ Running Tests...' : '▶️ Run All Tests'}
        </button>
        <button style={styles.clearBtn} onClick={clearResults}>
          🗑️ Clear Results
        </button>
      </div>

      {/* Individual Test Buttons */}
      <div style={styles.testButtonsContainer}>
        <h3>Individual Tests:</h3>
        <div style={styles.gridButtons}>
          <button style={styles.testBtn} onClick={testHealthCheck}>Health Check</button>
          <button style={styles.testBtn} onClick={testLogin}>Login</button>
          <button style={styles.testBtn} onClick={testHomeSummary}>Home Summary</button>
          <button style={styles.testBtn} onClick={testProfile}>User Profile</button>
          <button style={styles.testBtn} onClick={testAddWorkout}>Add Workout</button>
          <button style={styles.testBtn} onClick={testGetWorkouts}>Get Workouts</button>
          <button style={styles.testBtn} onClick={testAddDiet}>Add Diet</button>
          <button style={styles.testBtn} onClick={testGetDiet}>Get Diet</button>
          <button style={styles.testBtn} onClick={testProgressCharts}>Progress Charts</button>
          <button style={styles.testBtn} onClick={testUpdateGoals}>Update Goals</button>
        </div>
      </div>

      {/* Results Display */}
      <div style={styles.resultsContainer}>
        <h2 style={styles.resultsTitle}>Test Results ({results.length})</h2>
        {results.length === 0 ? (
          <p style={styles.noResults}>Click "Run All Tests" to see results...</p>
        ) : (
          results.map((result, index) => (
            <div key={index} style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultName}>{result.name}</span>
                <span style={{
                  ...styles.resultStatus,
                  backgroundColor: result.status === 'SUCCESS' ? '#28a745' : '#dc3545'
                }}>
                  {result.status}
                </span>
                <span style={styles.resultTime}>{result.timestamp}</span>
              </div>
              <pre style={styles.resultData}>{result.data}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
    color: '#fff',
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    marginBottom: '20px',
    color: '#00bfa5',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  runAllBtn: {
    padding: '12px 24px',
    backgroundColor: '#00bfa5',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  clearBtn: {
    padding: '12px 24px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  testButtonsContainer: {
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  gridButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginTop: '10px',
  },
  testBtn: {
    padding: '10px',
    backgroundColor: '#404040',
    color: '#00bfa5',
    border: '1px solid #00bfa5',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  resultsContainer: {
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRadius: '8px',
  },
  resultsTitle: {
    marginBottom: '15px',
    fontSize: '24px',
    color: '#00bfa5',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: '16px',
  },
  resultCard: {
    backgroundColor: '#3a3a3a',
    marginBottom: '15px',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: '#404040',
    borderBottom: '1px solid #555',
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: '16px',
    flex: 1,
  },
  resultStatus: {
    padding: '5px 10px',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
    marginRight: '10px',
  },
  resultTime: {
    color: '#888',
    fontSize: '12px',
  },
  resultData: {
    padding: '15px',
    backgroundColor: '#2a2a2a',
    margin: 0,
    overflow: 'auto',
    maxHeight: '300px',
    color: '#00ff00',
    fontSize: '12px',
  },
};

export default APITest;
