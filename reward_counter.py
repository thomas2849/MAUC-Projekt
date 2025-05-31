import pygame

class RewardCounter:
    def __init__(self):
        self.font = pygame.font.SysFont('monospace', 30)
        self.color = pygame.Color('blue')
        self.count =0

    def update(self):
        self.count += 1

    def display(self):
        my_count = self.font.render('Reward Count: %d' % self.count, True, self.color)
        return my_count

