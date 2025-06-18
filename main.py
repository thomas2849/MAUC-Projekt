# https://thepythoncode.com/article/build-a-maze-game-in-python


import pygame, sys
from maze import Maze
from player import Player
from game import Game
from clock import Clock
from reward import Reward
import random
import time
import json
import paho.mqtt.client as mqtt

pygame.init()
pygame.font.init()

class Main():
    def __init__(self, screen):
        self.screen = screen
        self.font = pygame.font.SysFont("impact", 30)
        self.message_color = pygame.Color("cyan")
        self.running = True
        self.game_over = False
        self.FPS = pygame.time.Clock()
        self.mqtt = mqtt.Client()
        self.coords = []


    def instructions(self, player):
        instructions1 = self.font.render('Use', True, self.message_color)
        instructions2 = self.font.render('Arrow Keys', True, self.message_color)
        instructions3 = self.font.render('to Move', True, self.message_color)
        string = f"{player.rewards}"
        instructions4 = self.font.render(string, True, self.message_color)
        self.screen.blit(instructions1, (655, 300))
        self.screen.blit(instructions2, (610, 331))
        self.screen.blit(instructions3, (630, 362))
        self.screen.blit(instructions4, (650, 394))


#testing
    def _draw(self, maze, tile, player, game, clock, coords):
        # draw maze
        [cell.draw(self.screen, tile) for cell in maze.grid_cells]
        maze.add_rewards(screen, tile, coords, player)
        # add a goal point to reach
        game.add_goal_point(self.screen)
        # draw every player movement
        player.draw(self.screen)

        player.update()
        # instructions, clock, winning message
        self.instructions(player)
        if self.game_over:
            clock.stop_timer()
            self.screen.blit(game.message(), (610, 120))
        else:
            clock.update_timer()
        self.screen.blit(clock.display_timer(), (625, 200))
        pygame.display.flip()

    def generate_random_coordinates(self, maze):
        coordinates = []
        for i in range(15):
            cell = random.choice(maze.grid_cells)
            coordinates.append(cell)

        return coordinates
    def check_reward(self, player, tile):
        for i in range(len(self.coords)-1):
            try:
                if (self.coords[i].x*tile)-15 <= player.x <= (self.coords[i].x*tile)+15 and (self.coords[i].y*tile)-15 <= player.y <= (self.coords[i].y*tile)+15:
                    print("updated")
                    self.coords.remove(self.coords[i])
                    player.rewards += 1
            except Exception as e:
                print(e)
                print(i)
                print(len(self.coords))



    def main(self, frame_size, tile):
        try:
            self.mqtt.connect("localhost", 1883, 60)
            print("✅ Connected to MQTT broker at localhost:1883")
        except Exception as e:
            print(f"❌ Could not connect to MQTT broker: {e}")
            exit(1)
        cols, rows = frame_size[0] // tile, frame_size[-1] // tile
        maze = Maze(cols, rows)
        game = Game(maze.grid_cells[-1], tile)
        player = Player(tile // 3, tile // 3)
        clock = Clock()
        maze.generate_maze()
        maze_data = []
        for cell in maze.grid_cells:
            maze_data.append({
                "x": cell.x,
                "y": cell.y,
                "walls": cell.walls
            })
        self.mqtt.publish("maze/data", json.dumps(maze_data))
        print("→ Published to MQTT:", json.dumps(maze_data))
        clock.start_timer()
        self.coords = self.generate_random_coordinates(maze)
        while self.running:
            self.screen.fill("gray")
            self.screen.fill(pygame.Color("darkslategray"), (603, 0, 752, 752))
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

            # if keys were pressed still
            if event.type == pygame.MOUSEMOTION:
                if not self.game_over:
                    mouse_x, mouse_y = event.pos
                    player.left_pressed = player.right_pressed = False
                    player.up_pressed = player.down_pressed = False

                    if mouse_x < player.x:
                        player.left_pressed = True
                    elif mouse_x > player.x:
                        player.right_pressed = True
                    if mouse_y < player.y:
                        player.up_pressed = True
                    elif mouse_y > player.y:
                        player.down_pressed = True

                    player.check_move(tile, maze.grid_cells, maze.thickness)
                    self.mqtt.publish("arduino/position", json.dumps([player.x, player.y]))


            if game.is_game_over(player):
                self.game_over = True
                player.left_pressed = False
                player.right_pressed = False
                player.up_pressed = False
                player.down_pressed = False

            self._draw(maze, tile, player, game, clock, self.coords)
            self.check_reward(player, tile)
            self.FPS.tick(60)


if __name__ == "__main__":
    window_size = (602, 602)
    screen = (window_size[0] + 150, window_size[-1])
    tile_size = 30
    screen = pygame.display.set_mode(screen)
    pygame.display.set_caption("Maze")

    game = Main(screen)
    game.main(window_size, tile_size)
