/**
 * Handles the coordinate system for hexagonal grid
 * Implements offset-coordinate logic for proper placement of hexagons
 */
export class CoordinateSystem {
  private hexWidth: number;
  private hexHeight: number;
  private tileOffset: number;
  
  /**
   * Creates a coordinate system for hexagonal tiles
   * 
   * @param hexWidth - Width of hexagon tile in pixels
   * @param hexHeight - Height of hexagon tile in pixels
   * @param tileOffset - Horizontal offset factor (percentage of hexWidth)
   */
  constructor(hexWidth: number, hexHeight: number, tileOffset: number) {
    this.hexWidth = hexWidth;
    this.hexHeight = hexHeight;
    this.tileOffset = tileOffset;
  }
  
  /**
   * Calculates the isometric position for a hex tile at grid coordinates (x, y)
   * Uses offset-coordinate system for hexagonal grids
   * 
   * @param x - The x coordinate in the grid
   * @param y - The y coordinate in the grid
   * @returns Position coordinates {posX, posY} for the tile
   */
  calculateIsometricPosition(x: number, y: number): { posX: number, posY: number } {
    // Calculate horizontal offset (75% of tile width for proper hex alignment)
    const offsetX = this.hexWidth * this.tileOffset;
    
    // Calculate vertical spacing with an offset for even/odd rows
    // This creates the proper "brick" pattern for hexes
    const isOddRow = y % 2 === 1;
    
    // Calculate base position
    let posX = x * offsetX;
    // Apply a small vertical adjustment (-2px) to tighten up the grid
    // This helps eliminate gaps between tiles
    let posY = y * (this.hexHeight * 0.75) - 2; 
    
    // Apply offset for odd rows
    if (isOddRow) {
      posX += offsetX / 2;
    }
    
    // Apply isometric projection transformations
    // This takes our grid and skews it to create the isometric look
    return {
      posX: posX,
      posY: posY
    };
  }
  
  /**
   * Converts screen coordinates to grid coordinates
   * Useful for implementing click/touch interactions
   * 
   * @param screenX - X position on screen
   * @param screenY - Y position on screen
   * @param originX - Origin X offset
   * @param originY - Origin Y offset
   * @returns Grid coordinates {gridX, gridY}
   */
  screenToGrid(screenX: number, screenY: number, originX: number, originY: number): { gridX: number, gridY: number } {
    // Adjust for origin offset
    const relativeX = screenX - originX;
    const relativeY = screenY - originY;
    
    // Adjust for the vertical offset (-2px) we added in calculateIsometricPosition
    const adjustedRelativeY = relativeY + 2;
    
    // Approximate row (y) based on vertical position
    const approxRow = Math.round(adjustedRelativeY / (this.hexHeight * 0.75));
    const isOddRow = approxRow % 2 === 1;
    
    // Calculate column (x) based on horizontal position, adjusting for row offset
    let approxCol;
    if (isOddRow) {
      approxCol = Math.round((relativeX - this.hexWidth * this.tileOffset / 2) / (this.hexWidth * this.tileOffset));
    } else {
      approxCol = Math.round(relativeX / (this.hexWidth * this.tileOffset));
    }
    
    return {
      gridX: Math.max(0, approxCol),
      gridY: Math.max(0, approxRow)
    };
  }
}
