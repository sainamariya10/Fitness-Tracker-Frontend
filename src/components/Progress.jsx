
import React, { useState ,useEffect} from 'react';
import { useFitness } from './FitnessContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import API from '../api';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function Progress() {
  // const { workouts, dietLogs, totalEaten, totalBurned, netCalories, getWeeklyChronologicalArray } = useFitness();
  const [workouts, setWorkouts] = useState([]);
const [dietLogs, setDietLogs] = useState([]);
const [activeMetric, setActiveMetric] = useState('burned');

useEffect(() => {
  fetchProgress();
}, []);

const fetchProgress = async () => {
  try {
    const res = await API.get("/progress/charts");

    setWorkouts(res.data.workoutStats || []);
    setDietLogs(res.data.dietStats || []);
  } catch (error) {
    console.error("Progress fetch failed:", error);
  }
};


  // Extract structured chart data bundles live from Context matrices engine
 const burnedWeekData = {
  labels: workouts.map((item) => item._id),
  data: workouts.map((item) => item.totalCaloriesBurned),
};

const eatenWeekData = {
  labels: dietLogs.map((item) => item._id),
  data: dietLogs.map(
    (item) => item.totalCaloriesConsumed
  ),
};

  const totalBurned = workouts.reduce(
  (sum, item) => sum + item.totalCaloriesBurned,
  0
);

const totalEaten = dietLogs.reduce(
  (sum, item) => sum + item.totalCaloriesConsumed,
  0
);

const netCalories = totalEaten - totalBurned;


  const currentViewDataset = activeMetric === 'burned' ? burnedWeekData : eatenWeekData;
  const activeColor = activeMetric === 'burned' ? '#005f56' : '#e0533c';

  // Compute dynamic mathematical insight indicators live
  const maxCalories =
  currentViewDataset.data.length > 0
    ? Math.max(...currentViewDataset.data)
    : 0;

  const averageCalories = currentViewDataset.data.length ? Math.round(
    currentViewDataset.data.reduce((sum, curr) => sum + curr, 0) / currentViewDataset.data.length
  ) : 0;

  // Net Bar Configurations logic rules
  const targetNetLimit = 1500; // Defensive threshold weight goal budget baseline marker
  const netPercentage = Math.min(Math.round((Math.abs(netCalories) / targetNetLimit) * 100), 100);
  
  // Set up conditional weight target status indicators color configurations
  const getNetBarColor = () => {
    if (netCalories <= 0) return "#2e7d32"; // Green: Energy Deficit (Great for defensive fat loss)
    if (netCalories < 500) return "#f97316"; // Orange: Mild Surplus (Calorie balance)
    return "#ef4444"; // Red: High Calorie Surplus
  };

  const data = {
    labels: currentViewDataset.labels,
    datasets: [
      {
        label: activeMetric === 'burned' ? 'Calories Burned (Workouts)' : 'Calories Eaten (Diet)',
        data: currentViewDataset.data,
        borderColor: activeColor,
        backgroundColor: activeMetric === 'burned' ? 'rgba(0, 95, 86, 0.1)' : 'rgba(224, 83, 60, 0.1)',
        tension: 0.3,
        pointBackgroundColor: activeColor,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } }
  };

  return (
    <div style={styles.fullscreenBackground}>
      <div style={styles.container}>
        <div style={styles.card}>
          
          <div style={styles.bannerWrapper}>
            <div style={styles.bannerOverlay}>
              <h1 style={styles.title}>Performance Analytics</h1>
              <p style={styles.subtitle}>Review your long-term health metrics progress</p>
            </div>
          </div>

          {/* New Feature: Net Clear Calorie Calculation Progress Bar Dashboard Component */}
          <div style={styles.netTrackerCard}>
            <div style={styles.netHeaderRow}>
              <span style={styles.netTitle}>⚖️ Net Calorie Balance Status</span>
              <span style={{ ...styles.netStatusPill, backgroundColor: getNetBarColor() }}>
                {netCalories <= 0 ? "Deficit (Burning Fat)" : "Surplus (Gaining Mass)"}
              </span>
            </div>
            
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${netPercentage || 5}%`, backgroundColor: getNetBarColor() }} />
            </div>

            <div style={styles.netSummaryRow}>
              <span>Eaten ({totalEaten}) - Burned ({totalBurned})</span>
              <strong>{netCalories} net kcal</strong>
            </div>
          </div>

          <div style={styles.controlPanel}>
            <div style={styles.toggleContainer}>
              <button onClick={() => setActiveMetric('burned')} style={{...styles.toggleBtn, ...(activeMetric === 'burned' ? styles.activeBurnedToggle : {})}}>
                🔥 Burned
              </button>
              <button onClick={() => setActiveMetric('eaten')} style={{...styles.toggleBtn, ...(activeMetric === 'eaten' ? styles.activeEatenToggle : {})}}>
                🥗 Eaten
              </button>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>7-Day Peak Record</span>
              <span style={{...styles.statValue, color: activeColor}}>{maxCalories} kcal</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Daily Baseline Avg</span>
              <span style={{...styles.statValue, color: activeColor}}>{averageCalories} kcal</span>
            </div>
          </div>

          <div style={styles.chartBox}>
            <Line data={data} options={options} />
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  fullscreenBackground: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('https://i.pinimg.com/736x/61/0e/b7/610eb7c6cad94da29498f3fbb3ffd4ef.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 0",
    boxSizing: "border-box",
  },
  container: { width: '100%', maxWidth: '700px', padding: '0 20px', fontFamily: 'system-ui, sans-serif' },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.97)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', overflow: 'hidden' },
  bannerWrapper: { height: '95px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', padding: '0 30px' },
  title: { margin: '0 0 2px 0', color: '#ffffff', fontSize: '22px', fontWeight: '700' },
  subtitle: { margin: '0', color: '#9ca3af', fontSize: '13px' },
  
  netTrackerCard: { margin: "20px 30px 5px 30px", padding: "15px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  netHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  netTitle: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  netStatusPill: { fontSize: "11px", fontWeight: "700", color: "#ffffff", padding: "3px 8px", borderRadius: "20px" },
  progressTrack: { height: "10px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "5px", overflow: "hidden", marginBottom: "6px" },
  progressFill: { height: "100%", transition: "width 0.4s ease, background-color 0.3s ease" },
  netSummaryRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" },

  controlPanel: { padding: '15px 30px 0 30px' },
  toggleContainer: { display: 'flex', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px', width: 'fit-content' },
  toggleBtn: { padding: '6px 16px', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '6px', backgroundColor: 'transparent', color: '#4b5563', cursor: 'pointer' },
  activeBurnedToggle: { backgroundColor: '#005f56', color: '#ffffff' },
  activeEatenToggle: { backgroundColor: '#e0533c', color: '#ffffff' },
  statsGrid: { display: 'flex', gap: '16px', padding: '15px 30px 0 30px' },
  statBox: { flex: 1, padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
  statValue: { fontSize: '18px', fontWeight: '700', marginTop: '2px' },
  chartBox: { position: 'relative', height: '260px', width: '100%', padding: '15px 30px 25px 30px', boxSizing: 'border-box' }
};

export default Progress;
