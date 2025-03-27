# Metaverse Doctor

An AI-powered medical diagnosis application with blockchain integration for secure storage of medical records.

## Features

- AI-based diagnosis from user-reported symptoms
- Voice recognition for hands-free symptom reporting
- Text-to-speech for audible diagnosis results
- Blockchain integration for secure medical record storage
- Responsive and modern user interface

## Tech Stack

- **Frontend**: React.js, Vite
- **Backend**: Node.js, Express
- **Blockchain**: Ethereum (mock implementation for demo)
- **APIs**: Custom diagnosis API with fallback mechanisms
- **Voice**: Web Speech API for speech recognition and synthesis

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mini-proj-1/MetaDoc.git
   cd MetaDoc
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

Use the included PowerShell script to start both frontend and backend:

```
powershell -File .\quick-fix.ps1
```

Or start manually:

1. Start the backend:
   ```
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at:
   - Frontend: http://localhost:3000 (or http://localhost:5173)
   - Backend API: http://localhost:3001/api

## Usage

1. Enter symptoms in the text field or click the microphone button to use speech-to-text.
2. Submit symptoms to receive a diagnosis.
3. View diagnosis details and recommendations.
4. Use the "Speak Diagnosis" button to hear the diagnosis audibly.

## License

MIT License
