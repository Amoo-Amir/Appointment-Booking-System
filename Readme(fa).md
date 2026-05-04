

# README

## 🎯 معرفی کلی
«Appointment Booking System» یک سیستم رزرو آنلاین است که به کاربران امکان می‌دهد:
- ثبت‌نام و ورود کنند
- سرویس جدید توسط ادمین ایجاد شود
- کاربران بتوانند زمان‌های آزاد را مشاهده و رزرو کنند
- رزروها را لغو یا تأیید (برای ادمین) نمایند

## 🚀 پیش‌نیازها
- Node.js (نسخه ≥ 14)  
- MongoDB (نسخه ≥ 4.x)  

## ⚙️ تنظیم متغیرهای محیطی
قبل از اجرا، یک فایل `.env` در ریشه پروژه بسازید و مقادیر زیر را قرار دهید:  
```
MONGO_URI = mongodb://localhost:27017/Reserving
PORT = 3008
SECRET_KEYT = AMIR12345
ADMIN_SECRET_KEY = AdMIN1234
```  
[1]

## 📦 نصب و اجرا
```bash
# دریافت بسته‌ها
npm install

# اجرای پروژه در حالت توسعه (با nodemon)
npm run dev

# یا اجرای ساده
node app.js
```

---

## 📝 مستندات API و تست با Postman

> برای مسیرهای نیازمند توکن (Protected) در تب **Authorization** گزینه **Bearer Token** را انتخاب و توکن دریافتی را وارد کنید.

---

### 1. احراز هویت (Auth)

| عملیات        | مسیر                                    | متد  | Body (JSON)                                          |
|---------------|-----------------------------------------|------|------------------------------------------------------|
| ثبت‌نام       | `/api/auth/register`                    | POST | `{ "fullName","email","password","phone","secretkey" }` |

| ورود          | `/api/auth/login`                       | POST | `{ "email","password" }`                             |

| پروفایل       | `/api/auth/profile`                     | GET  | — (نیاز به توکن)                                     |

| بروزرسانی پروفایل | `/api/auth/updateprofile/:id`       | PUT  | `{ "fullName","email","password","phone" }`           |

| تغییر رمز     | `/api/auth/changepassword?id=USER_ID`    | PUT  | `{ "oldpassword","newpassword","confrimNewPassword" }` |

| حذف حساب      | `/api/auth/deleteacc`                   | DELETE | `{ "email","password" }`                             |

> **نکته:** حتماً در Postman بعد از ورود، مقدار `token` را به‌عنوان Bearer Token درج کنید.

---

### 2. مدیریت سرویس‌ها (Service)

| عملیات                  | مسیر                                            | متد   | Body (JSON)                               |
|-------------------------|-------------------------------------------------|-------|-------------------------------------------|
| ایجاد سرویس (Admin)     | `/api/service/create-service-admin`             | POST  | `{ "name","description","duration","price","isAvailable" }` |
| لیست سرویس‌ها           | `/api/service/`                                 | GET   | —                                         |
| جزئیات سرویس            | `/api/service/:id`                              | GET   | —                                         |
| بروزرسانی سرویس (Admin) | `/api/service/update-service-admin/:id`         | PUT   | `{ "name","description","duration","price","isAvailable" }` |
| حذف سرویس (Admin)       | `/api/service/delete-service-admin/:id`         | DELETE| —                                         |
| تغییر وضعیت سرویس       | `/api/service/:id/toggle-availability`          | PATCH | —                                         |

> **تذکر:** مسیرهای مدیریتی حتماً نیاز به توکن ادمین دارند.

---

### 3. رزروها (Booking)

| عملیات                         | مسیر                                          | متد    | Body (JSON)                        |
|--------------------------------|-----------------------------------------------|--------|------------------------------------|
| ایجاد رزرو جدید                | `/api/booking/make-book`                      | POST   | `{ "serviceId","date","timeslot" }`|
| لغو رزرو                       | `/api/booking/cancel-book/:id`                | POST   | —                                  |
| تأیید رزرو (Admin)             | `/api/booking/confirm-booking/:id`            | POST   | —                                  |
| لیست رزروهای کاربر             | `/api/booking/get-mybookings?status=&page=&limit=` | GET | —                                  |
| جزئیات رزرو                   | `/api/booking/get-mybooking/:id`              | GET    | —                                  |
| مشاهده اسلات‌های آزاد          | `/api/booking/available-slots?serviceId=&date=`  | GET | —                                  |
| بروزرسانی رزرو (Pending)        | `/api/booking/update-booking/:id`             | PUT    | `{ "date","timeSlot","service" }`  |
| حذف رزرو                       | `/api/booking/delete-booking/:id`             | DELETE | —                                  |

---

## 📌 نکات نهایی
- برای هر درخواست از تب **Body** در Postman حالت **raw + JSON** را انتخاب کنید.  
- در صورت ارور اعتبارسنجی، پیام خطا در بدنه پاسخ بازگردانده می‌شود.  
- قبل از عملیات محافظت‌شده، حتماً متد ورود را تست و توکن دریافتی را ذخیره کنید.

---

<p align="center">موفق باشید! 🚀</p>