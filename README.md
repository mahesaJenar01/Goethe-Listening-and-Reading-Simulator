# Goethe B1 Exam Simulator

This project is a web application designed to help users practice for the Goethe-Zertifikat B1 German language exam. It provides a platform for taking simulated "Hören" (Listening) and "Lesen" (Reading) modules, tracks user performance, and ensures users receive new exam questions on subsequent attempts.

The application features a React/TypeScript frontend and a Flask/Python backend.

## Features

*   **Secure Authentication**: A user registration and login system to manage sessions and track individual progress.
*   **Dynamic Exam Generation**: The backend serves unique exam instances from a pool of questions, preventing users from repeating content until all available exams have been completed.
*   **Interactive Exam Interface**: A clean, component-based UI for answering various question types, including Multiple Choice, True/False, and Speaker Assignment.
*   **Session Persistence**: In-progress exams are saved to local storage, allowing users to refresh the page or close the tab and seamlessly continue their session.
*   **Automated Timer**: Each exam module is timed according to official Goethe-Zertifikat standards, and the session automatically submits when time expires.
*   **Detailed Results View**: Upon submission, users receive their score and a comprehensive review of their answers, including explanations for the correct solutions.
*   **Performance Tracking**: All completed exam results, including score and time taken, are saved on the backend and associated with the user's account.

## Tech Stack

#### Frontend
*   **React 18**
*   **TypeScript**
*   **React Router**: For client-side routing and navigation.
*   **Tailwind CSS**: For utility-first styling.

#### Backend
*   **Flask**: A lightweight Python web framework for the API.
*   **Flask-CORS**: To handle Cross-Origin Resource Sharing between the frontend and backend.

## Project Structure

```
/
├── backend/
│   ├── app.py                  # Main Flask application and API endpoints
│   ├── data/                   # JSON files containing exam content
│   │   ├── listening/
│   │   └── reading/
│   ├── userdata/               # Stores user credentials and performance JSON files
│   └── static/                 # Holds audio files for the listening module
│
└── frontend/
    └── src/
        ├── components/         # Reusable React components (Cards, Views, etc.)
        ├── contexts/           # React Context for authentication state
        ├── hooks/              # Custom hooks for session management, API calls, and timers
        ├── state/              # Centralized state logic (reducer, actions, types)
        ├── utils/              # Helper functions (score calculation, data formatting)
        ├── App.tsx             # Main application component with routing
        └── index.tsx           # Application entry point
```

## Setup and Installation

### Prerequisites

*   Python 3.8+
*   Node.js v16+ and npm

### Backend Setup

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```

2.  Create and activate a Python virtual environment:
    ```sh
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  Install the required Python packages:
    ```sh
    pip install Flask Flask-Cors
    ```

4.  Run the Flask development server:
    ```sh
    flask run
    ```
    The backend API will be running at `http://127.0.0.1:5000`.

### Frontend Setup

1.  In a **new terminal**, navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```

2.  Install the required npm packages:
    ```sh
    npm install
    ```

3.  Start the React development server:
    ```sh
    npm start
    ```
    The application will open automatically in your browser at `http://localhost:3000`. The backend server must be running for the application to function correctly.

## API Endpoints

The backend exposes the following RESTful API endpoints:

| Method | Endpoint             | Description                                          |
|--------|----------------------|------------------------------------------------------|
| `POST` | `/api/register`      | Registers a new user.                                |
| `POST` | `/api/login`         | Authenticates a user and returns their ID.           |
| `GET`  | `/api/listening-exam`| Fetches a unique, uncompleted listening exam.        |
| `GET`  | `/api/reading-exam`  | Fetches a unique, uncompleted reading exam.          |
| `POST` | `/api/save-exam`     | Saves a user's completed exam performance to a file. |

## Content Generation

The exam content is not hard-coded within the application. The JSON files in the `backend/data` directory are generated using the AI system prompts located in the project's root folder:

*   `B1 Goethe Listening Exam Simulator (ts) System Prompt.txt`
*   `B1 Goethe Reading Exam Simulator (ts) System Prompt.txt`

These prompts instruct a large language model to create new, realistic exam instances in the required JSON format. This allows for the easy expansion of the question bank by simply adding new files to the data directory.