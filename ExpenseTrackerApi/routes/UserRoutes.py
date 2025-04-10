from fastapi import APIRouter,BackgroundTasks
from controllers import UserController
from models.UserModel import User, UserOut, UserLogin,ResetPasswordReq,ForgotPasswordReq
from fastapi import File, Form, UploadFile, Depends
from typing import Optional

router = APIRouter()


@router.get("/users")
async def getAllUsers():
    return await UserController.getAllUsers()


@router.get("/user/{id}")
async def getUserById(id: str):
    return await UserController.getUserById(id)


@router.get("/user/role/{id}")
async def getUserByRoleId(id: str):
    return await UserController.getUserByRoleId(id)


@router.post("/user")
async def addUser(user: User):
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
    return await UserController.updateUser(
        id, name, email, contact, address, roleId, image
    )

@router.put("/user/role/{id}")
async def updateUserRole(id: str, user: User):
    return await UserController.updateUserRole(id, user)

@router.delete("/user/{id}")
async def deleteUserById(id: str):
    return await UserController.deleteUserById(id)

@router.post("/sendmail/{userId}")
async def sendMail(userId: str,background_tasks: BackgroundTasks, pdf: UploadFile = File(...)):
    print("....sending mail")
    return await UserController.sendMail(userId,pdf,background_tasks)


@router.post("/login/user")
async def loginUser(request: UserLogin):
    return await UserController.loginUser(request)

@router.post("/login/admin")
async def loginUser(request: UserLogin):
    return await UserController.loginAdmin(request)



@router.post("/forgotpassword")
async def forgot_password(data:ForgotPasswordReq):
    return await UserController.forgotPassword(data)

@router.post("/resetpassword")
async def reset_password(data:ResetPasswordReq):
    return await UserController.resetPassword(data)


@router.get("/admindata")
async def getAdminData():
    return await UserController.getAdminData()



