"""Uploads profile images to Cloudinary and returns their public URL."""

import cloudinary
from cloudinary.uploader import upload
from config.settings import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

cloudinary.config(
    cloud_name = CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

#util functionn...

async def uploadImage(image):
    """Upload a file object and return its hosted https URL."""
    result = upload(image)
    print("cloundianry response,",result)
    return result["secure_url"] #string
    