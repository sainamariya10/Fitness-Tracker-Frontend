import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    workouts: [],
    dietLogs: [],
    netCalories: 0,
    goals: {},
    caloriesBurned: 0,
    caloriesConsumed: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No login token found. Please login again.');
        navigate('/');
        return;
      }

      console.log('🔄 Fetching dashboard data...');

      // ✅ FIXED: Removed /api prefix — baseURL in api.js already includes it
      const headers = { Authorization: `Bearer ${token}` };

      const summaryResponse  = await API.get('/dashboard', { headers });
      const workoutsResponse = await API.get('/workouts',  { headers });
      const dietResponse     = await API.get('/diet',      { headers });

      const summary  = summaryResponse?.data  || {};
      const workouts = workoutsResponse?.data || [];
      const dietLogs = dietResponse?.data     || [];

      const caloriesBurned   = summary?.todaySummary?.caloriesBurned  || 0;
      const caloriesConsumed = summary?.todaySummary?.caloriesConsumed || 0;
      const netCalories      = caloriesConsumed - caloriesBurned;

      setDashboardData({
        workouts:        Array.isArray(workouts) ? workouts : [],
        dietLogs:        Array.isArray(dietLogs) ? dietLogs : [],
        netCalories,
        goals:           summary?.goals || {},
        caloriesBurned,
        caloriesConsumed,
      });

      console.log('✅ Dashboard loaded');
    } catch (err) {
      console.error('Dashboard Error:', err);

      if (err.response?.status === 401) {
        setError('Session expired. Login again.');
        localStorage.clear();
        navigate('/');
      } else if (err.response?.status === 404) {
        setError('API route not found. Check backend route.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Backend server not running on port 5000.');
      } else {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const getNavItemStyle = (path) => {
    return location.pathname === path ? styles.navItemActive : styles.navItem;
  };

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/goals':    return '🎯 Fitness Goals';
      case '/workout':  return '💪 Workout Management Logs';
      case '/diet':     return '🥗 Diet & Nutritional Logs';
      case '/progress': return '📈 Performance Progress Analytics';
      case '/social':   return '👥 Social Sharing Network';
      case '/profile':  return '⚙️ Profile Settings Configuration';
      default:          return '📊 Activity Control Center Dashboard';
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Fitness Engine</h2>
        <ul style={styles.navList}>
          <li onClick={() => navigate('/dash')}     style={getNavItemStyle('/dash')}>📊 Dashboard</li>
          <li onClick={() => navigate('/goals')}    style={getNavItemStyle('/goals')}>🎯 Goals</li>
          <li onClick={() => navigate('/workout')}  style={getNavItemStyle('/workout')}>💪 Workouts</li>
          <li onClick={() => navigate('/diet')}     style={getNavItemStyle('/diet')}>🥗 Diet</li>
          <li onClick={() => navigate('/progress')} style={getNavItemStyle('/progress')}>📈 Progress</li>
          <li onClick={() => navigate('/social')}   style={getNavItemStyle('/social')}>👥 Social Sharing</li>
          <li onClick={() => navigate('/profile')}  style={getNavItemStyle('/profile')}>⚙️ Profile Settings</li>
        </ul>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </aside>

      <div style={styles.mainWrapper}>
        <header style={styles.topHeader}>
          <span>{getHeaderTitle()}</span>
        </header>

        <main style={styles.contentArea}>
          {location.pathname === '/dash' && (
            <div style={styles.dashboardSummarySection}>
              <h3 style={styles.sectionHeading}>Live Health Analytics Snapshot</h3>

              {error && (
                <div style={styles.errorBox}>
                  <div>⚠️ {error}</div>
                  <button onClick={fetchDashboardData} style={styles.retryBtn}>Retry</button>
                </div>
              )}

              {loading ? (
                <div style={styles.loadingBox}>⏳ Loading dashboard data...</div>
              ) : (
                <>
                  <div style={styles.activitiesGrid}>
                    <div style={styles.activityCard}>
                      <div style={styles.iconCircle}>💪</div>
                      <div>
                        <h4 style={styles.activityCardTitle}>Logged Exercises</h4>
                        <p style={styles.activityCardValue}>{dashboardData.workouts.length} Activities</p>
                      </div>
                    </div>

                    <div style={styles.activityCard}>
                      <div style={styles.iconCircle}>🥗</div>
                      <div>
                        <h4 style={styles.activityCardTitle}>Tracked Meals</h4>
                        <p style={styles.activityCardValue}>{dashboardData.dietLogs.length} Logged Items</p>
                      </div>
                    </div>

                    <div style={styles.activityCard}>
                      <div style={styles.iconCircle}>⚖️</div>
                      <div>
                        <h4 style={styles.activityCardTitle}>Net Calories Balance</h4>
                        <p style={{
                          ...styles.activityCardValue,
                          color: dashboardData.netCalories <= 0 ? '#10b981' : '#f43f5e'
                        }}>
                          {dashboardData.netCalories} kcal
                        </p>
                      </div>
                    </div>

                    <div style={styles.activityCard}>
                      <div style={styles.iconCircle}>🔥</div>
                      <div>
                        <h4 style={styles.activityCardTitle}>Burned Today</h4>
                        <p style={styles.activityCardValue}>{dashboardData.caloriesBurned} kcal</p>
                      </div>
                    </div>

                    <div style={styles.activityCard}>
                      <div style={styles.iconCircle}>🍕</div>
                      <div>
                        <h4 style={styles.activityCardTitle}>Consumed Today</h4>
                        <p style={styles.activityCardValue}>{dashboardData.caloriesConsumed} kcal</p>
                      </div>
                    </div>
                  </div>

                  <div style={styles.historyLogTableBox}>
                    <div style={styles.historyHeader}>
                      <h4 style={styles.subHeadingTitle}>📋 Recent Entries Stream</h4>
                      <button onClick={fetchDashboardData} style={styles.refreshBtn} title="Refresh data">🔄</button>
                    </div>

                    {dashboardData.workouts.length === 0 && dashboardData.dietLogs.length === 0 ? (
                      <p style={styles.emptyFeedText}>No activities found. Start logging your workouts and meals!</p>
                    ) : (
                      <div style={styles.feedStreamList}>
                        {dashboardData.workouts.slice(0, 3).map((w) => (
                          <div key={w._id} style={styles.feedItem}>
                            <span>💪 Workout: <strong>{w.exerciseType}</strong> ({w.duration} mins) - {w.caloriesBurned} kcal</span>
                            <span style={styles.feedItemTimestamp}>{new Date(w.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                        {dashboardData.dietLogs.slice(0, 3).map((d) => (
                          <div key={d._id} style={styles.feedItem}>
                            <span>🍎 Meal: <strong>{d.foodItem}</strong> ({d.mealType}) - {d.calories} kcal</span>
                            <span style={styles.feedItemTimestamp}>{new Date(d.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {dashboardData.goals && Object.keys(dashboardData.goals).length > 0 && (
                    <div style={styles.goalsBox}>
                      <h4 style={styles.subHeadingTitle}>🎯 Your Fitness Goals</h4>
                      <div style={styles.goalsGrid}>
                        <div style={styles.goalItem}>
                          <p style={styles.goalLabel}>Target Weight</p>
                          <p style={styles.goalValue}>{dashboardData.goals.weightTarget || 'Not set'} kg</p>
                        </div>
                        <div style={styles.goalItem}>
                          <p style={styles.goalLabel}>Daily Calorie Goal</p>
                          <p style={styles.goalValue}>{dashboardData.goals.dailyCalorieTarget || 'Not set'} kcal</p>
                        </div>
                        <div style={styles.goalItem}>
                          <p style={styles.goalLabel}>Step Count Goal</p>
                          <p style={styles.goalValue}>{dashboardData.goals.stepCountTarget || 'Not set'} steps</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: '#f1f5f9' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', color: '#ffffff', padding: '25px 15px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'fixed', height: '100vh', overflowY: 'auto' },
  logo: { fontSize: '22px', margin: '0 0 30px 0', textAlign: 'center', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.5px' },
  navList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  navItem: { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease' },
  navItemActive: { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', color: '#ffffff', backgroundColor: '#1e293b', fontSize: '14px', fontWeight: '600' },
  mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '260px' },
  topHeader: { height: '60px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', padding: '0 30px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '16px', color: '#1e293b' },
  contentArea: { padding: '30px', flex: 1, boxSizing: 'border-box', overflowY: 'auto' },
  logoutButton: { width: '100%', padding: '12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: 'auto', transition: 'background-color 0.2s' },
  dashboardSummarySection: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' },
  sectionHeading: { margin: '0', fontSize: '18px', fontWeight: '700', color: '#0f172a' },
  subHeadingTitle: { margin: '0', fontSize: '14px', color: '#475569', fontWeight: '600' },
  activitiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' },
  activityCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', transition: 'box-shadow 0.2s' },
  iconCircle: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid #e2e8f0', flexShrink: 0 },
  activityCardTitle: { margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  activityCardValue: { margin: '0', fontSize: '18px', fontWeight: '700', color: '#0f172a' },
  historyLogTableBox: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  emptyFeedText: { margin: '0', fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px 0' },
  feedStreamList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  feedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '13px', color: '#334155', borderLeft: '4px solid #38bdf8' },
  feedItemTimestamp: { fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' },
  errorBox: { backgroundColor: '#fee2e2', border: '2px solid #fca5a5', color: '#dc2626', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px' },
  retryBtn: { backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
  refreshBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', transition: 'transform 0.2s', padding: '4px 8px' },
  loadingBox: { backgroundColor: '#dbeafe', border: '2px solid #93c5fd', color: '#1e40af', padding: '15px', borderRadius: '8px', textAlign: 'center', fontSize: '14px' },
  goalsBox: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  goalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '12px' },
  goalItem: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' },
  goalLabel: { margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  goalValue: { margin: '0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }
};

export default Dashboard;