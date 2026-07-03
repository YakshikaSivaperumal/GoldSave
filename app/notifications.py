from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import requests
import random
import os

load_dotenv()

# ── Email Config ───────────────────────────────────────
mail_conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
)

# ── Notify.lk Config ───────────────────────────────────
NOTIFY_USER_ID = os.getenv("NOTIFY_USER_ID")
NOTIFY_API_KEY = os.getenv("NOTIFY_API_KEY")
NOTIFY_SENDER_ID = os.getenv("NOTIFY_SENDER_ID", "NotifyDEMO")
NOTIFY_URL = "https://app.notify.lk/api/v1/send"

# ── OTP Store (in memory) ──────────────────────────────
otp_store = {}

# ──────────────────────────────────────────────────────
# HELPER — Format Phone Number
# ──────────────────────────────────────────────────────

def format_phone_lk(phone: str) -> str:
    """
    Convert any SL format to 94XXXXXXXXX (Notify.lk format)
    07XXXXXXXX     → 947XXXXXXXX
    +947XXXXXXXX   → 947XXXXXXXX
    00947XXXXXXXX  → 947XXXXXXXX
    """
    phone = phone.strip().replace(" ", "")
    if phone.startswith("0094"):
        return phone[2:]        # 0094... → 94...
    if phone.startswith("+94"):
        return phone[1:]        # +94... → 94...
    if phone.startswith("07"):
        return "94" + phone[1:] # 07... → 947...
    return phone

# ──────────────────────────────────────────────────────
# CORE SMS SENDER
# ──────────────────────────────────────────────────────

def send_sms(phone: str, message: str):
    try:
        formatted = format_phone_lk(phone)
        params = {
            "user_id": NOTIFY_USER_ID,
            "api_key": NOTIFY_API_KEY,
            "sender_id": NOTIFY_SENDER_ID,
            "to": formatted,
            "message": message,
        }
        response = requests.get(NOTIFY_URL, params=params)
        data = response.json()

        if data.get("status") == "success":
            print(f"✅ SMS sent to {formatted}")
        else:
            print(f"❌ SMS failed: {data}")
    except Exception as e:
        print(f"❌ SMS error: {e}")

# ──────────────────────────────────────────────────────
# OTP FUNCTIONS
# ──────────────────────────────────────────────────────

def generate_otp(phone: str) -> str:
    otp = str(random.randint(100000, 999999))
    otp_store[phone] = otp
    print(f"OTP for {phone}: {otp}")  # remove in production
    return otp

def verify_otp(phone: str, otp: str) -> bool:
    stored = otp_store.get(phone)
    if stored and stored == otp:
        del otp_store[phone]
        return True
    return False

def send_otp_sms(phone: str) -> bool:
    try:
        otp = generate_otp(phone)
        send_sms(phone,
            f"Your GoldSave verification code is: {otp}. "
            f"Valid for 10 minutes. Do not share this code."
        )
        return True
    except Exception as e:
        print(f"OTP send error: {e}")
        return False

# ──────────────────────────────────────────────────────
# SMS NOTIFICATION FUNCTIONS
# ──────────────────────────────────────────────────────

def sms_registration_success(phone: str, name: str):
    send_sms(phone,
        f"Hi {name}, welcome to GoldSave! "
        f"Your account is ready. "
        f"Start investing in gold today!"
    )

def sms_investment_approved(phone: str, name: str, amount: float, grams: float):
    send_sms(phone,
        f"GoldSave: Hi {name}, your investment of "
        f"LKR {amount:,.2f} is APPROVED. "
        f"{grams}g gold added to your portfolio."
    )

def sms_investment_rejected(phone: str, name: str, amount: float):
    send_sms(phone,
        f"GoldSave: Hi {name}, your investment of "
        f"LKR {amount:,.2f} could not be verified. "
        f"Please resubmit with correct receipt."
    )

def sms_redemption_approved(phone: str, name: str, grams: float, amount: float):
    send_sms(phone,
        f"GoldSave: Hi {name}, your redemption of "
        f"{grams}g (LKR {amount:,.2f}) is APPROVED. "
        f"Our team will contact you shortly."
    )

def sms_redemption_rejected(phone: str, name: str, grams: float):
    send_sms(phone,
        f"GoldSave: Hi {name}, your redemption of "
        f"{grams}g has been rejected. "
        f"Contact support for assistance."
    )

# ──────────────────────────────────────────────────────
# EMAIL FUNCTIONS
# ──────────────────────────────────────────────────────

async def send_email(to: str, subject: str, body: str):
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[to],
            body=body,
            subtype="plain"
        )
        fm = FastMail(mail_conf)
        await fm.send_message(message)
        print(f"✅ Email sent to {to}")
    except Exception as e:
        print(f"❌ Email error: {e}")

async def email_registration_success(email: str, name: str):
    await send_email(
        to=email,
        subject="Welcome to GoldSave! 🥇",
        body=f"""Dear {name},

Welcome to GoldSave! Your registration was successful.

You can now:
  • Invest in gold starting from LKR 1,000
  • Track your portfolio in real time
  • View AI-powered gold price forecasts
  • Redeem your gold anytime

Login at: http://localhost:3000

Thank you for choosing GoldSave.

Best regards,
GoldSave Team
"""
    )