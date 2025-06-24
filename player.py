import pygame

class Player:
    def __init__(self, x, y, size=10):
        # x,y are the top‐left corner of the square
        self.x, self.y       = x, y
        self.player_size     = size
        self.color           = (250, 120, 60)
        self.velX            = 0
        self.velY            = 0
        self.left_pressed    = False
        self.right_pressed   = False
        self.up_pressed      = False
        self.down_pressed    = False
        self.speed           = 8
        self.rewards         = 0

    def get_current_cell(self, x, y, grid_cells):
        for cell in grid_cells:
            if cell.x == x and cell.y == y:
                return cell
        print(f"⚠️ Warning: No matching cell at ({x}, {y})")
        return None

    def check_move(self, tile, grid_cells, thickness):
        current_cell_x = self.x // tile
        current_cell_y = self.y // tile
        current_cell   = self.get_current_cell(current_cell_x,
                                               current_cell_y,
                                               grid_cells)
        if not current_cell:
            self.left_pressed = self.right_pressed = False
            self.up_pressed   = self.down_pressed  = False
            return

        abs_x = current_cell_x * tile
        abs_y = current_cell_y * tile

        if self.left_pressed and current_cell.walls['left'] and self.x <= abs_x + thickness:
            self.left_pressed = False
        if self.right_pressed and current_cell.walls['right'] and \
           self.x >= abs_x + tile - (self.player_size + thickness):
            self.right_pressed = False
        if self.up_pressed and current_cell.walls['top'] and self.y <= abs_y + thickness:
            self.up_pressed = False
        if self.down_pressed and current_cell.walls['bottom'] and \
           self.y >= abs_y + tile - (self.player_size + thickness):
            self.down_pressed = False

    def draw(self, screen):
        hs = self.player_size // 2
        rect = pygame.Rect(int(self.x - hs),
                           int(self.y - hs),
                           self.player_size,
                           self.player_size)
        pygame.draw.rect(screen, self.color, rect)

    def update(self):
        self.velX = 0
        self.velY = 0
        if self.left_pressed  and not self.right_pressed: self.velX = -self.speed
        if self.right_pressed and not self.left_pressed:  self.velX =  self.speed
        if self.up_pressed    and not self.down_pressed:  self.velY = -self.speed
        if self.down_pressed  and not self.up_pressed:    self.velY =  self.speed

        self.x += self.velX
        self.y += self.velY

        # clamp to screen (adjust 602 if your maze size changes)
        max_coord = 602 - self.player_size
        self.x = max(0, min(self.x, max_coord))
        self.y = max(0, min(self.y, max_coord))
