<div align="center">

# 📅 Appointment Booking System

[![Node.js Version](https://img.shields.io/badge/Node.js-v22.14.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v9.5.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-v9.0.3-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> **یک سیستم رزرو نوبت آنلاین قدرتمند، امن و مقیاس‌پذیر**  
> مناسب برای کلینیک‌ها، مراکز خدماتی، آرایشگاه‌ها، تعمیرگاه‌ها و هر کسب‌وکاری که نیاز به مدیریت نوبت‌دهی دارد.

</div>

---

## ✨ ویژگی‌های اصلی

| ویژگی | توضیحات |
|-------|---------|
| 🔐 **احراز هویت پیشرفته** | ثبت‌نام، ورود، تغییر رمز و حذف حساب با JWT و bcrypt |
| 👑 **سیستم نقش‌ها** | دو نقش `customer` و `admin` با دسترسی‌های متفاوت |
| 📦 **مدیریت سرویس‌ها** | CRUD کامل سرویس‌ها با قیمت، زمان و توضیحات |
| 🕒 **رزرو هوشمند** | تشخیص تداخل زمانی، محدودیت ۵ رزرو در روز |
| 📊 **فیلتر و جستجو** | جستجو بر اساس قیمت، وضعیت، نام سرویس و صفحه‌بندی |
| 🛡️ **Rate Limiting** | محافظت در برابر حملات Brute Force و DDoS |
| ✅ **اعتبارسنجی قدرتمند** | با Joi و خطاهای فارسی |
| 🔄 **تراکنش‌های اتمیک** | جلوگیری از تداخل همزمان با MongoDB Sessions |
| 📧 **داده‌های مرتبط** | Populate خودکار اطلاعات کاربر و سرویس |

---

## 🛠️ تکنولوژی‌های استفاده شده

<details>
<summary><b>📦 لیست کامل تکنولوژی‌ها (کلیک کنید)</b></summary>

| کتابخانه | نسخه | کاربرد |
|----------|------|--------|
| **Node.js** | v22.14.0 | Runtime Environment |
| **Express.js** | v5.2.1 | Web Framework |
| **MongoDB** | v9.5.0 (Mongoose) | Database |
| **jsonwebtoken** | v9.0.3 | Authentication |
| **bcrypt** | v6.0.0 | Password Hashing |
| **Joi** | v18.1.2 | Data Validation |
| **express-rate-limit** | v8.4.1 | Rate Limiting |
| **dotenv** | v17.4.2 | Environment Variables |

</details>

---

## 📋 پیش‌نیازها

قبل از نصب، مطمئن شوید این موارد را دارید:

- ✅ **Node.js** نسخه 14 یا بالاتر (توصیه: v22.14.0)
- ✅ **MongoDB** نصب شده (محلی یا Atlas)
- ✅ **Postman** برای تست API (اختیاری)
- ✅ **Git** برای کلون کردن پروژه

---

## 🚀 نصب و راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone https://github.com/Amoo-Amir/Appointment-Booking-System.git
cd Appointment-Booking-System

 نصب وابستگی‌ها
 npm install

 تنظیم متغیرهای محیطی
یک فایل .env در ریشه پروژه بسازید:
# Server Configuration
PORT=3008

# Database
MONGODB_URI=mongodb://localhost:27017/appointment-system

# Security
SECRET_KEYT=your_super_secret_jwt_key_here
ADMIN_SECRET_KEY=your_admin_secret_key_here

اجرای پروژه
# حالت توسعه (با nodemon - نیاز به نصب جداگانه)
npm run dev

# حالت تولید
npm start

🚀 Server running on http://localhost:3008
✅ Connected to MongoDB

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

👨‍💻 توسعه‌دهنده
(AmirMahdi Rahmati)

📧 Email: amirmahdiamirmahdi774@gmail.com

🐙 GitHub: @Amoo-Amir

 To-Do (ویژگی‌های آینده)
افزودن سیستمی برای یادآوری با ایمیل

پنل مدیریت پیشرفته با React

اضافه کردن تقویم تعاملی

پشتیبانی از پرداخت آنلاین

ایجاد API Documentation با Swagger

افزودن تست‌های واحد (Unit Tests)











</div>
