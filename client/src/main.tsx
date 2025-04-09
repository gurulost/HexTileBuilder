import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render the app directly, as Phaser is already loaded in index.html
createRoot(document.getElementById("root")!).render(<App />);
