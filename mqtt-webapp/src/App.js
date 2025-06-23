import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import MazeRenderer from "./MazeRenderer";

const App = () => {
  const [message, setMessage] = useState('Waiting for message...');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [mazeData, setMazeData] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);

  useEffect(() => {
    // Try WebSocket connection first
    const client = mqtt.connect('ws://localhost:9001');  // Changed to WebSocket

    client.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      setConnectionStatus('Connected');

      client.subscribe('maze/data', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to maze/data:', err);
        } else {
          console.log('✅ Subscribed to maze/data topic');
        }
      });

      client.subscribe('arduino/position', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to arduino/position:', err);
        } else {
          console.log('✅ Subscribed to arduino/position topic');
        }
      });
    });

    client.on('message', (topic, payload) => {
      const data = payload.toString();
      console.log(`📨 Received message on ${topic}:`, data);

      if (topic === 'maze/data') {
        try {
          const parsedMaze = JSON.parse(data);
          setMazeData(parsedMaze);
          setMessage(`Maze Data Received: ${parsedMaze.length} cells`);
        } catch (e) {
          setMessage(`Maze Data: ${data}`);
        }
      } else if (topic === 'arduino/position') {
        try {
          const position = JSON.parse(data);
          setPlayerPosition(position);
          setMessage(`Player Position: [${position[0]}, ${position[1]}]`);
        } catch (e) {
          setMessage(`Player Position: ${data}`);
        }
      }
    });

    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
      setConnectionStatus('Error: ' + error.message);
    });

    client.on('offline', () => {
      console.log('📴 MQTT client is offline');
      setConnectionStatus('Offline');
    });

    client.on('reconnect', () => {
      console.log('🔄 MQTT client reconnecting...');
      setConnectionStatus('Reconnecting...');
    });

    return () => {
      client.end();
    };
  }, []);

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
              <MazeRenderer mazeData={mazeData} playerPosition={playerPosition}/>
            </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', marginTop: '30px' }}>
          <p>🔧 Troubleshooting:</p>
          <ul>
            <li>Make sure your MQTT broker supports WebSockets on port 9001</li>
            <li>Check that your Python maze game is running and publishing data</li>
            <li>Look at the browser console for detailed connection logs</li>
          </ul>
        </div>
      </div>
  );
};


export default App;