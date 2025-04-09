/**
 * Defines the available terrain tile types
 */
export enum TerrainTileType {
  GRASS = 'grass',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  DESERT = 'desert',
  WATER = 'water'
}

/**
 * Defines the available feature/resource tile types that overlay terrain
 */
export enum FeatureTileType {
  FRUIT = 'fruit',
  ANIMALS = 'animals',
  MINERALS = 'minerals',
  RUINS = 'ruins',
  VILLAGE = 'village'
}

/**
 * Probability weights for terrain generation
 * Higher values indicate more common tile types
 */
export const TERRAIN_WEIGHTS = {
  [TerrainTileType.GRASS]: 35,
  [TerrainTileType.FOREST]: 25,
  [TerrainTileType.MOUNTAIN]: 15,
  [TerrainTileType.DESERT]: 15,
  [TerrainTileType.WATER]: 10
};

/**
 * Probability weights for feature generation
 * Higher values indicate more common feature types
 */
export const FEATURE_WEIGHTS = {
  [FeatureTileType.FRUIT]: 25,
  [FeatureTileType.ANIMALS]: 25,
  [FeatureTileType.MINERALS]: 20,
  [FeatureTileType.RUINS]: 15,
  [FeatureTileType.VILLAGE]: 15
};

/**
 * Defines which features can appear on which terrain types
 */
export const VALID_FEATURE_TERRAIN_COMBINATIONS = {
  [FeatureTileType.FRUIT]: [TerrainTileType.GRASS, TerrainTileType.FOREST],
  [FeatureTileType.ANIMALS]: [TerrainTileType.GRASS, TerrainTileType.FOREST, TerrainTileType.DESERT],
  [FeatureTileType.MINERALS]: [TerrainTileType.MOUNTAIN, TerrainTileType.DESERT],
  [FeatureTileType.RUINS]: [TerrainTileType.GRASS, TerrainTileType.DESERT, TerrainTileType.FOREST],
  [FeatureTileType.VILLAGE]: [TerrainTileType.GRASS, TerrainTileType.DESERT]
};

/**
 * Tile map structure interface
 */
export interface TileMap {
  terrain: TerrainTileType[][];
  features: FeatureTile[];
}

/**
 * Feature tile interface
 */
export interface FeatureTile {
  x: number;
  y: number;
  type: FeatureTileType;
}
