
import React, { useState, useEffect } from "react";
import API from '../api';

const Goals = () => {
  // Load saved configurations from localStorage or default to empty structure
  const [savedGoals, setSavedGoals] = useState(null);

  const [goals, setGoals] = useState({
    goalType: "",
    calorieTarget: "",
    stepCount: "",
  });

  const [isEditing, setIsEditing] = useState(savedGoals ? false : true);
  
  // Real-time tracking state for step counter simulator feature
  const [currentStepsInput, setCurrentStepsInput] = useState("");
  const [loggedStepsToday, setLoggedStepsToday] = useState(() => {
    const savedSteps = localStorage.getItem("fitness_today_steps_count");
    return savedSteps ? Number(savedSteps) : 0;
  });

  
useEffect(() => {
  fetchGoals();
}, []);

const fetchGoals = async () => {
  try {
    const res = await API.get("/user/profile");

    if (res.data.profile?.goals) {
      const userGoals = {
        goalType:
          res.data.profile.goals.weightTarget > 0
            ? "Weight Goal"
            : "",
        calorieTarget:
          res.data.profile.goals.dailyCalorieTarget || "",
        stepCount:
          res.data.profile.goals.stepCountTarget || "",
      };

      setSavedGoals(userGoals);
      setIsEditing(false);
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
  }
};

  useEffect(() => {
    localStorage.setItem("fitness_today_steps_count", loggedStepsToday.toString());
  }, [loggedStepsToday]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoals((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      weightTarget:
        goals.goalType === "Weight Gain"
          ? 1
          : goals.goalType === "Weight Loss"
          ? -1
          : 0,

      dailyCalorieTarget: Number(goals.calorieTarget),

      stepCountTarget: Number(goals.stepCount),
    };

    await API.put("/goals", payload);

    setSavedGoals(goals);
    setIsEditing(false);

    setGoals({
      goalType: "",
      calorieTarget: "",
      stepCount: "",
    });

    alert("Goals updated successfully!");
  } catch (error) {
    console.error("Error saving goals:", error);
    alert("Failed to save goals");
  }
};



  const handleEdit = () => {
  setGoals({
    goalType: savedGoals.goalType,
    calorieTarget: savedGoals.calorieTarget,
    stepCount: savedGoals.stepCount,
  });

  setIsEditing(true);
};

  const handleLogSteps = (e) => {
    e.preventDefault();
    if (!currentStepsInput || isNaN(currentStepsInput)) return;
    setLoggedStepsToday((prev) => prev + Number(currentStepsInput));
    setCurrentStepsInput("");
  };

  const handleResetSteps = () => {
    setLoggedStepsToday(0);
  };

  // Progress metrics math calculations engine
  const stepTarget = savedGoals ? Number(savedGoals.stepCount) || 1 : 1;
  const stepsPercentage = Math.min(Math.round((loggedStepsToday / stepTarget) * 100), 100);

  return (
    <div style={styles.fullscreenBackground}>
      <div style={styles.container}>
        <h1 style={styles.mainTitle}>Fitness Goals Configurations</h1>

        {/* GOAL CONFIGURATION FORM */}
        {isEditing && (
          <form onSubmit={handleSubmit} style={styles.form} aria-label="Goal Setup Form">
            <h2 style={styles.formSectionHeader}>
              {savedGoals ? "Modify Target Metrics" : "Establish Target baselines"}
            </h2>
            
            <select
              name="goalType"
              value={goals.goalType}
              onChange={handleChange}
              required
              style={styles.input}
              aria-label="Select Goal Type"
            >
              <option value="">Select Primary Objective</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Weight Gain">Weight Gain</option>
              <option value="Maintain Weight">Maintain Weight</option>
            </select>

            <input
              type="number"
              name="calorieTarget"
              placeholder="Daily Calorie Target (kcal)"
              value={goals.calorieTarget}
              onChange={handleChange}
              required
              min="1"
              style={styles.input}
            />

            <input
              type="number"
              name="stepCount"
              placeholder="Daily Step Count Objective"
              value={goals.stepCount}
              onChange={handleChange}
              required
              min="1"
              style={styles.input}
            />

            <div style={styles.buttonGroupRow}>
              <button type="submit" style={styles.button}>
                {savedGoals ? "Update Dashboard Goals" : "Set Target Metrics"}
              </button>
              {savedGoals && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* DISPLAY SAVED GOALS & INTERACTIVE GAUGE TRACKER */}
        {!isEditing && savedGoals && (
          <div style={styles.dashboardGridRowsLayout}>
            
            {/* Left Metrics View Block Card */}
            <div style={styles.card}>
              <h2 style={styles.cardHeading}>Target Objectives</h2>
              <div style={styles.metaDataList}>
                <p><strong>Goal Mode:</strong> <span style={styles.accentText}>{savedGoals.goalType}</span></p>
                <p><strong>Calorie Ceiling:</strong> <span>{savedGoals.calorieTarget} kcal</span></p>
                <p><strong>Steps Blueprint:</strong> <span>{savedGoals.stepCount} steps</span></p>
              </div>
              <button onClick={handleEdit} style={styles.editBtn}>
                ✏️ Edit Benchmarks
              </button>
            </div>

            {/* Right Interactive Tracking Simulator Gauge Card */}
            <div style={styles.card}>
              <h2 style={styles.cardHeading}>Steps Tracker Activity Simulator</h2>
              
              <div style={styles.progressBarWrapperTrack}>
                <div style={{
                  ...styles.progressBarFillGauge,
                  width: `${stepsPercentage}%`,
                  backgroundColor: stepsPercentage >= 100 ? "#2e7d32" : "#38bdf8"
                }} />
              </div>
              
              <div style={styles.percentageSplitRowLabel}>
                <span>{loggedStepsToday} / {savedGoals.stepCount} Steps logged</span>
                <strong>{stepsPercentage}% Complete</strong>
              </div>

              <form onSubmit={handleLogSteps} style={styles.inlineLogActionForm}>
                <input 
                  type="number"
                  placeholder="e.g. 1500"
                  value={currentStepsInput}
                  onChange={(e) => setCurrentStepsInput(e.target.value)}
                  style={styles.inlineInputBox}
                  min="1"
                  required
                />
                <button type="submit" style={styles.inlineSubmitButton}>Log Steps</button>
                <button type="button" onClick={handleResetSteps} style={styles.clearMiniBtn}>Wipe</button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

// CSS Style System Configuration Objects
const styles = {
  fullscreenBackground: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('https://i.pinimg.com/736x/89/19/76/8919766e4f8a65024ba13406063910d1.jpg')",
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
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "system-ui, sans-serif",
  },
  mainTitle: {
    textAlign: "center",
    color: "#ffffff",
    marginBottom: "25px",
    textShadow: "1px 1px 4px rgba(24, 22, 22, 0.6)",
  },
  formSectionHeader: {
    margin: "0 0 10px 0",
    fontSize: "18px",
    color: "#ffffff",
    textAlign: "left"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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
    background: "rgba(255, 255, 255, 0.95)",
    outline: "none",
    color: "#1e293b"
  },
  buttonGroupRow: {
    display: "flex",
    gap: "10px",
    marginTop: "5px"
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
  dashboardGridRowsLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  card: {
    background: "rgba(255, 255, 255, 0.96)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    textAlign: "left"
  },
  cardHeading: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a"
  },
  metaDataList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "15px",
    color: "#334155"
  },
  accentText: {
    color: "#005f56",
    fontWeight: "700"
  },
  editBtn: {
    padding: "10px 18px",
    backgroundColor: "#ed6c02",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "15px",
    fontSize: "14px",
    fontWeight: "600"
  },
  progressBarWrapperTrack: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "8px"
  },
  progressBarFillGauge: {
    height: "100%",
    transition: "width 0.4s ease-out, background-color 0.3s ease"
  },
  percentageSplitRowLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#475569",
    marginBottom: "15px"
  },
  inlineLogActionForm: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  inlineInputBox: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none"
  },
  inlineSubmitButton: {
    padding: "8px 16px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  clearMiniBtn: {
    padding: "8px 12px",
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer"
  }
};

export default Goals;
