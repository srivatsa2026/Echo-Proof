from utils import get_supabase_client
from flask import Blueprint, request, jsonify

user_bp = Blueprint('user_controller', __name__)
supabase = get_supabase_client()

print("Supabase client initialized in user_controller.py", supabase)


@user_bp.route('/api/create_user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        email = data.get("email")
        username = data.get("username")
        wallet_address = data.get("wallet_address")
        smart_wallet_address = data.get("smart_wallet_address")

        if not all([email, username, wallet_address, smart_wallet_address]):
            print("Missing required fields!")
            return jsonify({"error": "Missing required fields!"}), 400


        # Step 1: Check if the user already exists
        response = (
            supabase.table("users").select("*").eq("wallet_address", wallet_address).eq("smart_wallet_address", smart_wallet_address).execute())
        print(f"Select response: {response}")


        # Step 2: Insert the new user
        print("the above insert response")
        insert_response = ( supabase.table("users").insert({
            "email": email,
            "username": username,
            "wallet_address": wallet_address,
            "smart_wallet_address": smart_wallet_address
        }).execute())

        if insert_response.data:
            return jsonify({"message": "User created successfully!"}), 201
        else:
            return jsonify({"error": "Failed to create user."}), 500

    except Exception as e:
        print(f"❌ Error in create_user: {str(e)}")
        return jsonify({"error": "Server error."}), 500



@user_bp.route('/api/get_user', methods=['POST'])
def get_user():
    try:
        data = request.get_json()
        print("The data is daskjfafbadfbwejbh",data)
        wallet_address = data.get("wallet_address")
        smart_wallet_address = data.get("smart_wallet_address")
        print(wallet_address,smart_wallet_address)
        if not all([wallet_address, smart_wallet_address]):
            return jsonify({"error": "Missing required fields!"}), 400

        # Step 1: Check if the user exists
        response = (
            supabase.table("users").select("*").eq("wallet_address", wallet_address).eq("smart_wallet_address", smart_wallet_address).execute())

        if response.data:
            print("The response data is ",response)
            return jsonify({"user":response.data, "success":"user exists"}), 200
        else:
            return jsonify({"message": "User not found.Please signup first"}), 404

    except Exception as e:
        print(f"❌ Error in get_user: {str(e)}")
        return jsonify({"error": "Server error."}), 500