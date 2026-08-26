

# # 2. Select your project database (MongoDB creates this automatically if it doesn't exist)
# db = client["citizen_complaints"]

# # 3. Select the "users" collection (similar to a table in SQL)
# users_collection = db["complaints"]

# def register_user():
#     # Create the user document structure
#     user_data = {
#         "user_name": complaint[user_name],
#         "email": email,
#         "password": password # In production, remember to hash passwords!
#     }
    
#     # Insert the document into the database directory via the driver
#     result = users_collection.insert_one(user_data)
#     print(f"User registered successfully! User ID: {result.inserted_id}")

# # Test the registration function
# register_user("amitkumar", "amit@example.com", "securepassword123")


from pymongo import MongoClient
# from AI.restructure_complain import restructure_complaint

client = MongoClient("mongodb://localhost:27017/")

db = client["lok_hita"]
complaints_collection = db["citizen_complaints"]


def create_complaint(data):
    result = complaints_collection.insert_one({
        "user_id": data.user_id,
        "user_name": data.user_name,
        "complaint": data.complaint_query,
    })

    return result.inserted_id



def update_ai_result(complaint_id, ai_result):
    complaints_collection.update_one(
        {"_id": complaint_id},
        {
            "$set": {
                "ai_analysis": ai_result,
                "status": "AI_PROCESSED"
            }
        }
    )