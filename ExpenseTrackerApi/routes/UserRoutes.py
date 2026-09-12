"""HTTP endpoints for users, login, password reset and admin stats.

All logic lives in UserController.
"""

from fastapi import APIRouter,BackgroundTasks
from controllers import UserController
from models.UserModel import User, UserOut, UserLogin,ResetPasswordReq,ForgotPasswordReq
from fastapi import File, Form, UploadFile, Depends
from typing import Optional

router = APIRouter()


@router.get("/users")
async def getAllUsers():
    """List every user, each with their role name."""
    return await UserController.getAllUsers()


@router.get("/user/{id}")
async def getUserById(id: str):
    """Fetch one user by id."""
    return await UserController.getUserById(id)


@router.get("/user/role/{id}")
async def getUserByRoleId(id: str):
    """List all users holding a given role."""
    return await UserController.getUserByRoleId(id)


@router.post("/user")
async def addUser(user: User):
    """Register a user from a JSON body (no profile image)."""
    return await UserController.addUser(user)

@router.post("/user/url")
async def addUserWithUrl(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    contact: str = Form(...),
    address: Optional[str] = Form(None),
    roleId: str = Form(...),
    image: UploadFile = File(...),
):
    """Register a user from form data, uploading the profile image to Cloudinary."""
    return await UserController.addUserWithUrl(
        name, email, password, contact, address, roleId, image
    )

@router.put("/user/{id}")
async def updateUser(
    id: str,
    name: str = Form(...),
    email: str = Form(...),
    contact: str = Form(...),
    address: Optional[str] = Form(None),
    roleId: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """Update a user's profile; a new image replaces the old one."""
    return await UserController.updateUser(
        id, name, email, contact, address, roleId, image
    )

@router.put("/user/role/{id}")
async def updateUserRole(id: str, user: User):
    """Change only a user's role (admin action)."""
    return await UserController.updateUserRole(id, user)

@router.delete("/user/{id}")
async def deleteUserById(id: str):
    """Delete a user, along with their expenses and budgets."""
    return await UserController.deleteUserById(id)

@router.post("/sendmail/{userId}")
async def sendMail(userId: str,background_tasks: BackgroundTasks, pdf: UploadFile = File(...)):
    """Queue an emailed copy of the user's expense report PDF."""
    print("....sending mail")
    return await UserController.sendMail(userId,pdf,background_tasks)


@router.post("/login/user")
async def loginUser(request: UserLogin):
    """Log in as any user."""
    return await UserController.loginUser(request)

@router.post("/login/admin")
async def loginUser(request: UserLogin):
    """Log in, but only if the account holds the admin role."""
    return await UserController.loginAdmin(request)



@router.post("/forgotpassword")
async def forgot_password(data:ForgotPasswordReq):
    """Email a time-limited password reset link."""
    return await UserController.forgotPassword(data)

@router.post("/resetpassword")
async def reset_password(data:ResetPasswordReq):
    """Set a new password using the token from the reset email."""
    return await UserController.resetPassword(data)


@router.get("/admindata")
async def getAdminData():
    """Dashboard stats: this month's totals and category breakdown."""
    return await UserController.getAdminData()
