# 🚀 Full-Stack Project

This project is a **full-stack application** with:  
- 📦 **Backend**: Node.js + Express (`backend/`)  
- 🎨 **Frontend**: React (`frontend/`, bootstrapped with [Create React App](https://github.com/facebook/create-react-app))  

It is designed to run both frontend & backend locally or under the same Wi-Fi network.

---

## 📂 Project Structure

```
root/
├── backend/
│   ├── server.js
│   └── …
├── frontend/
│   ├── src/
│   ├── public/
│   └── …
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <https://github.com/aburussel87/Institutional-Info-System>
```

---

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Project

### Run Backend Server

From the `backend` folder:
```bash
cd backend
npx nodemon server.js
```

> The backend server will start (usually at [http://localhost:5000](http://localhost:5000) or your configured port).

---

### Run Frontend Server

From the `frontend` folder:
```bash
cd frontend
npm start
```

> The frontend React app will start at [http://localhost:3000](http://localhost:3000).

---

## 🌐 Configure API Endpoint

When running the app on **different devices under the same Wi-Fi**, you must set the frontend to point to the backend’s **local IP address**.

### Steps:

1️⃣ Find the local IP of the backend machine:
-- After you run your backend server, you will see like this-
```bash
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`

 Server running at:
   → Local:   http://localhost:5000
   → Network: http://192.168.0.173:5000
```

You’ll see something like:
```
   → Network: http://192.168.0.173:5000
```

---

2️⃣ Update the frontend config file:
Edit:
```
frontend/src/config/config.js
```

Set:
```js
const API_BASE_URL = "http://192.168.1.100:5000";
export default API_BASE_URL;
```

Replace `192.168.1.100` with your actual local IP.

---

## 📜 Available Scripts

### Frontend

From the `frontend/` folder:

#### `npm start`
Runs the React app in development mode.  
Open [http://localhost:3000](http://localhost:3000).

#### `npm test`
Runs the tests in watch mode.  
[More info](https://facebook.github.io/create-react-app/docs/running-tests)

#### `npm run build`
Builds the React app for production into the `build/` folder.

#### `npm run eject`
Removes Create React App abstraction and gives full control over configurations.  
**Note: irreversible.**
[More info](https://facebook.github.io/create-react-app/docs/available-scripts)

---

### Backend

From the `backend/` folder:

#### `npx nodemon server.js`
Runs the backend in development mode with auto-reload.

> (You can also install nodemon globally with `npm install -g nodemon` and just run `nodemon server.js`.)

---

## 📖 Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Docs](https://facebook.github.io/create-react-app/docs/getting-started)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)

---

## 🐞 Troubleshooting

If `npm run build` (frontend) fails to minify, see:  
👉 [CRA Troubleshooting Guide](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

✨ Happy coding!
