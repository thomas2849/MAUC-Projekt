import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import MazeRenderer from "./MazeRenderer";

const App = () => {
  const [message, setMessage] = useState('Waiting for message...');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [mazeData, setMazeData] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001');

    client.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      setConnectionStatus('Connected');

      client.subscribe('maze/data');
      client.subscribe('arduino/position');
      client.subscribe('maze/rewards');
    });

    client.on('message', (topic, payload) => {
      const data = payload.toString();
      console.log(`📨 Received on ${topic}:`, data);

      try {
        if (topic === 'maze/data') {
          const parsedMaze = JSON.parse(data);
          setMazeData(parsedMaze);
          setMessage(`Maze Data Received: ${parsedMaze.length} cells`);
        } else if (topic === 'arduino/position') {
          const position = JSON.parse(data);
          setPlayerPosition(position);
          setMessage(`Player Position: [${position[0]}, ${position[1]}]`);
        }else if (topic === 'maze/rewards') {
            const rawCoords = JSON.parse(data);
            const rewardCoords = rawCoords.map(([x, y]) => ({ x, y }));
            setRewards(rewardCoords);
            setMessage(`Rewards Coordinates: ${rewardCoords.length} rewards`);
          }

      } catch (e) {
        console.error("❌ Error parsing data:", e);
        setMessage(`Raw Data: ${data}`);
      }
    });

    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
      setConnectionStatus('Error: ' + error.message);
    });

    client.on('offline', () => setConnectionStatus('Offline'));
    client.on('reconnect', () => setConnectionStatus('Reconnecting...'));

    return () => client.end();
  }, []);

  // Remove reward if player reaches it
  useEffect(() => {
    if (!playerPosition || !rewards || rewards.length === 0) return;

    const playerGridX = Math.floor(playerPosition[0] / 25);
    const playerGridY = Math.floor(playerPosition[1] / 25);

    const updatedRewards = rewards.filter(
      reward => reward.x !== playerGridX || reward.y !== playerGridY
    );

    if (updatedRewards.length !== rewards.length) {
      setRewards(updatedRewards);
      setMessage(prev => prev + " 🎉 Reward collected!");
    }
  }, [playerPosition, rewards]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 MQTT Maze Game Monitor</h1>

      <div style={{
        padding: '10px',
        marginBottom: '20px',
        backgroundColor: connectionStatus === 'Connected' ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connectionStatus === 'Connected' ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px'
      }}>
        <strong>Connection Status:</strong> {connectionStatus}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Latest Message:</h3>
        <p style={{
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          fontFamily: 'monospace'
        }}>
          {message}
        </p>
      </div>

      {mazeData && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Maze Information:</h3>
          <p>Total cells: {mazeData.length}</p>
          <p>First cell: x={mazeData[0]?.x}, y={mazeData[0]?.y}</p>
        </div>
      )}

      {playerPosition && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Current Player Position:</h3>
          <p>X: {playerPosition[0]}, Y: {playerPosition[1]}</p>
          <p>Grid Position: X: {Math.floor(playerPosition[0] / 25)}, Y: {Math.floor(playerPosition[1] / 25)}</p>
        </div>
      )}

      {mazeData && (
        <div>
          <h1>Maze</h1>
          <MazeRenderer
            mazeData={mazeData}
            playerPosition={playerPosition}
            rewards={rewards}
          />
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '30px' }}>
        <p>🔧 Troubleshooting:</p>
        <ul>
          <li>MQTT broker must support WebSocket (port 9001)</li>
          <li>Ensure Python game is publishing to `maze/data`, `arduino/position`, and `maze/rewards`</li>
          <li>Check browser console for debug logs</li>
        </ul>
      </div>
    </div>
  );
};

export default App;
