import React from "react";
import "./Maze.css"; // Import CSS for wall styles

const CELL_SIZE = 25; // in pixels

const MazeRenderer = ({ mazeData, playerPosition, rewards }) => {
    const maxX = Math.max(...mazeData.map(cell => cell.x)) + 1;
    const maxY = Math.max(...mazeData.map(cell => cell.y)) + 1;

    // Convert player position from coordinates to grid position
    const getGridPosition = (position) => {
        if (!position || position.length < 2) return null;

        const gridX = Math.floor(position[0] / CELL_SIZE);
        const gridY = Math.floor(position[1] / CELL_SIZE);

        // Only log when position changes
        const positionKey = `${gridX},${gridY}`;
        if (window.lastLoggedPosition !== positionKey) {
            console.log(`Player moved to grid [${gridX}, ${gridY}] from pixels [${position[0]}, ${position[1]}]`);
            window.lastLoggedPosition = positionKey;
        }

        // Clamp to valid bounds
        const clampedX = Math.max(0, Math.min(gridX, maxX - 1));
        const clampedY = Math.max(0, Math.min(gridY, maxY - 1));

        return { x: clampedX, y: clampedY };
    };

    const gridPlayerPosition = getGridPosition(playerPosition);

    // Check if a cell has a reward
    const hasReward = (x, y) => {
        return rewards && rewards.some(reward => reward[0] === x && reward[1] === y);
    };

    // Debug logging - simplified
    if (gridPlayerPosition) {
        console.log(`Current grid position: [${gridPlayerPosition.x}, ${gridPlayerPosition.y}]`);
    }

    return (
        <div
            className="maze-container"
            style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: `repeat(${maxX}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${maxY}, ${CELL_SIZE}px)`,
                border: "2px solid #333",
                backgroundColor: "#f9f9f9"
            }}
        >
            {mazeData.map((cell, index) => {
                const { top, right, bottom, left } = cell.walls;
                const isPlayerCell = gridPlayerPosition &&
                    cell.x === gridPlayerPosition.x &&
                    cell.y === gridPlayerPosition.y;
                const cellHasReward = hasReward(cell.x, cell.y);

                // Debug: Only log when we find the player cell


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
                            backgroundColor: isPlayerCell ? "#ffe6e6" : "white",
                            position: "relative",
                        }}
                    >
                        {/* Render reward if present and not collected */}
                        {cellHasReward && !isPlayerCell && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "10px",
                                    height: "10px",
                                    backgroundColor: "#ffd700",
                                    borderRadius: "50%",
                                    border: "2px solid #ffaa00",
                                    zIndex: 5,
                                    boxShadow: "0 0 6px rgba(255, 215, 0, 0.8)",
                                }}
                            />
                        )}

                        {/* Render player if present */}
                        {isPlayerCell && (
                            <>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: "16px",
                                        height: "16px",
                                        backgroundColor: "#ff4444",
                                        borderRadius: "50%",
                                        border: "3px solid #fff",
                                        zIndex: 10,
                                        boxShadow: "0 0 8px rgba(255, 68, 68, 0.6)",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        border: "3px solid #00ff00",
                                        zIndex: 12,
                                        pointerEvents: "none"
                                    }}
                                />
                            </>
                        )}









                    </div>
                );
            })}
        </div>
    );
};

export default MazeRenderer;