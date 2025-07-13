# 🚀 Institutional Information System

This is a full-stack application for managing institutional information, built with React, Node js and PostgreSQL for the database. The system is designed to provide a comprehensive platform for data management and access.
## 🚀 Deployment Sites

* **Vercel**
* **Render**
* **Supabase**
## 🔗 Live Demo & Credentials

The application can be accessed at the following link. Use the provided credentials to log in.

  * **URL:**   [`Institutional Information System`](https://institutional-info-system.vercel.app)
  * **User ID:** `2204032`
  * **Password:** `TCB349A3`

## 🛠️ Technology Stack

  * **Frontend:** React (bootstrapped with Create React App)
  * **Backend:** Node.js, Express.js
  * **Database:** PostgreSQL

## 📂 Project Structure

The project is organized into two main directories, separating the frontend and backend components for clear development and deployment.

```
root/
├── backend/                  # Node.js + Express.js backend
│   ├── server.js             # Main server entry point
│   └── …                     # Additional backend files (controllers, routes, models)
├── frontend/                 # React application
│   ├── src/                  # Source code for the React app
│   └── …                     # Other frontend directories
└── README.md
```

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1\. Clone the Repository

Begin by cloning the project from its GitHub repository.

```bash
git clone https://github.com/aburussel87/Institutional-Info-System
```

### 2\. Install Dependencies

Navigate into each directory to install the necessary dependencies for both the backend and frontend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 🚀 Running the Project

The backend and frontend servers must be run separately.

### 1\. Start the Backend Server

From the `backend/` directory, run the server in development mode with auto-reloading using `nodemon`.

```bash
cd backend
npx nodemon server.js
```

The server will typically start at `http://localhost:5000`. If you need to access it from another device on the same network, note the network IP address provided in the terminal output.

## 🌐 API Endpoint Configuration

For the frontend to communicate with the backend, ensure the API endpoint is correctly configured.

If running the frontend and backend on different devices within the same network, you must update the API URL in the frontend code to the backend machine's local IP address.

1.  **Find the Backend's Local IP:**
    After starting the backend server, the terminal will display the network IP address. For example: `http://192.168.0.173:5000`.

2.  **Update the Frontend Configuration:**
    Edit the `frontend/src/config/config.js` file and replace the placeholder IP address with the actual IP of the backend machine.

    ```js
    const API_BASE_URL = "http://192.168.0.173:5000";
    export default API_BASE_URL;
    ```

### 2\. Start the Frontend Application

In a new terminal, navigate to the `frontend/` directory and start the React development server.

```bash
cd frontend
npm start
```

The application will open in your browser at `http://localhost:3000`.



## 📜 Available Scripts

### Frontend Scripts

The following scripts are available in the `frontend/` directory:

  * `npm start`: Runs the app in development mode.
  * `npm test`: Launches the test runner in interactive watch mode.
  * `npm run build`: Builds the app for production to the `build` folder.
  * `npm run eject`: Ejects the project from Create React App's configuration.

### Backend Scripts

The following script is available in the `backend/` directory:

  * `npx nodemon server.js`: Runs the server with automatic restarts on file changes.

## 📚 Resources

  * [React Documentation](https://reactjs.org/)
  * [Create React App Documentation](https://create-react-app.dev/docs/getting-started)
  * [Node.js Documentation](https://nodejs.org/en/docs/)
  * [Express.js Documentation](https://expressjs.com/en/4x/api.html)

## 🐞 Troubleshooting

  * If `npm run build` fails to minify, refer to the [Create React App Troubleshooting guide](https://www.google.com/search?q=https://create-react-app.dev/docs/troubleshooting/%23npm-run-build-fails-to-minify).