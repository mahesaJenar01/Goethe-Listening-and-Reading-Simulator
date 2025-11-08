# Goethe B1 Exam Simulator

This project is a web application designed to help users practice for the Goethe-Zertifikat B1 German language exam. It provides a platform for taking simulated "Hören" (Listening) and "Lesen" (Reading) modules, tracks user performance, and ensures users receive new exam questions on subsequent attempts.

## Features

*   **User Authentication**: A simple registration and login system to manage user sessions.
*   **Exam Selection**: Users can choose between practicing the "Hören" or "Lesen" modules.
*   **Dynamic Exam Generation**: The backend serves unique exam instances, preventing users from repeating the same exam parts until all available content has been completed.
*   **Interactive Exam Interface**: A clean, component-based interface for answering various question types (Multiple Choice, True/False, Matching, etc.).
*   **Session Persistence**: In-progress exams are saved to local storage, allowing users to refresh the page and continue without losing their answers.
*   **Detailed Results**: After submission, users receive their score and a detailed review of their answers, including explanations for the correct solutions.
*   **Performance Tracking**: All completed exam results are saved on the backend, linked to the user's ID.

## Tech Stack

### Frontend

*   React
*   TypeScript
*   React Router for navigation
*   Tailwind CSS for styling

### Backend

*   Flask (Python)
*   CORS handling for API requests

## Project Structure

The project is organized into a `frontend` and a `backend` directory.

```
/
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── data/                   # JSON files with exam content
│   ├── userdata/               # Stores user credentials and performance data
│   └── static/                 # Holds audio files for the listening module
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/         # React components
│       ├── contexts/           # AuthContext for state management
│       ├── hooks/              # Custom React hooks
│       ├── App.tsx             # Main application component
│       └── index.tsx           # Entry point
│
├── B1 Goethe Listening Exam Simulator (ts) System Prompt.txt
├── B1 Goethe Reading Exam Simulator (ts) System Prompt.txt
└── README.md
```

## Setup and Installation

### Prerequisites

*   Python 3.x
*   Node.js and npm

### Backend Setup

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```sh
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
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

1.  In a new terminal, navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```

2.  Install the necessary npm packages:
    ```sh
    npm install
    ```

3.  Start the React development server:
    ```sh
    npm start
    ```
    The application will open automatically in your browser at `http://localhost:3000`.

## Usage

1.  **Register/Login**: When you first visit the application, you will be prompted to register a new account or log in with existing credentials.
2.  **Select Exam**: After logging in, you can choose to practice either the "Hören" (Listening) or "Lesen" (Reading) module.
3.  **Take the Exam**: The application will load a new exam that you have not previously completed. Progress through the parts using the navigation buttons. Your answers are saved as you go.
4.  **Submit and Review**: Once you complete the final part, submit the exam to see your score. You can then review a detailed breakdown of all questions, your answers, and the correct solutions with explanations.
5.  **Logout**: The header contains a "Logout" button to end your session.

## Content Generation

The exam content is not hard-coded. The JSON files in the `backend/data` directory are generated using the AI system prompts located in the root folder:

*   `B1 Goethe Listening Exam Simulator (ts) System Prompt.txt`
*   `B1 Goethe Reading Exam Simulator (ts) System Prompt.txt`

These prompts instruct a large language model to create new, realistic exam instances in the required JSON format, which can then be added to the application to expand the question bank.