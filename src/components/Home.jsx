
import React, { useState, useEffect } from "react";
import API from "../api";

const Home = () => {
  const [homeData, setHomeData] = useState({
    goals: { weightTarget: 0, dailyCalorieTarget: 0, stepCountTarget: 0 },
    todaySummary: { caloriesBurned: 0, caloriesConsumed: 0, stepsTaken: 0 },
    recentWorkouts: [],
    tip: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch home data from backend on component mount
  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/home/summary');
      setHomeData(response.data);
      setError("");
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Fitness HomePage</h1>
      
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Summary Cards */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h2 style={{ color: "blue" }}>🔥 Calories Burned</h2>
          <p style={styles.value}>{homeData.todaySummary.caloriesBurned} kcal</p>
        </div>

        <div style={styles.card}>
          <h2 style={{ color: "blue" }}>👣 Steps Taken</h2>
          <p style={styles.value}>{homeData.todaySummary.stepsTaken}</p>
        </div>

        <div style={styles.card}>
          <h2 style={{ color: "blue" }}>🎯 Daily Calorie Goal</h2>
          <p style={styles.value}>{homeData.goals.dailyCalorieTarget} kcal</p>
        </div>

        <div style={styles.card}>
          <h2 style={{ color: "blue" }}>⚖️ Weight Target</h2>
          <p style={styles.value}>{homeData.goals.weightTarget} kg</p>
        </div>
      </div>

      {/* Recent Workouts */}
      <div style={styles.section}>
        <h2 style={{ color: "blue" }}>📋 Recent Workouts</h2>
        
        {homeData.recentWorkouts && homeData.recentWorkouts.length > 0 ? (
          <ul style={styles.list}>
            {homeData.recentWorkouts.map((workout, index) => (
              <li key={index} style={styles.listItem}>
                <strong>{workout.exerciseType}</strong> - {workout.duration} mins | 
                <span style={{ color: '#00bfa5' }}> {workout.caloriesBurned} kcal burned</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#888' }}>No recent workouts. Start logging your exercises!</p>
        )}
      </div>

      {/* Daily Tip */}
      <div style={styles.section}>
        <h2 style={{ color: "blue" }}>💡 Daily Tip</h2>
        <p style={styles.tipText}>{homeData.tip || "Stay consistent with your fitness routine!"}</p>
      </div>

      {/* Fitness Goals Summary */}
      <div style={styles.section}>
        <h2 style={{ color: "blue" }}>🎯 Your Goals</h2>
        <div style={styles.goalsGrid}>
          <div style={styles.goalCard}>
            <p style={styles.goalLabel}>Weight Target</p>
            <p style={styles.goalValue}>{homeData.goals.weightTarget || 'Not set'} kg</p>
          </div>
          <div style={styles.goalCard}>
            <p style={styles.goalLabel}>Daily Calorie Target</p>
            <p style={styles.goalValue}>{homeData.goals.dailyCalorieTarget || 'Not set'} kcal</p>
          </div>
          <div style={styles.goalCard}>
            <p style={styles.goalLabel}>Step Count Target</p>
            <p style={styles.goalValue}>{homeData.goals.stepCountTarget || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={styles.refreshContainer}>
        <button style={styles.refreshBtn} onClick={fetchHomeData}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#edf2ef",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#00bfa5",
    fontSize: "32px",
  },

  errorMessage: {
    backgroundColor: "#ff6b6b",
    color: "#fff",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    textAlign: "center",
  },

  cardContainer: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  card: {
    backgroundColor: "#fff",
    padding: "20px",
    width: "250px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.3s",
  },

  value: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#00bfa5",
    margin: "10px 0",
  },

  section: {
    backgroundColor: "#f7e6f1",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  list: {
    listStyle: "none",
    padding: 0,
  },

  listItem: {
    padding: "10px 0",
    borderBottom: "1px solid #76ba17",
    color: "#333",
  },

  tipText: {
    fontSize: "16px",
    color: "#333",
    fontStyle: "italic",
    margin: "10px 0",
  },

  goalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  },

  goalCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },

  goalLabel: {
    color: "#666",
    fontSize: "14px",
    margin: "0",
  },

  goalValue: {
    color: "#00bfa5",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "5px 0 0 0",
  },

  refreshContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },

  refreshBtn: {
    padding: "12px 24px",
    backgroundColor: "#00bfa5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
};

export default Home;
