import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import MazeRenderer from "./MazeRenderer";

const App = () => {
  const [message, setMessage] = useState('Waiting for message...');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [mazeData, setMazeData] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [collectedRewards, setCollectedRewards] = useState(0);

  useEffect(() => {
    // Try WebSocket connection first
    const client = mqtt.connect('ws://localhost:9001');  // Changed to WebSocket

    client.on('connect', () => {
      console.log(' Connected to MQTT broker');
      setConnectionStatus('Connected');

      client.subscribe('maze/data', (err) => {
        if (err) {
          console.error(' Failed to subscribe to maze/data:', err);
        } else {
          console.log(' Subscribed to maze/data topic');
        }
      });

      client.subscribe('arduino/position', (err) => {
        if (err) {
          console.error(' Failed to subscribe to arduino/position:', err);
        } else {
          console.log(' Subscribed to arduino/position topic');
        }
      });

      client.subscribe('maze/rewards', (err) => {
        if (err) {
          console.error(' Failed to subscribe to maze/rewards:', err);
        } else {
          console.log(' Subscribed to maze/rewards topic');
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
      } else if (topic === 'maze/rewards') {
        try {
          const rewardsCoords = JSON.parse(data);
          setRewards(rewardsCoords);
          setMessage(`Rewards Coordinates: ${rewardsCoords.length} rewards`);
        } catch (e) {
          setMessage(`Rewards Coordinates: ${data}`);
        }
      }
    });

    client.on('error', (error) => {
      console.error(' MQTT connection error:', error);
      setConnectionStatus('Error: ' + error.message);
    });

    client.on('offline', () => {
      console.log(' MQTT client is offline');
      setConnectionStatus('Offline');
    });

    client.on('reconnect', () => {
      console.log(' MQTT client reconnecting...');
      setConnectionStatus('Reconnecting...');
    });

    return () => {
      client.end();
    };
  }, []);

  // Check for reward collection when player position changes
  useEffect(() => {
    if (playerPosition && rewards.length > 0) {
      const playerGridX = Math.floor(playerPosition[0] / 25);
      const playerGridY = Math.floor(playerPosition[1] / 25);

      const collectedReward = rewards.find(reward =>
        reward[0] === playerGridX && reward[1] === playerGridY
      );

      if (collectedReward) {
        setRewards(prevRewards =>
          prevRewards.filter(reward =>
            !(reward[0] === collectedReward[0] && reward[1] === collectedReward[1])
          )
        );
        setCollectedRewards(prev => prev + 1);
        setMessage(`Reward collected at [${collectedReward[0]}, ${collectedReward[1]}]! Total collected: ${collectedRewards + 1}`);
      }
    }
  }, [playerPosition, rewards, collectedRewards]);

  return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1> MQTT Maze Game Monitor</h1>

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

        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {mazeData && (
              <div>
                <h3>Maze Information:</h3>
                <p>Total cells: {mazeData.length}</p>
                <p>First cell: x={mazeData[0]?.x}, y={mazeData[0]?.y}</p>
              </div>
          )}

          {playerPosition && (
              <div>
                <h3>Current Player Position:</h3>
                <p>X: {playerPosition[0]}, Y: {playerPosition[1]}</p>
                <p>Grid Position: X: {Math.floor(playerPosition[0] / 25)}, Y: {Math.floor(playerPosition[1] / 25)}</p>
              </div>
          )}

          <div>
            <h3> Rewards Status:</h3>
            <p>Remaining: {rewards.length}</p>
            <p>Collected: {collectedRewards}</p>
            <p>Total original: {rewards.length + collectedRewards}</p>
          </div>
        </div>

        {rewards.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Current Rewards Locations:</h3>
            <div style={{
              maxHeight: '100px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              {rewards.map((reward, index) => (
                <span key={index} style={{ marginRight: '15px', color: '#856404' }}>
                  [{reward[0]}, {reward[1]}]
                </span>
              ))}
            </div>
          </div>
        )}

        {mazeData && (
            <div>
              <h3> Maze Visualization</h3>
              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                <span style={{ color: '#ff6b6b', fontSize: '16px' }}>●</span> Player &nbsp;&nbsp;
                <span style={{ color: '#ffd700', fontSize: '16px' }}>●</span> Rewards &nbsp;&nbsp;
                <span style={{ color: '#000' }}>━</span> Walls
              </div>
              <MazeRenderer
                mazeData={mazeData}
                playerPosition={playerPosition}
                rewards={rewards}
              />
            </div>
        )}
      </div>
  );
};

export default App;