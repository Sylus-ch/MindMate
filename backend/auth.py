from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime
from pymongo import MongoClient

auth_bp = Blueprint("auth", __name__)
client = MongoClient("mongodb://localhost:27017/")
db = client["mindmate"]
users = db["users"]
SECRET_KEY = "your-secret-key-here"  # 生产环境应使用环境变量

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    print("=== 收到注册请求 ===")  # 调试日志
    print("请求头:", request.headers)
    print("请求体:", request.get_json())
    try:
        data = request.get_json()
        required_fields = ["username", "password", "phone", "age", "gender"]
        
        # 验证必填字段
        if not all(field in data for field in required_fields):
            return jsonify({"msg": "缺少必填字段"}), 400

        # 检查用户名是否已存在
        if users.find_one({"username": data["username"]}):
            return jsonify({"msg": "用户名已存在"}), 400

        # 检查手机号是否已存在
        if users.find_one({"phone": data["phone"]}):
            return jsonify({"msg": "手机号已注册"}), 400

        # 创建用户
        user_data = {
            "username": data["username"],
            "password": generate_password_hash(data["password"]),
            "phone": data["phone"],
            "age": int(data["age"]),
            "gender": data["gender"],
            "bio": "",
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        result = users.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)
        del user_data["password"]
        
        return jsonify({"msg": "注册成功", "user": user_data}), 201
    except Exception as e:
        return jsonify({"msg": f"注册失败: {str(e)}"}), 500

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"msg": "用户名和密码不能为空"}), 400

        user = users.find_one({"username": username})
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"msg": "用户名或密码错误"}), 401

        # 生成JWT token
        token = jwt.encode({
            "username": user["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, SECRET_KEY, algorithm="HS256")

        # 准备用户数据返回
        user_data = {
            "_id": str(user["_id"]),
            "username": user["username"],
            "phone": user["phone"],
            "age": user["age"],
            "gender": user["gender"],
            "bio": user.get("bio", "")
        }

        return jsonify({
            "msg": "登录成功",
            "token": token,
            "user": user_data
        }), 200
    except Exception as e:
        return jsonify({"msg": f"登录失败: {str(e)}"}), 500

@auth_bp.route("/api/auth/user", methods=["GET"])
def get_user():
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
        return jsonify({"msg": f"获取用户信息失败: {str(e)}"}), 500

@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({"msg": "登出成功"}), 200