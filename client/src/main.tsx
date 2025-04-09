import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load Phaser from CDN
const phaserScript = document.createElement("script");
phaserScript.src = "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js";
phaserScript.async = true;

phaserScript.onload = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

document.head.appendChild(phaserScript);
