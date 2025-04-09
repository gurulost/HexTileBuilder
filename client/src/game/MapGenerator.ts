import { 
  TileMap, 
  TerrainTileType, 
  FeatureTileType, 
  TERRAIN_WEIGHTS, 
  FEATURE_WEIGHTS,
  VALID_FEATURE_TERRAIN_COMBINATIONS,
  FeatureTile
} from './TileTypes';

/**
 * Responsible for generating the tile map with terrain and features
 */
export class MapGenerator {
  /**
   * Generates a complete tile map with both terrain and features
   * 
   * @param width - Width of the map in tiles
   * @param height - Height of the map in tiles
   * @returns A complete TileMap object
   */
  generateTileMap(width: number, height: number): TileMap {
    // Generate base terrain
    const terrain = this.generateTerrainLayer(width, height);
    
    // Generate features that go on top of terrain
    const features = this.generateFeatures(terrain);
    
    return {
      terrain,
      features
    };
  }
  
  /**
   * Generates the base terrain layer
   * 
   * @param width - Width of the map in tiles
   * @param height - Height of the map in tiles
   * @returns 2D array of terrain tile types
   */
  private generateTerrainLayer(width: number, height: number): TerrainTileType[][] {
    const terrainMap: TerrainTileType[][] = [];
    
    // Use a simple coherent noise approach to create terrain clusters
    // First, generate a random "seed" map with basic random distribution
    const seedMap: number[][] = [];
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        row.push(Math.random());
      }
      seedMap.push(row);
    }
    
    // Now smooth the map to create terrain clusters
    // This is a simple approach to make terrain types clump together
    for (let y = 0; y < height; y++) {
      const terrainRow: TerrainTileType[] = [];
      for (let x = 0; x < width; x++) {
        // Get average of surrounding cells to smooth
        let total = seedMap[y][x];
        let count = 1;
        
        // Check surrounding cells
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            // Skip if outside map bounds or center cell
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || (dx === 0 && dy === 0)) {
              continue;
            }
            
            total += seedMap[ny][nx];
            count++;
          }
        }
        
        // Calculate average noise value
        const smoothedValue = total / count;
        
        // Determine terrain type based on the smoothed value and weights
        terrainRow.push(this.selectTerrainTypeFromValue(smoothedValue));
      }
      terrainMap.push(terrainRow);
    }
    
    // Further refine the map by ensuring water forms continuous bodies
    this.refineWaterBodies(terrainMap);
    
    return terrainMap;
  }
  
  /**
   * Selects a terrain type based on a random value and defined weights
   * 
   * @param value - Random value between 0 and 1
   * @returns Selected terrain type
   */
  private selectTerrainTypeFromValue(value: number): TerrainTileType {
    // Define terrain type thresholds based on weights
    const totalWeight = Object.values(TERRAIN_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    let runningTotal = 0;
    
    // Create threshold ranges for each terrain type
    const thresholds: { type: TerrainTileType; min: number; max: number }[] = [];
    
    for (const [type, weight] of Object.entries(TERRAIN_WEIGHTS)) {
      const min = runningTotal / totalWeight;
      runningTotal += weight;
      const max = runningTotal / totalWeight;
      
      thresholds.push({
        type: type as TerrainTileType,
        min,
        max
      });
    }
    
    // Find which threshold range our value falls into
    for (const threshold of thresholds) {
      if (value >= threshold.min && value < threshold.max) {
        return threshold.type;
      }
    }
    
    // Default to grass if something goes wrong
    return TerrainTileType.GRASS;
  }
  
  /**
   * Refines water bodies to make them more continuous
   * 
   * @param terrainMap - The terrain map to refine
   */
  private refineWaterBodies(terrainMap: TerrainTileType[][]): void {
    const height = terrainMap.length;
    const width = terrainMap[0].length;
    
    // Simple water body refinement: if a tile has 2 or more water neighbors,
    // it has a chance to become water too
    const tempMap = JSON.parse(JSON.stringify(terrainMap));
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Count water neighbors
        let waterNeighbors = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            // Skip if outside map bounds or center cell
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || (dx === 0 && dy === 0)) {
              continue;
            }
            
            if (terrainMap[ny][nx] === TerrainTileType.WATER) {
              waterNeighbors++;
            }
          }
        }
        
        // If surrounded by water, likely become water
        if (waterNeighbors >= 2 && Math.random() < 0.7) {
          tempMap[y][x] = TerrainTileType.WATER;
        }
        
        // Isolated water has a chance to become land
        if (terrainMap[y][x] === TerrainTileType.WATER && waterNeighbors === 0) {
          tempMap[y][x] = this.selectTerrainTypeFromValue(Math.random());
        }
      }
    }
    
    // Apply the changes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        terrainMap[y][x] = tempMap[y][x];
      }
    }
  }
  
  /**
   * Generates feature tiles that overlay the terrain
   * 
   * @param terrainMap - The terrain map to place features on
   * @returns Array of feature tiles
   */
  private generateFeatures(terrainMap: TerrainTileType[][]): FeatureTile[] {
    const features: FeatureTile[] = [];
    const height = terrainMap.length;
    const width = terrainMap[0].length;
    
    // Keep track of which tiles already have features
    const occupiedTiles: Set<string> = new Set();
    
    // Add features with a certain probability
    // About 20% of tiles will have features
    const featureProbability = 0.2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Skip if this tile already has a feature
        const tileKey = `${x},${y}`;
        if (occupiedTiles.has(tileKey)) {
          continue;
        }
        
        // Randomly decide if this tile should have a feature
        if (Math.random() < featureProbability) {
          const terrainType = terrainMap[y][x];
          
          // Select a valid feature type for this terrain
          const validFeatureTypes = this.getValidFeatureTypesForTerrain(terrainType);
          
          if (validFeatureTypes.length > 0) {
            // Select a feature type with weighted probability
            const featureType = this.selectFeatureTypeWithWeights(validFeatureTypes);
            
            // Add the feature
            features.push({
              x,
              y,
              type: featureType
            });
            
            // Mark this tile as occupied
            occupiedTiles.add(tileKey);
          }
        }
      }
    }
    
    return features;
  }
  
  /**
   * Gets all feature types that can be placed on a given terrain type
   * 
   * @param terrainType - The terrain type to check
   * @returns Array of valid feature types
   */
  private getValidFeatureTypesForTerrain(terrainType: TerrainTileType): FeatureTileType[] {
    const validTypes: FeatureTileType[] = [];
    
    // Check each feature type to see if it's valid for this terrain
    for (const [featureType, validTerrains] of Object.entries(VALID_FEATURE_TERRAIN_COMBINATIONS)) {
      if (validTerrains.includes(terrainType)) {
        validTypes.push(featureType as FeatureTileType);
      }
    }
    
    return validTypes;
  }
  
  /**
   * Selects a feature type based on weights
   * 
   * @param validTypes - Array of valid feature types to choose from
   * @returns Selected feature type
   */
  private selectFeatureTypeWithWeights(validTypes: FeatureTileType[]): FeatureTileType {
    // Calculate total weight for valid feature types
    let totalWeight = 0;
    for (const type of validTypes) {
      totalWeight += FEATURE_WEIGHTS[type];
    }
    
    // Generate a random value
    const randomValue = Math.random() * totalWeight;
    
    // Select based on weights
    let runningTotal = 0;
    for (const type of validTypes) {
      runningTotal += FEATURE_WEIGHTS[type];
      if (randomValue <= runningTotal) {
        return type;
      }
    }
    
    // Default to the first valid type if something goes wrong
    return validTypes[0];
  }
}
