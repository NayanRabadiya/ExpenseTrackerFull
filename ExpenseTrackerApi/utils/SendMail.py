"""Sends password-reset and expense-report emails over SMTP."""

from fastapi import FastAPI
from typing import Optional
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from config.settings import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD

def send_email(to_email:str, subject:str, text:str,pdf_data:Optional[bytes]=None, filename:str = "expense_report.pdf"):
    """Send an HTML email, optionally with a PDF attached.

    Returns {"sent": bool, "message": str} rather than raising, so callers
    (including background tasks) can report failure instead of crashing.
    """

    msg = MIMEMultipart()
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(text, 'html'))
    
    if pdf_data:
        attachment = MIMEApplication(pdf_data, _subtype="pdf")
        attachment.add_header('Content-Disposition', 'attachment', filename=filename)
        msg.attach(attachment)
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
    except (smtplib.SMTPException, OSError) as e:
        # Callers decide how to report this; background tasks would otherwise fail silently.
        print(f"[SendMail] failed to send to {to_email}: {type(e).__name__}: {e}")
        return {"sent": False, "message": f"Email could not be sent: {e}"}

    return {"sent": True, "message": "Email sent successfully"}

# send_email("nayanrabadiya12@gmail.com","Account created successfully","Your account has been created successfully")