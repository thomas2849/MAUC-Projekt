import React from "react";
import "./Maze.css";

const CELL_SIZE = 30;

const MazeRenderer = ({ mazeData, playerPosition, rewards }) => {
  // Maze dimensions in cells
  const maxX = Math.max(...mazeData.map(c => c.x)) + 1;
  const maxY = Math.max(...mazeData.map(c => c.y)) + 1;

  // Convert raw [px,py] → grid cell indices
  const gridPlayer = playerPosition
    ? {
        x: Math.floor(playerPosition[0] / CELL_SIZE),
        y: Math.floor(playerPosition[1] / CELL_SIZE),
      }
    : null;

  return (
    <div
      className="maze-container"
      style={{
        position: "relative",
        width:  maxX * CELL_SIZE,
        height: maxY * CELL_SIZE,
        backgroundColor: "#222",
      }}
    >
      {mazeData.map((cell, i) => {
        const px = cell.x * CELL_SIZE;
        const py = cell.y * CELL_SIZE;
        const isPlayer = gridPlayer
          && cell.x === gridPlayer.x
          && cell.y === gridPlayer.y;
        const hasReward = rewards?.some(r => r.x === cell.x && r.y === cell.y);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left:   px,
              top:    py,
              width:  CELL_SIZE,
              height: CELL_SIZE,
              boxSizing: "border-box",
              borderTop:    cell.walls.top    ? "2px solid #fff" : "2px solid transparent",
              borderRight:  cell.walls.right  ? "2px solid #fff" : "2px solid transparent",
              borderBottom: cell.walls.bottom ? "2px solid #fff" : "2px solid transparent",
              borderLeft:   cell.walls.left   ? "2px solid #fff" : "2px solid transparent",
              backgroundColor: isPlayer ? "#c00" : "transparent",
            }}
          >
            {/* Player dot */}
            {isPlayer && (
              <div style={{
                position: "absolute",
                top:    "50%",
                left:   "50%",
                transform: "translate(-50%, -50%)",
                width:  12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#fff",
                border: "2px solid #333",
                zIndex: 2,
              }}/>
            )}

            {/* Reward dot */}
            {!isPlayer && hasReward && (
              <div style={{
                position: "absolute",
                top:    "50%",
                left:   "50%",
                transform: "translate(-50%, -50%)",
                width:  10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "gold",
                border: "1px solid #888",
                zIndex: 1,
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MazeRenderer;
