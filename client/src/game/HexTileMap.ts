import { TerrainTileType, FeatureTileType } from './TileTypes';
import { CoordinateSystem } from './CoordinateSystem';
import { MapGenerator } from './MapGenerator';

// Add a declaration to make TypeScript recognize the global variable
declare global {
  interface Window { 
    hexTileMapInstance: any;
  }
}

export class HexTileMap {
  private game: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;
  private scene: Phaser.Scene;
  
  // Made these public so they can be accessed via the global instance
  public coordSystem: CoordinateSystem;
  public mapGenerator: MapGenerator;
  
  // Configuration Parameters - also made public
  public hexWidth: number = 128;
  public hexHeight: number = 112; // Adjusted for isometric perspective (height:width ratio ~0.875)
  public mapWidth: number = 10; // Number of horizontal tiles
  public mapHeight: number = 10; // Number of vertical tiles
  public tileOffset: number = 0.75; // Horizontal offset for adjacent hexes (percentage of tile width)

  constructor(container: HTMLElement) {
    this.coordSystem = new CoordinateSystem(this.hexWidth, this.hexHeight, this.tileOffset);
    this.mapGenerator = new MapGenerator();
    
    // Store instance globally to access it in the Phaser scene initialization
    // This is needed because Phaser's scene may not have direct access to 'this'
    (window as any).hexTileMapInstance = this;
    
    // Create the main scene
    class MainScene extends Phaser.Scene {
      constructor() {
        super({ key: 'MainScene' });
      }
      
      preload() {
        console.log("Preloading assets...");
        
        // Load terrain tiles
        Object.values(TerrainTileType).forEach(type => {
          const path = `/assets/tiles/${type}_hex.svg`;
          console.log(`Loading terrain tile: ${path}`);
          this.load.svg(type, path);
        });
        
        // Load feature/resource tiles
        Object.values(FeatureTileType).forEach(type => {
          const path = `/assets/tiles/${type}_hex.svg`;
          console.log(`Loading feature tile: ${path}`);
          this.load.svg(type, path);
        });
      }
      
      create() {
        console.log("Creating scene...");
        const gameWidth = this.sys.game.config.width as number;
        const gameHeight = this.sys.game.config.height as number;
        console.log(`Game dimensions: ${gameWidth}x${gameHeight}`);
        
        // Check if scene settings are available
        if (!this.scene || !this.scene.settings || !this.scene.settings.data) {
          console.error("Scene settings not properly initialized");
          return;
        }
        
        // Generate tile map
        console.log("Generating tile map...");
        const mapGenerator = this.scene.settings.data.mapGenerator;
        const mapWidth = this.scene.settings.data.mapWidth;
        const mapHeight = this.scene.settings.data.mapHeight;
        
        if (!mapGenerator) {
          console.error("Map generator not available");
          return;
        }
        
        const tileMap = mapGenerator.generateTileMap(mapWidth, mapHeight);
        console.log("Tile map generated:", tileMap);
        
        // Calculate center offset to position the map in the middle of the screen
        const mapCenterX = gameWidth / 2;
        const mapCenterY = gameHeight / 3; // Position map higher on screen for better view
        console.log(`Map center position: (${mapCenterX}, ${mapCenterY})`)
        
        // Get the coordinate system
        const coordSystem = this.scene.settings.data.coordSystem;
        if (!coordSystem) {
          console.error("Coordinate system not available");
          return;
        }
        
        // Render the base terrain tiles first
        console.log("Rendering terrain tiles...");
        tileMap.terrain.forEach((row, y) => {
          row.forEach((tileType, x) => {
            const { posX, posY } = coordSystem.calculateIsometricPosition(x, y);
            
            // Create the tile sprite with adjusted position for centering
            try {
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
            } catch (error) {
              console.error(`Error rendering tile at (${x}, ${y}):`, error);
            }
          });
        });
        
        // Render the feature/resource tiles on top of the terrain
        console.log("Rendering feature tiles...");
        tileMap.features.forEach((feature) => {
          if (feature) {
            try {
              const { x, y, type } = feature;
              const { posX, posY } = coordSystem.calculateIsometricPosition(x, y);
              
              // Create the feature sprite with adjusted position for centering
              this.add.image(
                mapCenterX + posX,
                mapCenterY + posY,
                type
              ).setOrigin(0.5, 0.5).setDepth(y + 0.1); // Set slightly higher depth than terrain
            } catch (error) {
              console.error("Error rendering feature:", error);
            }
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
          console.log("Initializing scene...");
          // Pass data to the scene
          // Make sure scene and settings exist first
          if (!this.scene) {
            console.error("Scene is not initialized");
            this.scene = {
              settings: { data: {} }
            };
          }
          if (!this.scene.settings) {
            console.error("Scene settings are not initialized");
            this.scene.settings = { data: {} };
          }
          if (!this.scene.settings.data) {
            console.log("Creating scene settings data object");
            this.scene.settings.data = {};
          }
          
          // Check if parent exists
          if (!this.parent) {
            console.error("Parent object not available in init function");
            
            // Create a direct reference to the HexTileMap instance
            const hexTileMap = window.hexTileMapInstance;
            
            if (hexTileMap) {
              console.log("Using global hexTileMapInstance reference");
              // Now set the data with direct references
              this.scene.settings.data = {
                coordSystem: hexTileMap.coordSystem,
                mapGenerator: hexTileMap.mapGenerator,
                mapWidth: hexTileMap.mapWidth,
                mapHeight: hexTileMap.mapHeight
              };
            } else {
              console.error("Global hexTileMapInstance not available");
              // Use default values as fallback
              this.scene.settings.data = {
                coordSystem: new CoordinateSystem(128, 112, 0.75),
                mapGenerator: new MapGenerator(),
                mapWidth: 10,
                mapHeight: 10
              };
            }
          } else {
            // Use parent as normal if available
            console.log("Using parent reference in init function");
            this.scene.settings.data = {
              coordSystem: this.parent.coordSystem,
              mapGenerator: this.parent.mapGenerator,
              mapWidth: this.parent.mapWidth,
              mapHeight: this.parent.mapHeight
            };
          }
          console.log("Scene data initialized:", this.scene.settings.data);
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
