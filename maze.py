import pygame
import random
from cell import Cell
from reward import Reward
import numpy as np

class Maze:
    def __init__(self, cols, rows):
        self.cols = cols
        self.rows = rows
        self.thickness = 4
        self.grid_cells = [Cell(col, row, self.thickness) for row in range(self.rows) for col in range(self.cols)]

    # carve grid cell walls
    def remove_walls(self, current, next):
        dx = current.x - next.x
        if dx == 1:
            current.walls['left'] = False
            next.walls['right'] = False
        elif dx == -1:
            current.walls['right'] = False
            next.walls['left'] = False
        dy = current.y - next.y
        if dy == 1:
            current.walls['top'] = False
            next.walls['bottom'] = False
        elif dy == -1:
            current.walls['bottom'] = False
            next.walls['top'] = False

    def add_random_loops(self, count):
        """
        Randomly knock down `count` walls to introduce loops.
        """
        for _ in range(count):
            cell = random.choice(self.grid_cells)
            # pick a random neighbor that *has* a wall between them
            dirs = {
                'top': (0, -1, 'top', 'bottom'),
                'bottom': (0, 1, 'bottom', 'top'),
                'left': (-1, 0, 'left', 'right'),
                'right': (1, 0, 'right', 'left'),
            }
            choices = []
            for d, (dx, dy, wall, opp) in dirs.items():
                nx, ny = cell.x + dx, cell.y + dy
                neighbour = next((c for c in self.grid_cells if c.x == nx and c.y == ny), None)
                if neighbour and cell.walls[wall]:
                    choices.append((wall, opp, neighbour))
            if choices:
                wall, opp, nb = random.choice(choices)
                cell.walls[wall] = False
                nb.walls[opp] = False



    def add_rewards(self, screen, tile, coords, player):
        for i in range(len(coords)):
            reward = Reward(coords[i].x*tile, coords[i].y*tile)
            reward.draw(screen)


    def generate_maze(self):
        current_cell = self.grid_cells[0]
        array = []
        break_count = 1

        while break_count != len(self.grid_cells):
            current_cell.visited = True
            next_cell = current_cell.check_neighbors(self.cols, self.rows, self.grid_cells)
            if next_cell:
                next_cell.visited = True
                break_count += 1
                array.append(current_cell)
                self.remove_walls(current_cell, next_cell)
                current_cell = next_cell
            elif array:
                current_cell = array.pop()

        return self.grid_cells