from fastapi import FastAPI
from typing import Optional
import smtplib 
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = "nayanrabadiya1313@gmail.com"
SMTP_PASSWORD = "llat osdt uxbb apxo"

def send_email(to_email:str, subject:str, text:str,pdf_data:Optional[bytes]=None, filename:str = "expense_report.pdf"):

    msg = MIMEMultipart()
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(text, 'plain'))
    
    if pdf_data:
        attachment = MIMEApplication(pdf_data, _subtype="pdf")
        attachment.add_header('Content-Disposition', 'attachment', filename=filename)
        msg.attach(attachment)
    
    print("all done")
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SMTP_EMAIL, SMTP_PASSWORD)
    server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
    server.quit()
    
    return {"message": "Email sent successfully"}

# send_email("nayanrabadiya12@gmail.com","Account created successfully","Your account has been created successfully")