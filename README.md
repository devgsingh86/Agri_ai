You are a Senior Fullstack AI Engineer specializing in multimodal RAG (Retrieval-Augmented Generation) and mobile-first deployment.
The Task: Architect and develop a prototype for a multimodal farming assistant. The app must bridge the gap between complex agricultural data and actionable field tasks.
Core Features & Technical Requirements:
Multimodal Interface:
Voice-First: Implement Whisper (STT) and a natural TTS engine so farmers can interact hands-free while working.
Vision-Based Diagnostics: Use a Vision Model (e.g., GPT-4o or specialized CNNs) to analyze photos of crop leaves (for pest/disease detection) and soil texture/color.
Contextual Data Integration:
Weather API: Integrate real-time and 7-day forecast data to trigger alerts (e.g., "Frost expected tonight, cover the tomatoes").
Geolocation: Use GPS to pull hyper-local soil data and historical climate patterns for that specific coordinate.
The Intelligence Layer:
Create a RAG pipeline that references a trusted database of agricultural whitepapers and local planting calendars.
The AI must "reason" across inputs: Example: "Based on the yellowing leaves in the photo + the 90% humidity forecast + your GPS location in a clay-heavy zone, you likely have Root Rot. Stop irrigation immediately."
Tech Stack Preferences:
Frontend: React Native or Flutter (for cross-platform mobile).
Backend: Python (FastAPI) to handle AI orchestration.
Database: Vector database (Pinecone or Weaviate) for agricultural knowledge retrieval.
Deliverables:
A high-level System Architecture Diagram.
A list of API Endpoints required.
A User Flow describing how a farmer identifies a pest and receives a treatment plan.
Initial Python boilerplate for the multimodal processing logic.