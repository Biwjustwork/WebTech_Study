/**
 * Auth & Logout Management
 * จัดการสถานะการแสดงผลเมนู User และฟังก์ชันการ Logout
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. ค้นหา Element ของไอคอน User
    // *ข้อควรระวัง: ตรวจสอบให้แน่ใจว่าได้ใส่ id="user-icon-btn" ไว้ที่ปุ่มไอคอน user ในไฟล์ HTML
    const userIconBtn = document.getElementById('user-icon-btn'); 
    
    if (!userIconBtn) return; // ทำงานเฉพาะหน้าที่มีไอคอน User เท่านั้น

    // 2. สร้าง Container สำหรับ Mini Profile (Dropdown) แบบ Dynamic
    const profileDropdown = document.createElement('div');
    profileDropdown.id = 'user-profile-dropdown';
    // ใช้ Inline CSS เพื่อให้ชัวร์ว่า UI จะไม่เพี้ยน (หรือสามารถย้ายไปใส่ใน style.css ได้ครับ)
    profileDropdown.style.cssText = `
        position: absolute;
        right: 0;
        top: 120%;
        background: #fff;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: none;
        z-index: 9999;
        min-width: 220px;
    `;
    
    // ตั้งค่า Position ของ Parent ให้เป็น Relative เพื่อให้ Dropdown เกาะติดกับปุ่ม
    userIconBtn.parentElement.style.position = 'relative';
    userIconBtn.parentElement.appendChild(profileDropdown);

    // 3. ฟังก์ชันอัปเดตหน้าตา Mini Profile
    const updateProfileUI = () => {
        const authToken = localStorage.getItem('authToken');
        
        // สมมติว่าตอน Login คุณเก็บชื่อผู้ใช้ไว้ใน localStorage ด้วย key = 'user' แบบ JSON string
        // ตัวอย่าง: localStorage.setItem('user', JSON.stringify({ name: 'Somchai' }))
        const userStr = localStorage.getItem('user'); 
        let userName = 'Guest';

        if (authToken && userStr) {
            try {
                const userObj = JSON.parse(userStr);
                // ดึงชื่อออกมา (ขึ้นอยู่กับโครงสร้างที่คุณเก็บมาตาก Backend)
                userName = userObj.username || userObj.name || 'User'; 
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        if (authToken) {
            // สถานะ: Login แล้ว
            profileDropdown.innerHTML = `
                <div class="text-center mb-3">
                    <i class="fas fa-user-check fa-3x text-success mb-2"></i>
                    <h6 class="mb-0 text-dark">สวัสดี, <strong>${userName}</strong></h6>
                </div>
                <hr class="text-muted">
                <button id="logout-btn" class="btn btn-danger w-100 btn-sm rounded-pill">
                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                </button>
            `;

            // ผูก Event ให้ปุ่ม Logout
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            // สถานะ: ยังไม่ได้ Login
            profileDropdown.innerHTML = `
                <div class="text-center mb-3">
                    <i class="fas fa-user-circle fa-3x text-secondary mb-2"></i>
                    <h6 class="mb-0 text-muted">ผู้เยี่ยมชม (Guest)</h6>
                </div>
                <hr class="text-muted">
                <div class="d-flex flex-column gap-2">
                    <a href="login.html" class="btn btn-primary btn-sm w-100 rounded-pill">Login</a>
                    
                </div>
            `;
        }
    };

    // 4. ฟังก์ชันจัดการการ Logout
    const handleLogout = () => {
        // Best Practice: Clear auth credentials
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // ถ้าโปรเจกต์มีการเรียก Backend เพื่อทำ Blacklist Token (เช่น ระบบ JWT) ควรเพิ่ม Fetch API ตรงนี้ด้วย
        // fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` } });

        alert('ออกจากระบบสำเร็จ'); // อาจจะเปลี่ยนเป็น SweetAlert หรือ Toast UI เพื่อ UX ที่ดีขึ้น
        window.location.href = 'login.html';
    };

    // 5. เปิด-ปิด Dropdown เมื่อกดที่ไอคอน
    userIconBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateProfileUI(); // โหลดสถานะล่าสุดก่อนแสดงผล
        const isHidden = profileDropdown.style.display === 'none';
        profileDropdown.style.display = isHidden ? 'block' : 'none';
    });

    // 6. ปิด Dropdown เมื่อผู้ใช้คลิกพื้นที่อื่นบนหน้าจอ (Click Outside)
    document.addEventListener('click', (e) => {
        if (!userIconBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.style.display = 'none';
        }
    });

    // ทำการรันอัปเดต UI ครั้งแรกที่โหลดหน้า
    updateProfileUI();
});