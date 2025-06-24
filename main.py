import sys
import json
import random
import pygame
import paho.mqtt.client as mqtt

from maze   import Maze
from player import Player
from game   import Game
from clock  import Clock
from reward import Reward

class Main:
    def __init__(self, screen, tile):
        self.screen        = screen
        self.tile          = tile
        self.font          = pygame.font.SysFont("impact", 30)
        self.message_color = pygame.Color("cyan")
        self.running       = True
        self.game_over     = False
        self.FPS           = pygame.time.Clock()
        self.mqtt          = mqtt.Client()
        self.coords        = []

    def reset_game(self):
        # 1) Clear the flag and restart your timer
        self.game_over = False
        self.clock.start_timer()

        # 2) Re-create the maze object (fresh walls/visited)
        self.maze = Maze(self.cols, self.rows)
        self.maze.generate_maze()
        self.maze.add_random_loops((self.cols * self.rows) // 10)

        # 3) Re-create the Game instance (new goal_cell)
        self.game = Game(self.maze.grid_cells[-1], self.tile)

        # 4) Reset the player’s reward count
        self.player.rewards = 0

        # 5) New reward positions
        self.coords = self.generate_random_coordinates()

        # 6) Reset the current cell & move the player back to start
        self.current_cell = self.maze.grid_cells[0]
        corridor = self.tile - 2 * self.maze.thickness
        start = corridor // 2 + self.maze.thickness
        self.player.x = start
        self.player.y = start

        # 7) Publish the brand-new maze for your Arduino
        maze_data = [
            {"x": c.x, "y": c.y, "walls": c.walls}
            for c in self.maze.grid_cells
        ]
        self.mqtt.publish("maze/data", json.dumps(maze_data))

        print("🔄 Game reset!")

    def generate_random_coordinates(self):
        return [random.choice(self.maze.grid_cells) for _ in range(15)]

    def _draw(self):
        sw, sh  = self.screen.get_size()
        maze_w  = self.maze_w
        panel_w = self.panel_w

        # Clear whole window
        self.screen.fill("black")

        # Maze background
        pygame.draw.rect(self.screen, "darkslategray",
                         (0, 0, maze_w, sh))

        # Draw maze, rewards, goal, player
        for cell in self.maze.grid_cells:
            cell.draw(self.screen, self.tile)
        self.maze.add_rewards(self.screen, self.tile, self.coords, self.player)
        self.game.add_goal_point(self.screen)
        self.player.draw(self.screen)

        # Overlay “You Win!!” + “Press R to Restart”
        if self.game_over:
            win_surf = self.game.message()
            rx = (maze_w - win_surf.get_width())  // 2
            ry = (sh     - win_surf.get_height()) // 2 - 20
            self.screen.blit(win_surf, (rx, ry))

            restart_surf = self.font.render(
                "Press R to Restart", True, pygame.Color("white"))
            sx = (maze_w - restart_surf.get_width()) // 2
            sy = ry + win_surf.get_height() + 10
            self.screen.blit(restart_surf, (sx, sy))

        # HUD panel
        pygame.draw.rect(self.screen, "gray20",
                         (maze_w, 0, panel_w, sh))

        # Tick or stop the timer
        if not self.game_over:
            self.clock.update_timer()
        else:
            self.clock.stop_timer()

        # Timer display
        timer_surf = self.clock.display_timer()
        self.screen.blit(timer_surf, (maze_w + 20, 50))

        # Reward count
        reward_surf = self.font.render(
            f"Rewards: {self.player.rewards}", True, self.message_color)
        self.screen.blit(reward_surf, (maze_w + 20, 100))

        pygame.display.flip()

    def check_reward(self, player, tile):
        for i, cell in enumerate(self.coords):
            cx, cy = cell.x * tile, cell.y * tile
            if cx - 15 <= player.x <= cx + 15 and cy - 15 <= player.y <= cy + 15:
                self.coords.pop(i)
                player.rewards += 1
                return

    def main(self):
        # MQTT setup
        self.mqtt.connect("localhost", 1883, 60)
        self.mqtt.subscribe("game/reset")
        self.mqtt.on_message = lambda c, u, m: self.reset_game()

        # Layout: maze on left, HUD on right
        sw, sh       = self.screen.get_size()
        self.panel_w = 150
        self.maze_w  = sw - self.panel_w
        self.cols    = self.maze_w // self.tile
        self.rows    = sh // self.tile

        # Instantiate everything
        self.maze   = Maze(self.cols, self.rows)
        self.game   = Game(self.maze.grid_cells[-1], self.tile)
        self.clock  = Clock()

        # Generate & loopify
        self.maze.generate_maze()
        self.maze.add_random_loops((self.cols * self.rows) // 10)

        # Player in cell (0,0), sized to corridor
        corridor    = self.tile - 2 * self.maze.thickness
        start       = corridor // 2 + self.maze.thickness
        self.player = Player(start, start, size=corridor)
        self.current_cell = self.maze.grid_cells[0]

        # Publish maze data
        maze_data = [{"x": c.x, "y": c.y, "walls": c.walls}
                     for c in self.maze.grid_cells]
        self.mqtt.publish("maze/data", json.dumps(maze_data))

        # Start timer & rewards
        self.clock.start_timer()
        self.coords = self.generate_random_coordinates()

        # Main loop
        while self.running:
            for event in pygame.event.get():
                # 1) Quit on window-close
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

                # 2) Reset / Quit on keypress—always checked, mid-game or not
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_r:
                        print("🔄 Resetting game…")  # debug: should appear whenever you hit R
                        self.reset_game()
                    elif event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()

                # 3) Mouse movement only when game not over
                if event.type == pygame.MOUSEMOTION and not self.game_over:
                    mx, my = event.pos
                    if mx < self.maze_w:
                        tx, ty = mx // self.tile, my // self.tile
                        cx, cy = self.current_cell.x, self.current_cell.y
                        dx, dy = tx - cx, ty - cy

                        if abs(dx) + abs(dy) == 1:
                            good = False
                            if dx == 1 and not self.current_cell.walls['right']:
                                good = True
                            if dx == -1 and not self.current_cell.walls['left']:
                                good = True
                            if dy == 1 and not self.current_cell.walls['bottom']:
                                good = True
                            if dy == -1 and not self.current_cell.walls['top']:
                                good = True

                            if good:
                                self.current_cell = next(
                                    c for c in self.maze.grid_cells
                                    if c.x == tx and c.y == ty
                                )
                                self.player.x = tx * self.tile + self.tile // 2
                                self.player.y = ty * self.tile + self.tile // 2
                                self.mqtt.publish(
                                    "arduino/position",
                                    json.dumps([self.player.x, self.player.y])
                                )

                # 4) Check win after processing input
                if self.game.is_game_over(self.player):
                    self.game_over = True

            # 5) Draw + rewards + frame-cap
            self._draw()
            self.check_reward(self.player, self.tile)
            self.FPS.tick(60)


if __name__ == "__main__":
    pygame.init()
    pygame.font.init()
    screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
    pygame.display.set_caption("Maze")
    Main(screen, tile=30).main()
