import cloudinary
from cloudinary.uploader import upload

cloudinary.config(
    cloud_name = "dpy6fpeqe",
    api_key="954731188742773",
    api_secret="DB8lzyKD0-adtYhUlbyKl_C1jQo"
)

#util functionn...

async def uploadImage(image):
    result = upload(image)
    print("cloundianry response,",result)
    return result["secure_url"] #string
    