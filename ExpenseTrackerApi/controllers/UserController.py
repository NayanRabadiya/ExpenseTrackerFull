from models.UserModel import (
    User,
    UserOut,
    UserLogin,
    ResetPasswordReq,
    ForgotPasswordReq,
)
from models.RoleModel import RoleOut
from models.ExpenseModel import ExpensesOut
from typing import List, Optional
from config.database import (
    user_collection,
    role_collection,
    budget_collection,
    expenses_collection,
    category_collection,
)
from bson import ObjectId
from fastapi import HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
import bcrypt
from utils.SendMail import send_email
import os
from utils.CloudinaryUtil import uploadImage
import datetime
import jwt
from fastapi import BackgroundTasks


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def getAllUsers():
    users = await user_collection.find().to_list()
    if len(users) == 0:
        return JSONResponse(status_code=404, detail="No users found")
    for user in users:
        user = await getRoleData(user)
    return [UserOut(**user) for user in users]


async def addUser(user: User):

    checkEmail = await user_collection.find_one({"email": user.email})
    if checkEmail is None:
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
        await expenses_collection.delete_many({"userId": ObjectId(id)})
        await budget_collection.delete_many({"userId": ObjectId(id)})
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
    foundUser = await user_collection.find_one({"email": req.email})
    if foundUser is None:
        return JSONResponse(status_code=404, content={"message": "user not found"})
    if "password" in foundUser and bcrypt.checkpw(
        req.password.encode(), foundUser["password"].encode()
    ):
        foundUser = await getRoleData(foundUser)

        return JSONResponse(status_code=200, content=UserOut(**foundUser).dict())
    else:
        return JSONResponse(status_code=401, content={"message": "incorrect password"})


async def loginAdmin(req: UserLogin):
    foundUser = await user_collection.find_one(
        {"email": req.email, "roleId": ObjectId("67c7e9207afd6879270eb870")}
    )
    if foundUser is None:
        return JSONResponse(status_code=404, content={"message": "user not found"})
    if "password" in foundUser and bcrypt.checkpw(
        req.password.encode(), foundUser["password"].encode()
    ):
        foundUser = await getRoleData(foundUser)
        return JSONResponse(status_code=200, content=UserOut(**foundUser).dict())
    else:
        return JSONResponse(status_code=401, content={"message": "incorrect password"})


async def updateUser(
    id: str,
    name: str,
    email: str,
    contact: str,
    address: Optional[str],
    roleId: str,
    image: Optional[UploadFile],
):

    try:
        if image:
            imageURL = await uploadImage(image.file)
            if not imageURL:
                raise HTTPException(status_code=500, detail="Image upload failed!")
            user_data = {
                "name": name,
                "email": email,
                "contact": contact,
                "address": address,
                "roleId": ObjectId(roleId),
                "imgUrl": imageURL,
            }
        else:
            user_data = {
                "name": name,
                "email": email,
                "contact": contact,
                "address": address,
                "roleId": ObjectId(roleId),
            }

        result = await user_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": user_data}
        )

        updatedUser = await user_collection.find_one({"_id": ObjectId(id)})
        updatedUser = await getRoleData(updatedUser)

        return JSONResponse(status_code=200, content=UserOut(**updatedUser).dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


async def updateUserRole(id: str, user: User):
    try:
        result = await user_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": {"roleId": ObjectId(user.roleId)}}
        )
        updatedUser = await user_collection.find_one({"_id": ObjectId(id)})
        updatedUser = await getRoleData(updatedUser)

        return JSONResponse(status_code=200, content=UserOut(**updatedUser).dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


async def getAdminData():
    noOfUsers = await user_collection.count_documents(
        {"roleId": ObjectId("67c7e9367afd6879270eb871")}
    )

    expenses = await expenses_collection.find().to_list()

    #  expensesthis month
    currentExpenses = []
    for expense in expenses:
        # date = "dd/mm/yyyy"
        date = expense["date"]
        [day, month, year] = date.split("/")
        if (
            int(year) == datetime.datetime.now().year
            and int(month) == datetime.datetime.now().month
        ):
            currentExpenses.append(expense)

    # total amount
    totalAmount = 0
    for expense in currentExpenses:
        amount = expense["amount"]
        totalAmount = totalAmount + amount

    # categorywise amount
    categoryAmount = {}
    for expense in currentExpenses:
        amount = expense["amount"]
        expense = await getCategoryData(expense)
        category = expense["category"]
        categoryName = category["name"]
        if categoryName in categoryAmount:
            categoryAmount[categoryName] = categoryAmount[categoryName] + amount
        else:
            categoryAmount[categoryName] = amount

    # highest spending category
    highestSpendingCategory = None
    highestSpendingAmount = 0
    for category, amount in categoryAmount.items():
        if amount > highestSpendingAmount:
            highestSpendingCategory = category
            highestSpendingAmount = amount

    # average monthly expense
    averageExpense = totalAmount / noOfUsers

    return {
        "noOfUsers": noOfUsers,
        "totalAmount": totalAmount,
        "highestSpendingCategory": highestSpendingCategory,
        "highestSpendingAmount": highestSpendingAmount,
        "averageExpensePerUser": averageExpense,
        "categoryAmount": categoryAmount,
        "currentExpenses": [ExpensesOut(**expense) for expense in currentExpenses],
    }


async def sendMail(userId: str, pdf: UploadFile, background_tasks: BackgroundTasks):
    user = await user_collection.find_one({"_id": ObjectId(userId)})
    email = user["email"]

    pdf_bytes = pdf.file.read()

    background_tasks.add_task(
        send_email,
        to_email=email,
        subject="Expense Report",
        text="Here is your expense report",
        pdf_data=pdf_bytes,
    )

    return JSONResponse(status_code=200, content={"message": "Email sent successfully"})


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
    body = f"""\
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it. This link will expire in 1 hour.</p>
        <a href="{resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
    </body>
    </html>
    """

    subject = "RESET PASSWORD"
    send_email(data.email, subject, body)
    return {"message": "reset link sent successfully"}


async def resetPassword(data: ResetPasswordReq):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms="HS256")
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=421, detail="token is not valid...")

        hashed_password = bcrypt.hashpw(
            data.password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        await user_collection.update_one(
            {"email": email}, {"$set": {"password": hashed_password}}
        )

        return {"message": "password updated successfully"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="jwt is expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="jwt is invalid")


async def getRoleData(user):
    if "roleId" in user:
        role = await role_collection.find_one({"_id": ObjectId(user["roleId"])})
        user["role"] = {"name": role["name"]}
    else:
        user["role"] = None
    return user


async def getCategoryData(expense):
    if "categoryId" in expense:
        category = await category_collection.find_one(
            {"_id": ObjectId(expense["categoryId"])}
        )
        expense["category"] = {"name": category["name"]}
    else:
        expense["category"] = None
    return expense
