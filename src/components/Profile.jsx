import React, { useState, useEffect } from 'react';
import API from '../api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch user profile and workout history
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/user/profile');
      setProfile(response.data.profile);
      setWorkoutHistory(response.data.workoutHistory || []);
      setFormData(response.data.profile);
      setError('');
    } catch (err) {
      setError('Failed to load profile: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put('/user/profile', formData);
      setProfile(response.data);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div style={styles.container}><p style={styles.loadingText}>Loading profile...</p></div>;
  }

  if (!profile) {
    return <div style={styles.container}><p style={styles.errorText}>Profile not found</p></div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👤 My Profile</h1>

      {error && <div style={styles.errorBox}>{error}</div>}
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}

      {/* Profile Section */}
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <h2 style={styles.name}>{profile.name}</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={styles.editBtn}
          >
            {isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          // Edit Form
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.saveBtn}>💾 Save Changes</button>
          </form>
        ) : (
          // View Mode
          <div style={styles.profileDetails}>
            <div style={styles.detailRow}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{profile.email}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Age:</span>
              <span style={styles.value}>{profile.age || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Gender:</span>
              <span style={styles.value}>{profile.gender || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Phone:</span>
              <span style={styles.value}>{profile.phone || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Role:</span>
              <span style={{
                ...styles.value,
                backgroundColor: profile.role === 'admin' ? '#e74c3c' : '#3498db',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                display: 'inline-block'
              }}>
                {profile.role || 'user'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fitness Goals Section */}
      {profile.goals && (
        <div style={styles.goalsCard}>
          <h3 style={styles.goalsTitle}>🎯 Fitness Goals</h3>
          <div style={styles.goalsGrid}>
            <div style={styles.goalItem}>
              <span style={styles.goalLabel}>Weight Target:</span>
              <span style={styles.goalValue}>{profile.goals.weightTarget || 'Not set'} kg</span>
            </div>
            <div style={styles.goalItem}>
              <span style={styles.goalLabel}>Daily Calorie Target:</span>
              <span style={styles.goalValue}>{profile.goals.dailyCalorieTarget || 'Not set'} kcal</span>
            </div>
            <div style={styles.goalItem}>
              <span style={styles.goalLabel}>Step Count Target:</span>
              <span style={styles.goalValue}>{profile.goals.stepCountTarget || 'Not set'} steps</span>
            </div>
          </div>
        </div>
      )}

      {/* Workout History Section */}
      <div style={styles.historyCard}>
        <h3 style={styles.historyTitle}>📋 Workout History</h3>
        
        {workoutHistory.length === 0 ? (
          <p style={styles.emptyText}>No workouts recorded yet. Start tracking!</p>
        ) : (
          <div style={styles.workoutList}>
            {workoutHistory.slice(0, 10).map((workout, index) => (
              <div key={index} style={styles.workoutItem}>
                <div style={styles.workoutInfo}>
                  <h4 style={styles.workoutType}>{workout.exerciseType}</h4>
                  <p style={styles.workoutDetails}>
                    Duration: {workout.duration} mins | Calories: {workout.caloriesBurned} kcal
                  </p>
                  <p style={styles.workoutDate}>
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    maxWidth: '1000px',
    margin: '0 auto',
  },

  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '32px',
  },

  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '18px',
    marginTop: '50px',
  },

  errorText: {
    textAlign: 'center',
    color: '#e74c3c',
    fontSize: '18px',
    marginTop: '50px',
  },

  errorBox: {
    backgroundColor: '#ffebee',
    border: '2px solid #e74c3c',
    color: '#c0392b',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },

  successBox: {
    backgroundColor: '#e8f5e9',
    border: '2px solid #27ae60',
    color: '#1b5e20',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },

  profileCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '25px',
  },

  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '15px',
  },

  name: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '24px',
  },

  editBtn: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },

  form: {
    marginTop: '20px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },

  input: {
    padding: '10px',
    border: '1px solid #bdc3c7',
    borderRadius: '5px',
    fontSize: '14px',
    marginTop: '5px',
    fontFamily: 'Arial, sans-serif',
  },

  saveBtn: {
    padding: '12px 30px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },

  profileDetails: {
    marginTop: '20px',
  },

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #ecf0f1',
  },

  label: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  value: {
    color: '#7f8c8d',
  },

  goalsCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '25px',
  },

  goalsTitle: {
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '20px',
    borderBottom: '2px solid #f39c12',
    paddingBottom: '10px',
  },

  goalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },

  goalItem: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    border: '2px solid #f39c12',
  },

  goalLabel: {
    display: 'block',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '5px',
  },

  goalValue: {
    display: 'block',
    fontSize: '18px',
    color: '#f39c12',
    fontWeight: 'bold',
  },

  historyCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },

  historyTitle: {
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '20px',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },

  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    padding: '20px',
    fontSize: '16px',
  },

  workoutList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  workoutItem: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    borderLeft: '4px solid #3498db',
    transition: 'transform 0.2s',
  },

  workoutInfo: {
    margin: 0,
  },

  workoutType: {
    margin: '0 0 5px 0',
    color: '#2c3e50',
    fontSize: '16px',
  },

  workoutDetails: {
    margin: '5px 0',
    color: '#7f8c8d',
    fontSize: '14px',
  },

  workoutDate: {
    margin: '5px 0 0 0',
    color: '#95a5a6',
    fontSize: '12px',
  },
};

export default Profile;
