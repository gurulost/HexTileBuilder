import { TileTypes, TerrainTileType, FeatureTileType } from './TileTypes';
import { CoordinateSystem } from './CoordinateSystem';
import { MapGenerator } from './MapGenerator';

export class HexTileMap {
  private game: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;
  private scene: Phaser.Scene;
  private coordSystem: CoordinateSystem;
  private mapGenerator: MapGenerator;
  
  // Configuration Parameters
  private hexWidth: number = 128;
  private hexHeight: number = 112; // Adjusted for isometric perspective (height:width ratio ~0.875)
  private mapWidth: number = 10; // Number of horizontal tiles
  private mapHeight: number = 10; // Number of vertical tiles
  private tileOffset: number = 0.75; // Horizontal offset for adjacent hexes (percentage of tile width)

  constructor(container: HTMLElement) {
    this.coordSystem = new CoordinateSystem(this.hexWidth, this.hexHeight, this.tileOffset);
    this.mapGenerator = new MapGenerator();
    
    // Create the main scene
    class MainScene extends Phaser.Scene {
      constructor() {
        super({ key: 'MainScene' });
      }
      
      preload() {
        // Load terrain tiles
        Object.values(TerrainTileType).forEach(type => {
          this.load.svg(type, `/assets/tiles/${type}_hex.svg`);
        });
        
        // Load feature/resource tiles
        Object.values(FeatureTileType).forEach(type => {
          this.load.svg(type, `/assets/tiles/${type}_hex.svg`);
        });
      }
      
      create() {
        const gameWidth = this.sys.game.config.width as number;
        const gameHeight = this.sys.game.config.height as number;
        
        // Generate tile map
        const tileMap = this.scene.settings.data.mapGenerator.generateTileMap(
          this.scene.settings.data.mapWidth, 
          this.scene.settings.data.mapHeight
        );
        
        // Calculate center offset to position the map in the middle of the screen
        const mapCenterX = gameWidth / 2;
        const mapCenterY = gameHeight / 3; // Position map higher on screen for better view
        
        // Render the base terrain tiles first
        tileMap.terrain.forEach((row, y) => {
          row.forEach((tileType, x) => {
            const { posX, posY } = this.scene.settings.data.coordSystem.calculateIsometricPosition(x, y);
            
            // Create the tile sprite with adjusted position for centering
            const tile = this.add.image(
              mapCenterX + posX, 
              mapCenterY + posY, 
              tileType
            ).setOrigin(0.5, 0.5).setDepth(y); // Set depth based on y-position for proper layering
            
            // Add interactive features to tiles - commented for now, 
            // but shows where to implement in the future
            /*
            tile.setInteractive();
            tile.on('pointerover', () => {
              tile.setTint(0xdddddd);
            });
            tile.on('pointerout', () => {
              tile.clearTint();
            });
            tile.on('pointerdown', () => {
              console.log(`Tile clicked at (${x}, ${y}), type: ${tileType}`);
            });
            */
          });
        });
        
        // Render the feature/resource tiles on top of the terrain
        tileMap.features.forEach((feature) => {
          if (feature) {
            const { x, y, type } = feature;
            const { posX, posY } = this.scene.settings.data.coordSystem.calculateIsometricPosition(x, y);
            
            // Create the feature sprite with adjusted position for centering
            this.add.image(
              mapCenterX + posX,
              mapCenterY + posY,
              type
            ).setOrigin(0.5, 0.5).setDepth(y + 0.1); // Set slightly higher depth than terrain
          }
        });
        
        // Add instructions or UI text
        this.add.text(16, 16, 'Isometric Hex Tile Map', { 
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: '#00000088',
          padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100);
      }
    }
    
    // Configure the game
    this.config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#3498db', // Sky blue background
      parent: container,
      scene: {
        init: function() {
          // Pass data to the scene
          this.scene.settings.data = {
            coordSystem: this.parent.coordSystem,
            mapGenerator: this.parent.mapGenerator,
            mapWidth: this.parent.mapWidth,
            mapHeight: this.parent.mapHeight
          };
        }.bind(this),
        preload: MainScene.prototype.preload,
        create: MainScene.prototype.create
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    
    // Create the game instance
    this.game = new Phaser.Game(this.config);
    this.scene = this.game.scene.getScene('MainScene');
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  private handleResize() {
    // Update game size on window resize
    this.game.scale.resize(window.innerWidth, window.innerHeight);
  }
  
  destroy() {
    // Remove event listeners when the game is destroyed
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Destroy the game instance
    this.game.destroy(true);
  }
}
