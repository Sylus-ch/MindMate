from flask import Blueprint, request, jsonify
import jwt, datetime
from pymongo import MongoClient

user_bp = Blueprint("user", __name__)
client = MongoClient("mongodb://localhost:27017/")
db = client["mindmate"]
users = db["users"]
SECRET_KEY = "your-secret-key-here"  # 替换成你的真实密钥

# 获取用户信息
@user_bp.route("/api/user/info", methods=["GET"])
def get_user_info():
    try:
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"msg": "未提供认证token"}), 401

        payload = jwt.decode(token.split()[1], SECRET_KEY, algorithms=["HS256"])
        user = users.find_one({"username": payload["username"]}, {"password": 0})
        if not user:
            return jsonify({"msg": "用户不存在"}), 404

        user["_id"] = str(user["_id"])
        return jsonify({"user": user}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"msg": "token已过期"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"msg": "无效token"}), 401
    except Exception as e:
        return jsonify({"msg": f"获取失败: {str(e)}"}), 500

# 更新用户信息
@user_bp.route("/api/user/update", methods=["POST"])
def update_user():
    try:
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"msg": "未提供认证token"}), 401

        payload = jwt.decode(token.split()[1], SECRET_KEY, algorithms=["HS256"])
        data = request.get_json()

        update_data = {"updated_at": datetime.datetime.utcnow()}
        if "age" in data: update_data["age"] = int(data["age"])
        if "gender" in data: update_data["gender"] = data["gender"]
        if "phone" in data: update_data["phone"] = data["phone"]
        if "bio" in data: update_data["bio"] = data["bio"]

        result = users.update_one(
            {"username": payload["username"]},
            {"$set": update_data}
        )

        user = users.find_one({"username": payload["username"]}, {"password": 0})
        user["_id"] = str(user["_id"])

        return jsonify({
            "msg": "更新成功",
            "user": user
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"msg": "token已过期"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"msg": "无效token"}), 401
    except Exception as e:
        return jsonify({"msg": f"更新失败: {str(e)}"}), 500
