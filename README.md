# **Viniculum**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [File Structure](#file-structure)
5. [Setup and Installation](#setup-and-installation)
6. [Future Considerations](#future-considerations)

---

## **Inspiration**

The inspiration for this project stems from the need to bridge the gap in accessibility for students and employees in hybrid environments. Whether it’s a student unable to attend campus activities or an employee struggling to feel connected in a hybrid work model, existing virtual solutions often fail to deliver the interactivity and inclusivity needed for meaningful engagement. Our goal is to create a platform that eliminates these barriers and fosters collaboration and connection for everyone.

---

## **Introduction**

Viniculum is a **real-time collaborative environment** built using modern web technologies. It supports multiple users interacting within a shared virtual space. Users can:

- Move their avatars within the environment in real time, with movements synchronized using **WebSockets**.
- Engage in voice chat with others using **WebRTC**.
- Enjoy seamless interaction powered by efficient and scalable web frameworks.

This application is designed to enhance virtual collaboration and engagement by providing a highly interactive and customizable environment.

---

## **Features**

- **Real-Time Movement Synchronization**: 
  - All users can see each other’s movement in real time.
  - Movement data is handled using **WebSockets** for low-latency updates.

- **Voice Chat**:
  - Users can communicate with each other through **WebRTC-based voice chat**.
  - Designed for direct peer-to-peer audio communication.

---

## **Technologies Used**

- **Frontend**:
  - **Vite**: A fast build tool and development server.
  - **React**: A JavaScript library for building interactive user interfaces.
  - **Pixi.js**: For rendering the 2D virtual environment.

- **Backend**:
  - **Node.js**: A runtime for building fast and scalable server-side applications.
  - **Express**: A web framework for handling routes and APIs.
  - **Socket.IO**: For real-time bidirectional communication.

- **Communication**:
  - **WebRTC**: For peer-to-peer voice chat functionality.

---

## **File Structure**

Here is the file structure of the project for better understanding:

```
root/
├── backend/
│   ├── cert.pem             # SSL certificate for secure communication
│   ├── index.js             # Main backend entry point
│   ├── routes/              # Express route handlers
│   │   ├── index.js         # Routes aggregator
│   │   ├── mapRoutes.js     # Handles map-related APIs
│   │   ├── userRoutes.js    # Manages user-related APIs
│   ├── sockets/             # Socket.IO event handlers
│   │   ├── chatHandlers.js  # Handles chat messages
│   │   ├── index.js         # Socket.IO setup and integration
│   │   ├── movementHandlers.js # Handles movement updates
│   │   ├── proximityLogic.js  # Manages proximity calculations
│   ├── utils/               # Utility functions
├── frontend/
│   ├── src/                 # React application source code
│   │   ├── App.jsx          # Main React component
│   │   ├── PixiCanvas.jsx   # Virtual environment renderer using Pixi.js
│   │   ├── assets/          # Static assets (images, etc.)
│   ├── public/              # Publicly accessible files
│   │   ├── index.html       # Main HTML entry point
│   ├── vite.config.js       # Vite configuration
```

---

## **Setup and Installation**

Follow these steps to set up and run the project locally:

### **1. Prerequisites**
- **Node.js**: Install [Node.js](https://nodejs.org/) (v16 or higher).
- **npm or yarn**: Package manager for installing dependencies.

### **2. Clone the Repository**

```bash
git clone https://github.com/your-repository.git
cd your-repository
```

### **3. Install Dependencies**

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### **4. Run the Backend Server**

- Navigate to the `backend/` folder:
  ```bash
  cd backend
  node index.js
  ```
- The backend server will start on `http://localhost:3000`.

### **5. Run the Frontend Development Server**

- Navigate to the `frontend/` folder:
  ```bash
  cd ../frontend
  npm run dev
  ```
- The frontend server will start, and the app will be accessible at `http://localhost:5173`.

### **6. Open the App**

- Open the app in your browser. Open multiple tabs or browsers to test the multi-user functionality.

---

## **Future Considerations**

This project is a foundation for building a robust real-time collaborative platform. Some potential future enhancements include:

1. **Room-Based Collaboration**:
   - Support for multiple virtual rooms for different purposes, such as casual hangouts or important meetings.

2. **User Authentication**:
   - Adding a login system to enable persistent user states, such as saved positions and settings.

3. **Proximity-Based Voice Chat**:
   - Limit voice chat to users within a certain proximity for realistic spatial audio interaction.

4. **Dynamic Events**:
   - Change the virtual environment dynamically during special events like career fairs or game nights.

5. **Customizable Maps**:
   - Allow users to choose or design their own maps for a personalized experience.

---
