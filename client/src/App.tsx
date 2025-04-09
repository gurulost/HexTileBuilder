import { useEffect, useRef } from "react";
import { HexTileMap } from "./game/HexTileMap";

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Make sure Phaser is available globally
    if (typeof window.Phaser === 'undefined') {
      console.error("Phaser not loaded");
      return;
    }
    
    // Initialize the game once the component mounts
    const game = new HexTileMap(gameContainerRef.current!);
    
    // Cleanup function to destroy the game when the component unmounts
    return () => {
      game.destroy();
    };
  }, []);
  
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div ref={gameContainerRef} className="w-full h-full" id="game-container">
        {/* Phaser will create and append the canvas element here */}
      </div>
    </div>
  );
}

export default App;
