import React from "react";
import "./Maze.css"; // Import CSS for wall styles

const CELL_SIZE = 25; // in pixels

const MazeRenderer = ({ mazeData, playerPosition }) => {
  const maxX = Math.max(...mazeData.map(cell => cell.x)) + 1;
  const maxY = Math.max(...mazeData.map(cell => cell.y)) + 1;

  return (
    <div
      className="maze-container"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${maxX}, 25px)`,
        gridTemplateRows: `repeat(${maxY}, 25px)`
      }}
    >
      {mazeData.map((cell, index) => {
        const isPlayerHere = cell.x === playerPosition.x && cell.y === playerPosition.y;
        const { top, right, bottom, left } = cell.walls;

        return (
          <div
            key={index}
            className="maze-cell"
            style={{
              borderTop: top ? "2px solid black" : "2px solid transparent",
              borderRight: right ? "2px solid black" : "2px solid transparent",
              borderBottom: bottom ? "2px solid black" : "2px solid transparent",
              borderLeft: left ? "2px solid black" : "2px solid transparent",
              backgroundColor: isPlayerHere ? "red" : "white",
              width: "25px",
              height: "25px",
              boxSizing: "border-box",
            }}
          ></div>
        );
      })}
    </div>
  );
};


export default MazeRenderer;
