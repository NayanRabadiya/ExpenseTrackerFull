"""User logic: CRUD, login, password reset, and the admin dashboard stats.

Also holds getRoleData/getCategoryData, the join helpers that other
controllers import.
"""

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
    """Return every user with their role name, or 404 when none exist."""
    users = await user_collection.find().to_list()
    if len(users) == 0:
        return JSONResponse(status_code=404, content={"message": "No users found"})
    for user in users:
        user = await getRoleData(user)
    return [UserOut(**user) for user in users]


async def addUser(user: User):
    """Register a user (bcrypt-hashing the password), rejecting a duplicate email."""

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


async def addUserWithUrl(
    name: str,
    email: str,
    password: str,
    contact: str,
    address: Optional[str],
    roleId: str,
    image: UploadFile,
):
    """Register a user whose profile image is uploaded to Cloudinary first."""

    checkEmail = await user_collection.find_one({"email": email})
    if checkEmail is not None:
        return JSONResponse(
            status_code=400, content={"message": "your account already exists"}
        )

    imageURL = await uploadImage(image.file)
    if not imageURL:
        raise HTTPException(status_code=500, detail="Image upload failed!")

    user_data = {
        "name": name,
        "email": email,
        "password": bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8"),
        "contact": contact,
        "address": address,
        "roleId": ObjectId(roleId),
        "imgUrl": imageURL,
    }

    saved = await user_collection.insert_one(user_data)
    if not saved.inserted_id:
        raise HTTPException(status_code=500, detail="User doesnot added..")

    savedUser = await user_collection.find_one({"_id": saved.inserted_id})
    savedUser = await getRoleData(savedUser)
    return JSONResponse(status_code=200, content=UserOut(**savedUser).dict())


async def getUserById(id: str):
    """Return one user with their role name, or 404 if not found."""

    user = await user_collection.find_one({"_id": ObjectId(id)})
    if user:
        user = await getRoleData(user)
        return JSONResponse(status_code=200, content=UserOut(**user).dict())
    else:
        raise HTTPException(status_code=404, detail=f"User with id {id} not found")


async def deleteUserById(id: str):
    """Delete a user and cascade-delete their expenses and budgets."""
    user = await user_collection.delete_one({"_id": ObjectId(id)})
    if user.deleted_count == 1:
        await expenses_collection.delete_many({"userId": ObjectId(id)})
        await budget_collection.delete_many({"userId": ObjectId(id)})
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"User with id {id} not found")


async def getUserByRoleId(roleId: str):
    """Return all users holding a given role, or 404 if none do."""
    users = await user_collection.find({"roleId": ObjectId(roleId)}).to_list()
    if len(users) == 0:
        return JSONResponse(
            status_code=404, content={"message": "No users found for this role"}
        )
    for user in users:
        user = await getRoleData(user)
    return [UserOut(**user) for user in users]


async def loginUser(req: UserLogin):
    """Check an email/password pair and return the matching user."""
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
    """Same as loginUser, but only matches accounts holding the admin role id."""
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
    """Update a user's profile; a supplied image replaces the stored one."""

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
    """Change only a user's roleId (used by the admin user list)."""
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
    """Build the admin dashboard stats for the current month.

    Totals, per-category spend, the highest-spending category, and the average
    per standard user. Expenses whose date isn't "dd/mm/yyyy" are skipped.
    """
    noOfUsers = await user_collection.count_documents(
        {"roleId": ObjectId("67c7e9367afd6879270eb871")}
    )

    expenses = await expenses_collection.find().to_list()

    #  expensesthis month
    now = datetime.datetime.now()
    currentExpenses = []
    for expense in expenses:
        # date = "dd/mm/yyyy" — skip anything that isn't in that format
        try:
            [day, month, year] = expense["date"].split("/")
            month, year = int(month), int(year)
        except (KeyError, AttributeError, ValueError):
            continue
        if year == now.year and month == now.month:
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
        categoryName = category["name"] if category else "Uncategorized"
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
    averageExpense = totalAmount / noOfUsers if noOfUsers else 0

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
    """Queue the user's report PDF for emailing; returns before the send happens."""
    user = await user_collection.find_one({"_id": ObjectId(userId)})
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {userId} not found")
    email = user["email"]

    pdf_bytes = pdf.file.read()

    background_tasks.add_task(
        send_email,
        to_email=email,
        subject="Expense Report",
        text="Here is your expense report",
        pdf_data=pdf_bytes,
    )

    # Queued, not sent — the actual send happens after this response is returned.
    return JSONResponse(status_code=202, content={"message": "Email queued for sending"})


from config.settings import JWT_SECRET_KEY as SECRET_KEY, CORS_ORIGIN


def generate_token(email: str):
    """Sign a JWT holding the email, valid for one hour (password resets only)."""
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    payload = {"sub": email, "exp": expiration}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


async def forgotPassword(data: ForgotPasswordReq):
    """Email a one-hour reset link pointing at the frontend's CORS_ORIGIN."""
    foundUser = await user_collection.find_one({"email": data.email})
    if not foundUser:
        raise HTTPException(status_code=404, detail="No user exist with this email ")

    token = generate_token(data.email)
    resetLink = f"{CORS_ORIGIN}/resetpassword/{token}"
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
    result = send_email(data.email, subject, body)
    if not result.get("sent"):
        raise HTTPException(status_code=502, detail=result["message"])
    return {"message": "reset link sent successfully"}


async def resetPassword(data: ResetPasswordReq):
    """Verify the emailed token and store the new bcrypt-hashed password."""
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


# ---- helpers: attach related documents, imported by other controllers ----

async def getRoleData(user):
    """Attach {"role": {"name": ...}} to a user; None if the role is gone."""
    if "roleId" in user:
        role = await role_collection.find_one({"_id": ObjectId(user["roleId"])})
        user["role"] = {"name": role["name"]} if role else None
    else:
        user["role"] = None
    return user


async def getCategoryData(expense):
    """Attach {"category": {"name": ...}} to an expense; None if it's gone."""
    if "categoryId" in expense:
        category = await category_collection.find_one(
            {"_id": ObjectId(expense["categoryId"])}
        )
        expense["category"] = {"name": category["name"]} if category else None
    else:
        expense["category"] = None
    return expense
