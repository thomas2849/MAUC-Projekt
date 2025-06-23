import React from "react";
import "./Maze.css"; // Import CSS for wall styles

const CELL_SIZE = 25; // in pixels

const MazeRenderer = ({ mazeData, playerPosition }) => {
    const maxX = Math.max(...mazeData.map(cell => cell.x)) + 1;
    const maxY = Math.max(...mazeData.map(cell => cell.y)) + 1;

    // Convert player position from coordinates to grid position
    const getGridPosition = (position) => {
        if (!position || position.length < 2) return null;

        // Assuming the position coordinates need to be mapped to grid cells
        // You might need to adjust this conversion based on your coordinate system
        const gridX = Math.floor(position[0] / CELL_SIZE);
        const gridY = Math.floor(position[1] / CELL_SIZE);

        // Ensure the position is within bounds
        if (gridX >= 0 && gridX < maxX && gridY >= 0 && gridY < maxY) {
            return { x: gridX, y: gridY };
        }
        return null;
    };

    const gridPlayerPosition = getGridPosition(playerPosition);

    return (
        <div
            className="maze-container"
            style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: `repeat(${maxX}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${maxY}, ${CELL_SIZE}px)`,
            }}
        >
            {mazeData.map((cell, index) => {
                const { top, right, bottom, left } = cell.walls;
                const isPlayerCell = gridPlayerPosition &&
                    cell.x === gridPlayerPosition.x &&
                    cell.y === gridPlayerPosition.y;

                return (
                    <div
                        key={index}
                        className={`maze-cell ${isPlayerCell ? 'player-cell' : ''}`}
                        style={{
                            borderTop: top ? "2px solid black" : "2px solid transparent",
                            borderRight: right ? "2px solid black" : "2px solid transparent",
                            borderBottom: bottom ? "2px solid black" : "2px solid transparent",
                            borderLeft: left ? "2px solid black" : "2px solid transparent",
                            width: `${CELL_SIZE}px`,
                            height: `${CELL_SIZE}px`,
                            boxSizing: "border-box",
                            backgroundColor: isPlayerCell ? "#ff6b6b" : "transparent",
                            position: "relative",
                        }}
                    >
                        {isPlayerCell && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "#fff",
                                    borderRadius: "50%",
                                    border: "2px solid #333",
                                    zIndex: 10,
                                }}
                            />
                        )}
                    </div>
                );
            })}


        </div>
    );
};

export default MazeRenderer;