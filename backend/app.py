import re
import os
import json
import random
from flask_cors import CORS
from datetime import datetime
from flask import Flask, jsonify, request

app = Flask(__name__)
CORS(app)

# --- Paths for user data ---
USER_DATA_DIR = 'userdata'
USER_PERFORMANCE_FILE = os.path.join(USER_DATA_DIR, 'user_performance.json')
USER_CREDENTIALS_FILE = os.path.join(USER_DATA_DIR, 'users.json')

# --- Helper functions (load_credentials, save_credentials, etc. remain the same) ---
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

def load_user_performance_data():
    """Loads the entire user performance data from the JSON file."""
    if not os.path.exists(USER_PERFORMANCE_FILE):
        return {}
    try:
        with open(USER_PERFORMANCE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def get_total_possible_exams():
    """
    Determines the total number of unique exams possible, which is limited
    by the exam part with the fewest instances for each exam type.
    """
    totals = {"listening": float('inf'), "reading": float('inf')}
    
    # Calculate for Listening
    listening_part_counts = []
    for i in range(1, 5): # 4 parts for listening
        part_data = load_part_data('listening', i)
        if part_data:
            listening_part_counts.append(len(part_data))
    if listening_part_counts:
        totals["listening"] = min(listening_part_counts)

    # Calculate for Reading
    reading_part_counts = []
    for i in range(1, 6): # 5 parts for reading
        part_data = load_part_data('reading', i)
        if part_data:
            reading_part_counts.append(len(part_data))
    if reading_part_counts:
        totals["reading"] = min(reading_part_counts)
        
    return totals

def save_user_performance_data(data):
    """Saves the entire user performance data to the JSON file."""
    try:
        with open(USER_PERFORMANCE_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving user performance data: {e}")

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

# --- NEW: Helper to get total number of unique exam parts available ---
def get_total_part_counts():
    """Counts the total number of unique part instances available in the data files."""
    counts = {"listening": 0, "reading": 0}
    for exam_type in counts.keys():
        num_parts = 4 if exam_type == 'listening' else 5
        total_instances = 0
        for i in range(1, num_parts + 1):
            part_data = load_part_data(exam_type, i)
            if part_data:
                total_instances += len(part_data)
        counts[exam_type] = total_instances
    return counts

# --- API Routes (register, login, exam fetches remain the same) ---
@app.route('/api/register', methods=['POST'])
def register_user():
    """Registers a new user with validation."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400
    if not (4 <= len(username) <= 16):
        return jsonify({"error": "Username must be between 4 to 16 characters long."}), 400
    if not username.isalnum():
        return jsonify({"error": "Username cannot contain symbols or special characters."}), 400
    if not any(char.isalpha() for char in username) or not any(char.isdigit() for char in username):
        return jsonify({"error": "Username must be a combination of letters and numbers."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400

    credentials = load_credentials()
    if username in credentials:
        return jsonify({"error": "Username already exists."}), 409

    credentials[username] = password
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
    
    return jsonify({"error": "Invalid username or password."}), 401


@app.route('/api/listening-exam', methods=['GET'])
def get_listening_exam():
    user_id = request.args.get("userId")
    completed_ids = get_completed_instance_ids(user_id) if user_id else set()
    exam = []
    number_of_parts = 4
    try:
        is_fully_completed = False
        for i in range(1, number_of_parts + 1):
            part_instances_dict = load_part_data('listening', i)
            if not part_instances_dict:
                return jsonify({"error": f"Could not load data for listening part {i}."}), 500
            all_instance_ids = {inst.get("id") for inst in part_instances_dict.values()}
            if all_instance_ids and all_instance_ids.issubset(completed_ids):
                is_fully_completed = True
                break
        if is_fully_completed:
            return jsonify({"status": "all_completed", "message": "User has completed all available listening exams."})
        for i in range(1, number_of_parts + 1):
            part_instances_dict = load_part_data('listening', i)
            all_instances = list(part_instances_dict.values())
            available_instances = [inst for inst in all_instances if inst.get("id") not in completed_ids]
            exam.append(random.choice(available_instances))
        return jsonify(exam)
    except (IndexError, TypeError, Exception) as e:
        return jsonify({"error": "Failed to assemble a complete listening exam.", "details": str(e)}), 500

@app.route('/api/reading-exam', methods=['GET'])
def get_reading_exam():
    user_id = request.args.get("userId")
    completed_ids = get_completed_instance_ids(user_id) if user_id else set()
    exam = []
    number_of_parts = 5
    try:
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
        "timeTakenInSeconds": performance_data.get("timeTakenInSeconds"),
        "parts": performance_data.get("parts")
    }
    all_users_data[str(user_id)] = user_data
    save_user_performance_data(all_users_data)
    return jsonify({"success": True, "message": "Exam performance saved."}), 200

@app.route('/api/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    all_data = load_user_performance_data()
    user_data = all_data.get(str(user_id), {})
    
    scores = {"listening": {"total_correct": 0, "total_q": 0, "exam_count": 0}, 
              "reading": {"total_correct": 0, "total_q": 0, "exam_count": 0}}
    performance_trend = []
    part_performance = {}

    sorted_exams = sorted(user_data.items())

    for timestamp, exam in sorted_exams:
        exam_type = exam.get("examType")
        total_score = exam.get("totalScore", 0)
        total_questions = exam.get("totalQuestions", 1)
        
        if exam_type in scores:
            scores[exam_type]["total_correct"] += total_score
            scores[exam_type]["total_q"] += total_questions
            scores[exam_type]["exam_count"] += 1
        
        percentage = round((total_score / total_questions) * 100) if total_questions > 0 else 0
        date_obj = datetime.fromisoformat(timestamp)
        formatted_date = date_obj.strftime('%b %d')
        performance_trend.append({"date": formatted_date, "score": percentage, "examType": exam_type})

        exam_parts = exam.get("parts", [])
        for part_data in exam_parts:
            part_id = part_data.get("partId", "")
            if not part_id:
                continue
            
            part_prefix = part_id.split('-')[0]
            if part_prefix not in part_performance:
                part_performance[part_prefix] = {"correct": 0, "total": 0}

            for question in part_data.get("questions", []):
                part_performance[part_prefix]["total"] += 1
                if question.get("isCorrect", False):
                    part_performance[part_prefix]["correct"] += 1
    
    skill_breakdown = {"listening": [], "reading": []}
    for part_prefix, data in sorted(part_performance.items()):
        exam_type = 'listening' if part_prefix.lower().startswith('l') else 'reading'
        
        # --- FIX: Robustly extract ONLY the digits from the prefix ---
        part_num = re.sub(r'\D', '', part_prefix) # This strips 'l', 'p', etc. leaving only numbers
        
        if data["total"] > 0 and part_num:
            score = round((data["correct"] / data["total"]) * 100)
            skill_breakdown[exam_type].append({
                "partName": f"Teil {part_num}", # This will now be correct
                "score": score
            })

    # --- (The rest of the function is unchanged) ---
    avg_listening = round((scores["listening"]["total_correct"] / scores["listening"]["total_q"]) * 100) if scores["listening"]["total_q"] > 0 else 0
    avg_reading = round((scores["reading"]["total_correct"] / scores["reading"]["total_q"]) * 100) if scores["reading"]["total_q"] > 0 else 0

    total_possible_exams = get_total_possible_exams()

    stats = {
        "listening": {"averageScore": avg_listening, "completedExams": scores["listening"]["exam_count"], "totalExams": total_possible_exams["listening"]},
        "reading": {"averageScore": avg_reading, "completedExams": scores["reading"]["exam_count"], "totalExams": total_possible_exams["reading"]},
        "performanceTrend": performance_trend[-7:],
        "skillBreakdown": skill_breakdown
    }
    return jsonify(stats)

@app.route('/api/exam-history', methods=['GET'])
def get_exam_history():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    all_data = load_user_performance_data()
    user_data = all_data.get(str(user_id), {})

    history = []
    # Sort by timestamp descending to show the most recent first
    for timestamp, exam in sorted(user_data.items(), reverse=True):
        history.append({
            "timestamp": timestamp,
            "examType": exam.get("examType"),
            "totalScore": exam.get("totalScore"),
            "totalQuestions": exam.get("totalQuestions"),
            "date": datetime.fromisoformat(timestamp).strftime('%d. %B %Y, %H:%M') # e.g., 08. November 2025, 15:30
        })

    return jsonify(history)

# --- NEW: Detailed Exam Result API Route ---
@app.route('/api/exam-result/<timestamp>', methods=['GET'])
def get_exam_result(timestamp):
    user_id = request.args.get("userId") # Ensure the user owns this result
    if not user_id:
        return jsonify({"error": "User ID is required."}), 401

    all_data = load_user_performance_data()
    user_data = all_data.get(str(user_id), {})
    saved_exam = user_data.get(timestamp)

    if not saved_exam:
        return jsonify({"error": "Exam result not found for this user."}), 404

    # Reconstruct the full data needed by the frontend's ResultsView component
    reconstructed_exam_parts = []
    all_user_answers = {}
    
    saved_parts = saved_exam.get("parts", [])
    exam_type = saved_exam.get("examType")

    for part_performance in saved_parts:
        part_id = part_performance.get("partId")
        if not part_id: continue
            
        part_prefix = part_id.split('-')[0]
        part_number_str = re.sub(r'\D', '', part_prefix)
        
        part_data_file = load_part_data(exam_type, int(part_number_str))
        if not part_data_file: continue
            
        original_part_data = part_data_file.get(part_id)
        if original_part_data:
            reconstructed_exam_parts.append(original_part_data)
            
            for question_result in part_performance.get("questions", []):
                question_id = question_result.get("questionId")
                user_answer = question_result.get("userAnswer")
                if question_id is not None:
                    all_user_answers[question_id] = user_answer

    final_response = {
        "score": saved_exam.get("totalScore"),
        "totalQuestions": saved_exam.get("totalQuestions"),
        "timeTaken": saved_exam.get("timeTakenInSeconds"),
        "examParts": reconstructed_exam_parts,
        "allUserAnswers": all_user_answers
    }

    return jsonify(final_response)

if __name__ == '__main__':
    if not os.path.exists(USER_DATA_DIR):
        os.makedirs(USER_DATA_DIR)
    app.run(debug=True)