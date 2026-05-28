

import React, { useState, useEffect } from "react";
import API from '../api';

const Workout = () => {
  // Load workout logs from localStorage
   const [workouts, setWorkouts] = useState([]);
  

  // Load custom weekly calorie goal from localStorage (defaults to 2000 kcal)
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const savedGoal = localStorage.getItem("workout_weekly_goal");
    return savedGoal ? Number(savedGoal) : 2000;
  });

  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    exercise: "",
    duration: "",
    calories: "",
    date: getTodayDate(),
  });

  // Save data to localStorage

  // useEffect(() => {
  //   localStorage.setItem("workout_logs", JSON.stringify(workouts));
  // }, [workouts]);

  // useEffect(() => {
  //   localStorage.setItem("workout_weekly_goal", weeklyGoal.toString());
  // }, [weeklyGoal]);
useEffect(() => {
  fetchWorkouts();
}, []);

const fetchWorkouts = async () => {
  try {
    const res = await API.get("/workouts");

    const formatted = res.data.map((item) => ({
      id: item._id,
      exercise: item.exerciseType,
      duration: item.duration,
      calories: item.caloriesBurned,
      date: item.date
        ? new Date(item.date).toISOString().split("T")[0]
        : getTodayDate(),
    }));

    setWorkouts(formatted);
  } catch (error) {
    console.error("Error fetching workouts:", error);
  }
};

  // Calculations
  const totalCalories = workouts.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalDuration = workouts.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);

  // Dynamic Progress Calculations
  const progressPercentage = Math.min(Math.round((totalCalories / weeklyGoal) * 100), 100);

  // Pick progress color dynamically based on threshold met
  const getProgressColor = (percent) => {
    if (percent < 40) return "#ef4444"; // Red for low activity
    if (percent < 80) return "#f97316"; // Orange for mid activity
    return "#2e7d32"; // Green for crushing goals
  };

  const filteredWorkouts = workouts.filter((workout) =>
    workout.exercise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (editId !== null) {
  //     setWorkouts((prev) =>
  //       prev.map((item) => (item.id === editId ? { ...formData, id: editId } : item))
  //     );
  //     setEditId(null);
  //   } else {
  //     setWorkouts((prev) => [...prev, { ...formData, id: Date.now() }]);
  //   }
  //   setFormData({ exercise: "", duration: "", calories: "", date: getTodayDate() });
  // };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      exerciseType: formData.exercise,
      duration: Number(formData.duration),
      caloriesBurned: Number(formData.calories),
      date: formData.date,
    };

    if (editId !== null) {
      await API.put(`/workouts/${editId}`, payload);
      setEditId(null);
    } else {
      await API.post("/workouts", payload);
    }

    fetchWorkouts();

    setFormData({
      exercise: "",
      duration: "",
      calories: "",
      date: getTodayDate(),
    });
  } catch (error) {
    console.error("Workout save failed:", error);
    alert("Failed to save workout");
  }
};

  // const handleDelete = (id) => {
  //   setWorkouts((prev) => prev.filter((item) => item.id !== id));
  //   if (editId === id) {
  //     setEditId(null);
  //     setFormData({ exercise: "", duration: "", calories: "", date: getTodayDate() });
  //   }
  // };
  const handleDelete = async (id) => {
  try {
    await API.delete(`/workouts/${id}`);

    setWorkouts((prev) =>
      prev.filter((item) => item.id !== id)
    );

    if (editId === id) {
      setEditId(null);
      setFormData({
        exercise: "",
        duration: "",
        calories: "",
        date: getTodayDate(),
      });
    }
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete workout");
  }
};

  // const handleClearAll = () => {
  //   if (window.confirm("Are you sure you want to delete all workout logs?")) {
  //     setWorkouts([]);
  //     setEditId(null);
  //     setFormData({ exercise: "", duration: "", calories: "", date: getTodayDate() });
  //   }
  // };
  const handleClearAll = async () => {
  if (
    window.confirm(
      "Are you sure you want to delete all workout logs?"
    )
  ) {
    try {
      await Promise.all(
        workouts.map((workout) =>
          API.delete(`/workouts/${workout.id}`)
        )
      );

      setWorkouts([]);
      setEditId(null);

      setFormData({
        exercise: "",
        duration: "",
        calories: "",
        date: getTodayDate(),
      });
    } catch (error) {
      console.error(error);
      alert("Failed to clear workouts");
    }
  }
};


  const handleEdit = (workout) => {
    setFormData({
      exercise: workout.exercise,
      duration: workout.duration,
      calories: workout.calories,
      date: workout.date || getTodayDate(),
    });
    setEditId(workout.id);
  };

  return (
    <div style={styles.fullscreenBackground}>
      <div style={styles.container}>
        <h1 style={styles.mainTitle}>Workout Logging Page</h1>

        {/* Live Metrics Summary Dashboard */}
        <div style={styles.dashboard}>
          <div style={styles.metricCard}>
            <h3>Total Workouts</h3>
            <p style={styles.metricValue}>{workouts.length}</p>
          </div>
          <div style={styles.metricCard}>
            <h3>Total Duration</h3>
            <p style={styles.metricValue}>{totalDuration} mins</p>
          </div>
          <div style={styles.metricCard}>
            <h3>Total Calories</h3>
            <p style={styles.metricValue}>{totalCalories} kcal</p>
          </div>
        </div>

        {/* Weekly Tracker Dashboard Card */}
        <div style={styles.targetCard}>
          <div style={styles.targetHeader}>
            <span style={styles.targetTitle}>🎯 Weekly Target Progress</span>
            <div style={styles.goalInputWrapper}>
              <label htmlFor="goalInput" style={styles.goalLabel}>Goal:</label>
              <input
                id="goalInput"
                type="number"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Math.max(1, Number(e.target.value)))}
                style={styles.goalInput}
              />
              <span style={styles.kcalSpan}>kcal</span>
            </div>
          </div>
          
          <div style={styles.progressContainer}>
            <div 
              style={{
                ...styles.progressBar, 
                width: `${progressPercentage}%`, 
                backgroundColor: getProgressColor(progressPercentage)
              }} 
            />
          </div>

          <div style={styles.progressStatusText}>
            <span>{totalCalories} / {weeklyGoal} kcal burned</span>
            <span>{progressPercentage}% Completed</span>
          </div>
        </div>

        {/* Workout Form */}
        <form onSubmit={handleSubmit} style={styles.form} aria-label="Workout Logger">
          <input
            type="text"
            name="exercise"
            placeholder="Exercise Type"
            value={formData.exercise}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (minutes)"
            value={formData.duration}
            onChange={handleChange}
            required
            min="1"
            style={styles.input}
          />
          <input
            type="number"
            name="calories"
            placeholder="Calories Burned"
            value={formData.calories}
            onChange={handleChange}
            required
            min="0"
            style={styles.input}
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.button}>
              {editId !== null ? "Update Workout" : "Add Workout"}
            </button>
            {editId !== null && (
              <button type="button" onClick={() => setEditId(null)} style={styles.cancelBtn}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Search & Header Layout */}
        <div style={styles.listHeaderContainer}>
          <h2 style={styles.sectionTitle}>Workout Logs</h2>
          {workouts.length > 0 && (
            <button onClick={handleClearAll} style={styles.clearAllBtn}>
              Clear History
            </button>
          )}
        </div>

        {workouts.length > 0 && (
          <input
            type="text"
            placeholder="🔍 Search exercises by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchBar}
          />
        )}

        {/* Render List */}
        <div>
          {workouts.length === 0 ? (
            <p style={styles.emptyMessage}>No workouts added yet.</p>
          ) : filteredWorkouts.length === 0 ? (
            <p style={styles.emptyMessage}>No exercises matching your search.</p>
          ) : (
            filteredWorkouts.map((workout) => (
              <div key={workout.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <span style={styles.cardDate}>{workout.date}</span>
                  <p><strong>Exercise:</strong> {workout.exercise}</p>
                  <p><strong>Duration:</strong> {workout.duration} mins</p>
                  <p><strong>Calories:</strong> {workout.calories} kcal</p>
                </div>
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(workout)} style={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(workout.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// CSS Style System Configuration
const styles = {
  fullscreenBackground: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('https://i.pinimg.com/1200x/b9/9f/75/b99f75b77ab84ff4703b157f5010a1af.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 0",
    boxSizing: "border-box",
  },
  container: {
    width: "90%",
    maxWidth: "650px",
    margin: "0 auto",
    fontFamily: "system-ui, sans-serif",
  },
  mainTitle: {
    textAlign: "center",
    color: "#ffffff",
    marginBottom: "25px",
    textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
  },
  dashboard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "15px",
  },
  metricCard: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.95)",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  metricValue: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "5px 0 0 0",
    color: "#18181b",
  },
  targetCard: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  targetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  targetTitle: {
    fontWeight: "bold",
    color: "#18181b",
    fontSize: "16px",
  },
  goalInputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  goalLabel: {
    fontSize: "14px",
    color: "#4b5563",
  },
  goalInput: {
    width: "70px",
    padding: "4px 6px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    fontWeight: "bold",
    textAlign: "center",
  },
  kcalSpan: {
    fontSize: "13px",
    color: "#4b5563",
    fontWeight: "500",
  },
  progressContainer: {
    width: "100%",
    height: "14px",
    backgroundColor: "#e4e4e7",
    borderRadius: "7px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressBar: {
    height: "100%",
    transition: "width 0.4s ease-out, background-color 0.3s ease",
  },
  progressStatusText: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#4b5563",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "25px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(8px)",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.25)",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.9)",
  },
  searchBar: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.95)",
    boxSizing: "border-box",
    marginBottom: "20px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  button: {
    flex: 2,
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#71717a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  listHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  sectionTitle: {
    color: "#ffffff",
    textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
    margin: 0,
  },
  clearAllBtn: {
    padding: "8px 14px",
    backgroundColor: "transparent",
    color: "#f87171",
    border: "1px solid #f87171",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#e4e4e7",
    fontSize: "16px",
    marginTop: "15px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "15px",
    marginBottom: "12px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#18181b",
  },
  cardDate: {
    fontSize: "12px",
    color: "#71717a",
    fontWeight: "bold",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "8px 14px",
    backgroundColor: "#ed6c02",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 14px",
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Workout;
