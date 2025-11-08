import json
import random
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Paths for user data ---
USER_DATA_DIR = 'userdata'
USER_PERFORMANCE_FILE = os.path.join(USER_DATA_DIR, 'user_performance.json')
USER_CREDENTIALS_FILE = os.path.join(USER_DATA_DIR, 'users.json') # NEW: Credentials file

# --- Helper functions to load/save user credentials ---
def load_credentials():
    """Loads user credentials from the JSON file."""
    if not os.path.exists(USER_CREDENTIALS_FILE):
        return {}
    try:
        with open(USER_CREDENTIALS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def save_credentials(data):
    """Saves user credentials to the JSON file."""
    try:
        with open(USER_CREDENTIALS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving user credentials: {e}")


# --- Helper function to load user performance data ---
def load_user_performance_data():
    """Loads the entire user performance data from the JSON file."""
    if not os.path.exists(USER_PERFORMANCE_FILE):
        return {}
    try:
        with open(USER_PERFORMANCE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

# --- Helper function to save user performance data ---
def save_user_performance_data(data):
    """Saves the entire user performance data to the JSON file."""
    try:
        with open(USER_PERFORMANCE_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving user performance data: {e}")

# --- Helper function to get completed instance IDs for a user ---
def get_completed_instance_ids(user_id):
    """
    Parses user performance data and returns a set of all
    unique part (instance) IDs a user has completed.
    """
    all_data = load_user_performance_data()
    user_data = all_data.get(str(user_id))
    if not user_data:
        return set()

    completed_ids = set()
    for exam_date, exam_details in user_data.items():
        if "parts" in exam_details and isinstance(exam_details["parts"], list):
            for part in exam_details["parts"]:
                if "partId" in part:
                    completed_ids.add(part["partId"])
    return completed_ids

# --- Helper function to load part data ---
def load_part_data(exam_type, part_number):
    """
    Loads a dictionary of instances for a specific part from its JSON file.
    """
    file_path = f"data/{exam_type}/teil{part_number}.json"
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict) and data:
                return data
            else:
                return None
    except (FileNotFoundError, json.JSONDecodeError):
        return None

# --- API Routes ---

@app.route('/api/register', methods=['POST'])
def register_user():
    """Registers a new user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    credentials = load_credentials()
    if username in credentials:
        return jsonify({"error": "Username already exists."}), 409 # Conflict

    credentials[username] = password # Note: Storing passwords in plain text is insecure.
    save_credentials(credentials)

    return jsonify({"success": True, "message": "User registered successfully."}), 201

@app.route('/api/login', methods=['POST'])
def login_user():
    """Logs in a user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    credentials = load_credentials()
    if username in credentials and credentials[username] == password:
        return jsonify({"success": True, "userId": username})
    
    return jsonify({"error": "Invalid username or password."}), 401 # Unauthorized


@app.route('/api/listening-exam', methods=['GET'])
def get_listening_exam():
    """
    Generates a random listening exam. If a userId is provided, it attempts
    to select instances the user has not yet completed. If all are completed,
    it returns a special status.
    """
    user_id = request.args.get("userId")
    completed_ids = get_completed_instance_ids(user_id) if user_id else set()
    
    exam = []
    number_of_parts = 4
    try:
        # Check if all instances in any part-type have been completed
        is_fully_completed = False
        for i in range(1, number_of_parts + 1):
            part_instances_dict = load_part_data('listening', i)
            if not part_instances_dict:
                return jsonify({"error": f"Could not load data for listening part {i}."}), 500
            
            all_instance_ids = {inst.get("id") for inst in part_instances_dict.values()}
            
            # If the set of all IDs is a subset of completed IDs, this part is exhausted
            if all_instance_ids and all_instance_ids.issubset(completed_ids):
                is_fully_completed = True
                break

        if is_fully_completed:
            return jsonify({"status": "all_completed", "message": "User has completed all available listening exams."})

        # If we get here, a unique exam can be built
        for i in range(1, number_of_parts + 1):
            part_instances_dict = load_part_data('listening', i)
            all_instances = list(part_instances_dict.values())
            
            available_instances = [inst for inst in all_instances if inst.get("id") not in completed_ids]
            
            # This is now guaranteed to have at least one item
            exam.append(random.choice(available_instances))
        
        return jsonify(exam)

    except (IndexError, TypeError, Exception) as e:
        return jsonify({"error": "Failed to assemble a complete listening exam.", "details": str(e)}), 500


@app.route('/api/reading-exam', methods=['GET'])
def get_reading_exam():
    """
    Generates a random reading exam, handling the "all completed" state.
    """
    user_id = request.args.get("userId")
    completed_ids = get_completed_instance_ids(user_id) if user_id else set()

    exam = []
    number_of_parts = 5
    try:
        # Check for completion across all parts first
        is_fully_completed = False
        for i in range(1, number_of_parts + 1):
            part_instances_dict = load_part_data('reading', i)
            if not part_instances_dict:
                 return jsonify({"error": f"Could not load data for reading part {i}."}), 500
            
            all_instance_ids = {inst.get("id") for inst in part_instances_dict.values()}
            if all_instance_ids and all_instance_ids.issubset(completed_ids):
                is_fully_completed = True
                break
        
        if is_fully_completed:
            return jsonify({"status": "all_completed", "message": "User has completed all available reading exams."})

        # If not fully completed, build the exam with unique parts
        for i in range(1, number_of_parts + 1):
            part_instances_dict = load_part_data('reading', i)
            all_instances = list(part_instances_dict.values())
            
            available_instances = [inst for inst in all_instances if inst.get("id") not in completed_ids]

            exam.append(random.choice(available_instances))
            
        return jsonify(exam)

    except (IndexError, TypeError, Exception) as e:
        return jsonify({"error": "Failed to assemble a complete reading exam.", "details": str(e)}), 500


@app.route('/api/save-exam', methods=['POST'])
def save_exam_performance():
    """
    Saves the results of a completed exam for a user.
    """
    performance_data = request.json
    user_id = performance_data.get("userId")

    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    all_users_data = load_user_performance_data()
    user_data = all_users_data.get(str(user_id), {})
    exam_timestamp = datetime.now().isoformat()

    user_data[exam_timestamp] = {
        "examType": performance_data.get("examType"),
        "totalScore": performance_data.get("totalScore"),
        "totalQuestions": performance_data.get("totalQuestions"),
        "parts": performance_data.get("parts")
    }

    all_users_data[str(user_id)] = user_data
    save_user_performance_data(all_users_data)

    return jsonify({"success": True, "message": "Exam performance saved."}), 200


if __name__ == '__main__':
    if not os.path.exists(USER_DATA_DIR):
        os.makedirs(USER_DATA_DIR)
    app.run(debug=True)