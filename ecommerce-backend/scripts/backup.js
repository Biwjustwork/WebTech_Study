const fs = require('fs');
const path = require('path');

// กำหนดตำแหน่งไฟล์ต้นฉบับ และโฟลเดอร์ที่เก็บ Backup
const sourceFile = path.join(__dirname, '../data/store.db');
const backupDir = path.join(__dirname, '../data/backups');

// ตรวจสอบว่ามีโฟลเดอร์ Backup หรือยัง ถ้าไม่มีให้สร้างใหม่
if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir, { recursive: true });
}

// สร้างชื่อไฟล์ Backup โดยมีวันที่และเวลากำกับ
const dateStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const destFile = path.join(backupDir, `store-backup-${dateStr}.db`);

// ทำการ Copy ไฟล์
fs.copyFile(sourceFile, destFile, (err) => {
    if (err) {
        console.error('❌ Database Backup Failed:', err);
    } else {
        console.log(`✅ Database successfully backed up to: ${destFile}`);
    }
});