import pygame
from config import *
import math
import random

class Spritesheet:
    def __init__(self,file):
        self.sheet= pygame.image.load(file).convert()
    def get_sprite(self,x,y,width,height):
        sprite = pygame.Surface([width,height])
        sprite.blit(self.sheet, (0,0),(x,y,width,height))
        sprite.set_colorkey(BLACK)
        return sprite

class Player(pygame.sprite.Sprite):
    def __init__(self,game,x,y):
        self.game = game
        self._layer = PLAYER_LAYER
        self.groups= self.game.all_sprites
        pygame.sprite.Sprite.__init__(self,self.groups)
        self.x= x*TILESIZE
        self.y=y*TILESIZE
        self.width=TILESIZE
        self.height=TILESIZE
        

        self.image= self.game.character_spritesheet.get_sprite(576,147,32,45)
        #self.image.fill(RED)
       
        
        self.rect= self.image.get_rect()
        self.rect.x=self.x
        self.rect.y=self.y
        self.x_change=0
        self.y_change=0
        self.facing='down'
        self.animation_loop =1
    def animate(self):
        down_animations= [self.game.character_spritesheet.get_sprite(576,147,32,45),
                          self.game.character_spritesheet.get_sprite(608,148,32,45),
                          self.game.character_spritesheet.get_sprite(639,147,32,45)]
        
        up_animations=   [self.game.character_spritesheet.get_sprite(192,147,32,45),
                          self.game.character_spritesheet.get_sprite(224,145,32,48),
                          self.game.character_spritesheet.get_sprite(255,147,32,45)]
        
        left_animations= [self.game.character_spritesheet.get_sprite(385,148,32,45),
                          self.game.character_spritesheet.get_sprite(416,145,31,45),
                          self.game.character_spritesheet.get_sprite(449,147,32,45)]

        right_animations= [self.game.character_spritesheet.get_sprite(0,148,32,45),
                          self.game.character_spritesheet.get_sprite(31,145,31,45),
                          self.game.character_spritesheet.get_sprite(63,148,32,45)]

        if self.facing == "down":
            if self.y_change == 0:
                self.image = self.game.character_spritesheet.get_sprite(576,147,32,45)
            else:
                self.image = down_animations[math.floor(self.animation_loop)]
                self.animation_loop +=0.1
                if self.animation_loop >=3:
                    self.animation_loop=1
        if self.facing == "up":
            if self.y_change == 0:
                self.image = self.game.character_spritesheet.get_sprite(192,147,32,45)
            else:
                self.image = up_animations[math.floor(self.animation_loop)]
                self.animation_loop +=0.1
                if self.animation_loop >=3:
                    self.animation_loop=1
        if self.facing == "left":
            if self.x_change == 0:
                self.image = self.game.character_spritesheet.get_sprite(385,148,32,45)
            else:
                self.image = left_animations[math.floor(self.animation_loop)]
                self.animation_loop +=0.1
                if self.animation_loop >=3:
                    self.animation_loop=1
        if self.facing == "right":
            if self.x_change == 0:
                self.image = self.game.character_spritesheet.get_sprite(0,148,32,45)
            else:
                self.image = right_animations[math.floor(self.animation_loop)]
                self.animation_loop +=0.1
                if self.animation_loop >=3:
                    self.animation_loop=1





    def collide_blocks(self,direction):
        if direction =="x":
            hits= pygame.sprite.spritecollide(self,self.game.blocks,False)
            if hits:
                
                if self.x_change>0:
                    self.rect.x= hits[0].rect.left - self.rect.width
                if self.x_change<0:
                    self.rect.x =hits[0].rect.right
        if direction =="y":
            hits= pygame.sprite.spritecollide(self,self.game.blocks,False)
            if hits: 
                if self.y_change > 0:
                    self.rect.y= hits[0].rect.top - self.rect.height
                if self.y_change <0:
                    self.rect.y=hits[0].rect.bottom
        if direction =="x":
            hits= pygame.sprite.spritecollide(self,self.game.doors,False)
            if hits :
                print("HEllo")
                
                if self.x_change>0:
                    self.rect.x= hits[0].rect.left - self.rect.width
                if self.x_change<0:
                    self.rect.x =hits[0].rect.right
        if direction =="y":
            hits= pygame.sprite.spritecollide(self,self.game.doors,False)
            if hits: 
                print("HEllo")
                if self.y_change > 0:
                    self.rect.y= hits[0].rect.top - self.rect.height
                if self.y_change <0:
                    self.rect.y=hits[0].rect.bottom
    


        

    def update(self):
        
        self.movement()
        self.animate()

        self.rect.x +=self.x_change
        self.collide_blocks('x')
        self.rect.y +=self.y_change
        self.collide_blocks('y')
        self.x_change=0
        self.y_change=0
    def movement(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.x_change -=PLAYER_SPEED
            self.facing ="left"
        if keys[pygame.K_RIGHT]:
            self.x_change +=PLAYER_SPEED
            self.facing ="right"
        if keys[pygame.K_UP]:
            self.y_change -=PLAYER_SPEED
            self.facing ="up"
        if keys[pygame.K_DOWN]:
            self.y_change +=PLAYER_SPEED
            self.facing ="down"
        
class Block(pygame.sprite.Sprite):
    def __init__(self,game,x,y):
        self.game= game
        self._layer=BLOCK_LAYER
        self.groups = self.game.all_sprites, self.game.blocks
        pygame.sprite.Sprite.__init__(self,self.groups)

        self.x=x*TILESIZE
        self.y=y*TILESIZE
        self.width=TILESIZE
        self.height=TILESIZE

        self.image= self.game.terrain_spritesheet.get_sprite(530,479,99,81)
        self.rect = self.image.get_rect()
        self.rect.x=self.x
        self.rect.y=self.y
class Block_3(pygame.sprite.Sprite):
    def __init__(self,game,x,y):
        self.game= game
        self._layer =BLOCK_LAYER
        self.groups= self.game.all_sprites, self.game.blocks
        pygame.sprite.Sprite.__init__(self,self.groups)

        self.x=x*TILESIZE
        self.y=y*TILESIZE
        self.width=TILESIZE
        self.height=TILESIZE

        self.image= self.game.terrain3_spritesheet.get_sprite(197,22,85,71)
        self.rect = self.image.get_rect()
        self.rect.x=self.x
        self.rect.y=self.y
class Block_2(pygame.sprite.Sprite):
        def __init__(self,game,x,y):
            self.game= game
            self._layer=BLOCK_LAYER
            self.groups = self.game.all_sprites, self.game.doors
            pygame.sprite.Sprite.__init__(self,self.groups)

            self.x=x*TILESIZE
            self.y=y*TILESIZE
            self.width=TILESIZE
            self.height=TILESIZE

            self.image= self.game.terrain_spritesheet.get_sprite(99,698,92,69)
            self.rect = self.image.get_rect()
            self.rect.x=self.x
            self.rect.y=self.y
class Ground(pygame.sprite.Sprite):
    def __init__(self,game,x,y):
        self.game= game
        self._layer =GROUND_LAYER
        self.groups= self.game.all_sprites
        pygame.sprite.Sprite.__init__(self,self.groups)

        self.x=x*TILESIZE
        self.y=y*TILESIZE
        self.width=TILESIZE
        self.height=TILESIZE

        self.image= self.game.terrain2_spritesheet.get_sprite(0,0,96,142)
        self.rect = self.image.get_rect()
        self.rect.x=self.x
        self.rect.y=self.y

   

   