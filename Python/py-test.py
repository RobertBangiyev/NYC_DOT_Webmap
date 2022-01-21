import pygame
import keyboard
from sprites import *
from config import *
 
import sys
class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIN_WIDTH,WIN_HEIGHT))
        self.clock = pygame.time.Clock()
        #self.font= pygame.font.Font('Arial',32)
        self.running = True
        pygame.mixer.init()
        pygame.mixer.music.load("Heartbreaking (1).mp3")
        pygame.mixer.music.play(-1,0.0)
        

        self.character_spritesheet= Spritesheet("Images/mc1.png")
        self.terrain_spritesheet = Spritesheet("Images/Indoortilesets/Interiors 2_768x768_TILESETS_B_C_D_E.png")
        self.terrain2_spritesheet= Spritesheet("Images/Indoortilesets/Floors_2_TILESET_A2_.png")
        self.terrain3_spritesheet= Spritesheet("Images/Indoortilesets/Classroom_and_Library_01.png")

        
    def new(self):
        # a new game starts
        self.playing = True

        self.all_sprites = pygame.sprite.LayeredUpdates()
        self.blocks = pygame.sprite.LayeredUpdates()
        self.doors = pygame.sprite.LayeredUpdates()
        self.enemies = pygame.sprite.LayeredUpdates()
        self.attacks = pygame.sprite.LayeredUpdates()
       
        #self.player=Player(self,1,2)
        self.createTilemap()
    def update(self):
        self.all_sprites.update()
    def events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.playing = False
                self.running = False

    def draw(self):
        self.screen.fill(BLACK)
        self.all_sprites.draw(self.screen)
        self.clock.tick(FPS)
        pygame.display.update()

    def main(self):
        #game loop
        while self.playing:
            self.events()
            self.update()
            self.draw()
        self.running = False
    def createTilemap(self):
        for i, row in enumerate(tilemap):
            for j,column in enumerate(row):
                Ground(self,j,i)
                if column =='B':
                    Block(self,j,i)
                if column == 'P':
                    Player(self,j,i)
                if column =='C':
                    Block_2(self,j,i)
                if column =='T':
                    Block_3(self,j,i)
    def game_over(self):
        pass
    def intro_screen(self):
        pass
g = Game()
g.intro_screen()
g.new()
while g.running:
    g.main()
    g.game_over()
pygame.quit()
sys.exit()