import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add default styles for title elements
document.head.innerHTML += `
  <title>DocQuiz - Document to Quiz Converter</title>
  <meta name="description" content="Convert documents to quizzes easily with DocQuiz" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
`;

createRoot(document.getElementById("root")!).render(<App />);
