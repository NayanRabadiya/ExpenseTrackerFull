from models.UserModel import (
    User,
    UserOut,
    UserLogin,
    ResetPasswordReq,
    ForgotPasswordReq,
)
from models.RoleModel import RoleOut
from typing import List, Optional
from config.database import user_collection, role_collection
from bson import ObjectId
from fastapi import HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
import bcrypt
from utils.SendMail import send_email
import os
from utils.CloudinaryUtil import uploadImage
import datetime
import jwt


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # ✅ Ensure upload directory exists


async def addUserWithUrl(
    name: str,
    email: str,
    password: str,
    contact: str,
    address: Optional[str],
    roleId: str,
    image: UploadFile,
):
    """🔥 API to add a user with an uploaded image file"""

    try:
        # file_ext = image.filename.split(".")[-1]
        # file_path = os.path.join(UPLOAD_DIR, f"{ObjectId()}.{file_ext}")

        # with open(file_path, "wb") as buffer:
        #     shutil.copyfileobj(image.file, buffer)

        imageURL = await uploadImage(image.file)

        if not imageURL:
            raise HTTPException(status_code=500, detail="Image upload failed!")

        user_data = {
            "name": name,
            "email": email,
            "roleId": ObjectId(roleId),
            "contact": contact,
            "password": password,
            "address": address,
            "imgUrl": imageURL,
        }

        user_obj = User(**user_data)
        print("...user", user_data)
        return await addUser(user_obj)
        # return {
        #     "message": "User created successfully",
        #     # "image_url": file_path
        # }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


async def getAllUsers():
    users = await user_collection.find().to_list()
    if len(users) == 0:
        return JSONResponse(status_code=404, detail="No users found")
    for user in users:
        user = await getRoleData(user)
    return [UserOut(**user) for user in users]


async def addUser(user: User):

    checkEmail = await user_collection.find_one({"email": user.email})
    # print(".......................................",type(checkEmail["roleId"]))
    # print(".......................................",type(user.roleId))
    if checkEmail is None or checkEmail["roleId"] != ObjectId(user.roleId):
        print(".....new email")

        user.password = bcrypt.hashpw(
            user.password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        user.roleId = ObjectId(user.roleId)
        saved = await user_collection.insert_one(user.dict())
        user.roleId = str(user.roleId)

        # send_email(user.email,"Account created successfully","Your account has been created successfully")

    else:
        print(".....same email and role")
        return JSONResponse(
            status_code=400, content={"message": "your account already exists"}
        )

    if saved.inserted_id:
        return JSONResponse(status_code=200, content=user.dict())
    raise HTTPException(status_code=500, detail="User doesnot added..")


async def getUserById(id: str):

    user = await user_collection.find_one({"_id": ObjectId(id)})
    if user:
        user = await getRoleData(user)
        return JSONResponse(status_code=200, content=UserOut(**user).dict())
    else:
        raise HTTPException(status_code=404, detail=f"User with id {id} not found")


async def deleteUserById(id: str):
    user = await user_collection.delete_one({"_id": ObjectId(id)})
    if user.deleted_count == 1:
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(
            status_code=404, content={"message": "User with id {id} not found}"}
        )


async def getUserByRoleId(roleId: str):
    users = await user_collection.find({"roleId": ObjectId(roleId)}).to_list()
    if len(users) == 0:
        return JSONResponse(
            status_code=404, content={"message": "No users found for this role"}
        )
    for user in users:
        user = await getRoleData(user)
    return [UserOut(**user) for user in users]


async def loginUser(req: UserLogin):
    foundUser = await user_collection.find_one({"email": req.email, "roleId": ObjectId('67c7e9367afd6879270eb871')})
    print(".....user", foundUser)
    if foundUser is None:
        return JSONResponse(status_code=404, content={"message": "user not found"})
    print("........password", type(foundUser["password"]))
    if "password" in foundUser and bcrypt.checkpw(
        req.password.encode(), foundUser["password"].encode()
    ):
        foundUser = await getRoleData(foundUser)
        
        return JSONResponse(status_code=200, content=UserOut(**foundUser).dict())
    else:
        return JSONResponse(status_code=401, content={"message": "incorrect password"})
    
    
async def loginAdmin(req: UserLogin):
    foundUser = await user_collection.find_one({"email": req.email, "roleId": ObjectId('67c7e9207afd6879270eb870')})
    print(".....user", foundUser)
    if foundUser is None:
        return JSONResponse(status_code=404, content={"message": "user not found"})
    print("........password", type(foundUser["password"]))
    if "password" in foundUser and bcrypt.checkpw(
        req.password.encode(), foundUser["password"].encode()
    ):
        foundUser = await getRoleData(foundUser)
        
        return JSONResponse(status_code=200, content=UserOut(**foundUser).dict())
    else:
        return JSONResponse(status_code=401, content={"message": "incorrect password"})

async def getRoleData(user):
    if "roleId" in user:
        # print("........role id",user["roleId"])
        role = await role_collection.find_one({"_id": ObjectId(user["roleId"])})
        # print("........role",role)
        user["role"] = {"name": role["name"]}
    else:
        user["role"] = None
    return user


SECRET_KEY = "expense"


def generate_token(email: str):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    payload = {"sub": email, "exp": expiration}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


async def forgotPassword(data: ForgotPasswordReq):
    foundUser = await user_collection.find_one({"email": data.email})
    if not foundUser:
        raise HTTPException(status_code=404, detail="No user exist with this email ")

    token = generate_token(data.email)
    resetLink = f"http://localhost:5173/resetpassword/{token}"
    body = f"""
    <html>
    <body>
        <h1>HELLO THIS IS RESET PASSWORD LINK EXPIRES IN 1 hour</h1>
        <a href= "{resetLink}">RESET PASSWORD</a>
    </body>
    </html>
    """
    subject = "RESET PASSWORD"
    send_email(data.email, subject, body)
    return {"message": "reset link sent successfully"}


async def resetPassword(data: ResetPasswordReq):
    try:
        payload = jwt.decode(
            data.token, SECRET_KEY, algorithms="HS256"
        )  # {"sub":"email...",exp:}
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=421, detail="token is not valid...")

        hashed_password = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        await user_collection.update_one(
            {"email": email}, {"$set": {"password": hashed_password}}
        )

        return {"message": "password updated successfully"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="jwt is expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="jwt is invalid")
