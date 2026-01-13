import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/print.css";
import { initGA } from './lib/analytics';

// 初始化 Google Analytics
initGA();

createRoot(document.getElementById("root")!).render(<App />);
