# 🔐 คู่มือการสร้างและเชื่อมต่อ Firebase (Google Login)

ระบบล็อกอินด้วย Google จำเป็นต้องใช้บริการฟรีของ **Firebase** ทำตาม 4 ขั้นตอนง่ายๆ ด้านล่างนี้เพื่อเปิดใช้งานครับ:

---

## ขั้นตอนที่ 1: สร้างโปรเจกต์ใน Firebase
1. ไปที่เว็บไซต์ [Firebase Console](https://console.firebase.google.com/) แล้วล็อกอินด้วยบัญชี Google ของคุณ (แนะนำให้ใช้บัญชีแอดมิน)
2. คลิกปุ่ม **"Create a project"** หรือ **"Add project"**
3. ตั้งชื่อโปรเจกต์ (เช่น `anuban-loei-port`) แล้วกด Continue
4. *(ถ้ามีให้เลือก Google Analytics)* จะปิดหรือเปิดก็ได้ แล้วกด **Create project**
5. รอสักครู่ เมื่อเสร็จแล้วกด **Continue** เพื่อเข้าสู่หน้าจัดการ

---

## ขั้นตอนที่ 2: เปิดระบบ Google Login (Authentication)
1. ในเมนูด้านซ้าย เลือก **Build** > **Authentication**
2. คลิกปุ่ม **Get Started**
3. ในแท็บ **Sign-in method** ให้คลิกที่ **Google**
4. กดเปิดสวิตช์ **Enable** ที่มุมขวาบน
5. ในช่อง **Project support email** ให้เลือกอีเมลของคุณ
6. กดปุ่ม **Save** (รอมันบันทึกจนเสร็จ)

---

## ขั้นตอนที่ 3: รับโค้ด Firebase Config
1. กลับไปที่หน้าหลักของโปรเจกต์ (กดรูปบ้าน 🏠 Project Overview มุมซ้ายบน)
2. ตรงกลางหน้าจอ จะมีข้อความว่า "Get started by adding Firebase to your app" ให้คลิกที่ไอคอน **</> (Web)**
3. ตั้งชื่อแอป (App nickname) เช่น `web-client` แล้วกด **Register app**
4. ในหน้าถัดมา คุณจะเห็นกล่องโค้ดที่มีหน้าตาประมาณนี้:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "anuban-loei-port.firebaseapp.com",
  projectId: "anuban-loei-port",
  storageBucket: "anuban-loei-port.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:12345:web:abcd..."
};
```
5. **คัดลอก (Copy)** เฉพาะส่วนที่เป็นบล็อก `const firebaseConfig = { ... }` เอาไว้

---

## ขั้นตอนที่ 4: นำโค้ดมาใส่ในเว็บของเรา
1. เปิดไฟล์ [src/lib/firebase.js](file:///D:/dashboard%20school/ระบบเก็บเกีบนติบัตร/src/lib/firebase.js) ในโปรเจกต์นี้
2. หาบรรทัดที่ 4 ซึ่งเขียนว่า:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  // ...
};
```
3. ลบของเก่าออก แล้ว **วาง (Paste)** โค้ดที่คุณคัดลอกมาจาก Firebase ลงไปแทนที่
4. บันทึกไฟล์ (Save) 
5. ลองรีเฟรชหน้าเว็บแล้วกดล็อกอิน ระบบล็อกอิน Google ก็จะใช้งานได้ทันทีครับ! 🎉

> **หมายเหตุ:** แอดมินของระบบคือ `thememory003@gmail.com` และ `thememory006@gmail.com` (ตั้งค่าเรียบร้อยแล้ว) เมื่อ 2 อีเมลนี้ล็อกอิน จะมีสิทธิ์เข้าถึงเมนู "ตั้งค่าระบบ" ได้ครับ
