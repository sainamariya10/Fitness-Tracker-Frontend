import React, { useState, useEffect } from 'react';
import API from '../api';

export default function ConnectionTest() {
  const [status, setStatus] = useState('Testing...');
  const [color, setColor] = useState('blue');

  useEffect(() => {
    // Test connection to backend
    API.get('/data')
      .then(res => {
        setStatus('✅ Connected: ' + res.data.message);
        setColor('green');
      })
      .catch(err => {
        setStatus('❌ Error: ' + err.message);
        setColor('red');
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontSize: '18px', color }}>
      <h2>Backend Connection Status</h2>
      <p>{status}</p>
    </div>
  );
}