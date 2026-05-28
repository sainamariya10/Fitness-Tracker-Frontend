import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system logs
  const fetchLogs = async () => {
    try {
      const response = await API.get('/admin/logs');
      setLogs(response.data.systemUsage);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  // Block/Unblock user
  const toggleBlockUser = async (userId, currentStatus) => {
    try {
      const response = await API.put(`/admin/users/${userId}/block`);
      setUsers(users.map(u => u._id === userId ? response.data.user : u));
      alert(response.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setShowDeleteConfirm(false);
      alert('User deleted successfully');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* System Overview */}
      <div style={styles.overviewContainer}>
        <div style={styles.overviewCard}>
          <h3>📊 Total Workouts</h3>
          <p style={styles.overviewValue}>{logs?.totalWorkoutLogsAdded || 0}</p>
        </div>
        <div style={styles.overviewCard}>
          <h3>🍽️ Total Diet Logs</h3>
          <p style={styles.overviewValue}>{logs?.totalDietLogsAdded || 0}</p>
        </div>
        <div style={styles.overviewCard}>
          <h3>👥 Total Users</h3>
          <p style={styles.overviewValue}>{users.length}</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button onClick={() => { fetchUsers(); fetchLogs(); }} style={styles.refreshBtn}>
        🔄 Refresh Data
      </button>

      {/* Users Table */}
      <div style={styles.tableSection}>
        <h2 style={styles.sectionTitle}>👥 User Management</h2>

        {loading ? (
          <p style={styles.loadingText}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={styles.emptyText}>No users found</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableCell}>Name</th>
                  <th style={styles.tableCell}>Email</th>
                  <th style={styles.tableCell}>Age</th>
                  <th style={styles.tableCell}>Gender</th>
                  <th style={styles.tableCell}>Phone</th>
                  <th style={styles.tableCell}>Status</th>
                  <th style={styles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{user.name}</td>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>{user.age}</td>
                    <td style={styles.tableCell}>{user.gender}</td>
                    <td style={styles.tableCell}>{user.phone}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: user.isBlocked ? '#ff6b6b' : '#51cf66'
                      }}>
                        {user.isBlocked ? '🔒 Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => toggleBlockUser(user._id, user.isBlocked)}
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: user.isBlocked ? '#4ecdc4' : '#f39c12'
                        }}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteUserId(user._id);
                          setShowDeleteConfirm(true);
                        }}
                        style={{ ...styles.actionBtn, backgroundColor: '#e74c3c' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>⚠️ Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => deleteUser(deleteUserId)}
                style={{ ...styles.confirmBtn, backgroundColor: '#e74c3c' }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ ...styles.confirmBtn, backgroundColor: '#95a5a6' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: '#2c3e50',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
  },

  title: {
    margin: 0,
    fontSize: '32px',
  },

  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },

  errorBox: {
    backgroundColor: '#ffebee',
    border: '2px solid #e74c3c',
    color: '#c0392b',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },

  overviewContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },

  overviewCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    flex: 1,
    minWidth: '200px',
    textAlign: 'center',
  },

  overviewValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '10px 0 0 0',
  },

  refreshBtn: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '20px',
    transition: 'background-color 0.3s',
  },

  tableSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#2c3e50',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
  },

  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '16px',
  },

  emptyText: {
    textAlign: 'center',
    color: '#e74c3c',
    fontSize: '16px',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },

  tableHeader: {
    backgroundColor: '#34495e',
    color: 'white',
  },

  tableCell: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #ecf0f1',
  },

  tableRow: {
    transition: 'background-color 0.2s',
  },

  statusBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    display: 'inline-block',
  },

  actionBtn: {
    padding: '8px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '12px',
    transition: 'opacity 0.3s',
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    textAlign: 'center',
  },

  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },

  confirmBtn: {
    flex: 1,
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default AdminDashboard;
