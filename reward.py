import pygame
from random import random

class Reward:
    def __init__(self,x,y):
        self.x, self.y = x, y
        self.color = (250, 120, 60)
        self.acquired = False


    def draw(self, screen):
        pygame.draw.rect(screen, 'blue', pygame.Rect(self.x, self.y, 15, 15))


