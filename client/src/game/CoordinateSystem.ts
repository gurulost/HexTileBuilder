/**
 * Handles the coordinate system for hexagonal grid
 * Implements standard offset-coordinate logic (odd-q) for proper placement of hexagons
 */
export class CoordinateSystem {
  private hexWidth: number;
  private hexHeight: number;
  private hexSide: number;
  private hexHorizSpacing: number;
  private hexVertSpacing: number;
  
  /**
   * Creates a coordinate system for hexagonal tiles using standard hex grid math
   * 
   * @param hexWidth - Width of hexagon tile in pixels
   * @param hexHeight - Height of hexagon tile in pixels
   * @param tileOffset - Unused parameter kept for backward compatibility
   */
  constructor(hexWidth: number, hexHeight: number, tileOffset: number) {
    this.hexWidth = hexWidth;
    this.hexHeight = hexHeight;
    this.hexSide = hexHeight / 2;
    
    // Calculate standard hex grid spacing
    // These values create a perfect hexagonal grid with the SVG tiles
    this.hexHorizSpacing = hexWidth * 3/4;  // Horizontal distance between hex centers
    this.hexVertSpacing = hexHeight;        // Vertical distance between hex centers
  }
  
  /**
   * Calculates the isometric position for a hex tile at grid coordinates (q, r)
   * Uses standard odd-q offset-coordinate system for hexagonal grids
   * 
   * @param q - The column coordinate in the grid
   * @param r - The row coordinate in the grid
   * @returns Position coordinates {posX, posY} for the tile
   */
  calculateIsometricPosition(q: number, r: number): { posX: number, posY: number } {
    // Using standard odd-q offset coordinate system
    let posX = q * this.hexHorizSpacing;
    let posY = r * this.hexVertSpacing;
    
    // Offset odd rows (critical for proper hex grid alignment)
    if (r % 2 === 1) {
      posX += this.hexHorizSpacing / 2;
    }
    
    return { posX, posY };
  }
  
  /**
   * Converts screen coordinates to grid coordinates
   * Uses the inverse of the odd-q coordinate system calculation
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
    
    // Approximate row (r) based on vertical position
    const approxRow = Math.round(relativeY / this.hexVertSpacing);
    
    // Adjust x for the row offset (odd rows are shifted)
    let adjustedX = relativeX;
    if (approxRow % 2 === 1) {
      adjustedX -= this.hexHorizSpacing / 2;
    }
    
    // Approximate column (q) based on horizontal position
    const approxCol = Math.round(adjustedX / this.hexHorizSpacing);
    
    return {
      gridX: Math.max(0, approxCol),
      gridY: Math.max(0, approxRow)
    };
  }
}
