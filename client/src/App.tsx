import { useEffect, useRef, useState } from "react";
import { HexTileMap } from "./game/HexTileMap";

// Tell TypeScript about the Phaser global
declare global {
  interface Window {
    Phaser: any;
  }
}

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if we're using the standalone version
    const urlParams = new URLSearchParams(window.location.search);
    const useStandalone = urlParams.get('standalone') === 'true';
    
    if (useStandalone) {
      // Redirect to the standalone version
      window.location.href = '/game';
      return;
    }
    
    // Load Phaser script
    const loadPhaser = () => {
      // Skip if already loaded
      if (window.Phaser) {
        initializeGame();
        return;
      }
      
      setIsLoading(true);
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
      script.async = true;
      
      script.onload = () => {
        console.log("Phaser loaded successfully");
        setIsLoading(false);
        initializeGame();
      };
      
      script.onerror = () => {
        console.error("Failed to load Phaser");
        setError("Failed to load game engine. Please try refreshing the page.");
        setIsLoading(false);
      };
      
      document.body.appendChild(script);
    };
    
    // Initialize the game
    const initializeGame = () => {
      if (!gameContainerRef.current) return;
      
      try {
        // Initialize the game once the component mounts
        const game = new HexTileMap(gameContainerRef.current);
        
        // Save the game instance for cleanup
        const gameInstance = game;
        
        // Cleanup function to destroy the game when the component unmounts
        return () => {
          if (gameInstance) {
            gameInstance.destroy();
          }
        };
      } catch (err) {
        console.error("Error initializing game:", err);
        setError("Failed to initialize the game. Please try again.");
      }
    };
    
    // Start loading
    loadPhaser();
  }, []);
  
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-gray-800">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-red-600 text-white p-4 rounded-md">
            {error}
            <button 
              className="ml-4 bg-white text-red-600 px-2 py-1 rounded"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div ref={gameContainerRef} className="w-full h-full" id="game-container">
        {/* Phaser will create and append the canvas element here */}
      </div>
      
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded">
        <p>Try our standalone version at <a href="/game" className="text-blue-400 underline">/game</a></p>
      </div>
    </div>
  );
}

export default App;
