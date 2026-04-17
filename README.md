
  # High-fidelity mobile app design

  This is a code bundle for High-fidelity mobile app design. The original project is available at https://www.figma.com/design/H8QAjwUefjCuPxfjTxRC4w/High-fidelity-mobile-app-design.

  ## Running the application

  **⚠️ IMPORTANT: Backend Server Required**
  For the application to work correctly (AI Assistant, SOS, Geolocations, Authentication), you MUST run the backend server alongside the frontend. 

  ### 1. Start the Backend Server
  Open a new terminal session, navigate to the `server` folder, install its dependencies, and start it:
  ```bash
  cd server
  npm install
  npm start
  ```
  *(Keep this terminal open. The backend will run on port 3001 and connect to the local SQLite database).*

  ### 2. Start the Frontend Application
  Open a **NEW** terminal session in the root folder of the project, install the dependencies, and start the development server:
  ```bash
  npm i
  npm run dev
  ```
  *(The Vite development server will start and proxy API requests to the backend automatically).*