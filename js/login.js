// ทำให้แน่ใจว่าโหลดโครงสร้าง HTML เสร็จก่อนเริ่มผูก Event
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. จัดการ Event ของฟอร์ม Login
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // ป้องกันหน้าเว็บ Refresh

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                // ยิง API ไปยังระบบ Login
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // สำเร็จ: เก็บ Token ไว้ใน LocalStorage
                    localStorage.setItem('authToken', data.token);
                    alert(`Welcome back, ${data.user.username}!`);
                    
                    // Redirect ไปยังหน้า shop
                    window.location.href = 'shop.html'; 
                } else {
                    // ไม่สำเร็จ: รหัสผ่านผิด หรือ ไม่มีอีเมล
                    alert(data.error);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                alert('Server is down or unreachable.');
            }
        });
    }

    // ==========================================
    // 2. จัดการ Event ของฟอร์ม Register
    // ==========================================
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // อ้างอิงฟังก์ชันแยกออกมา เพื่อความเป็นระเบียบและนำไป Reuse ได้
        registerForm.addEventListener('submit', handleUserRegistration);
    }
});

// ==========================================
// 3. ฟังก์ชันจัดการ Logic ลงทะเบียนผู้ใช้งาน
// ตำแหน่ง: วางไว้นอก DOMContentLoaded เพื่อแยก Scope การทำงานให้ชัดเจน
// ==========================================

/**
 * ส่งข้อมูลการลงทะเบียนไปยัง Backend และจัดการ Response
 * @param {Event} e - Event object จาก form submission
 */
async function handleUserRegistration(e) {
    e.preventDefault(); // หยุดการส่งฟอร์มเพื่อไม่ให้หน้า Refresh

    // ดึงค่าจาก Input fields (สมมติว่า HTML ใช้ ID เหล่านี้)
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value; 
    const confirmPassword = document.getElementById('registerConfirmPassword').value; 

    // --- ส่วนที่ 1: Frontend Validation ---
    
    // 1.1 เช็คว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return; // หยุดการทำงานทันที
    }

    // 1.2 เช็คเงื่อนไขรหัสผ่าน: >= 8 ตัวอักษร, 1 ตัวพิมพ์ใหญ่, 1 อักขระพิเศษ
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).{8,}$/;
    if (!passwordRegex.test(password)) {
        alert("Password Requirement Error: รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร, ประกอบด้วยตัวพิมพ์ใหญ่ 1 ตัว และอักขระพิเศษ 1 ตัว"); //
        return;
    }

    // --- ส่วนที่ 2: API Call ---
    try {
        // ยิง Request แบบ POST ไปยัง /api/auth/register
        // ใช้ Base URL ให้สอดคล้องกับฝั่ง Login (http://localhost:3000)
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        // --- ส่วนที่ 3: Response Handling ---
        if (response.status === 201) {
            // สำเร็จ (201 Created)
            alert("Registration successful! You can now log in.");
            
            // รีเซ็ตฟอร์มหลังจากสมัครสำเร็จ
            document.getElementById('register-form').reset(); 
            
            // สลับหน้าจอผู้ใช้กลับไปยังหน้า Login
            // โดยเรียกใช้ฟังก์ชัน toggleAuth ที่มีอยู่แล้ว
            window.toggleAuth('login'); 
            
        } else if (response.status === 409) {
            // อีเมลมีอยู่ในระบบแล้ว (409 Conflict)
            alert("Username already taken. Please try a different email."); //
            
        } else {
            // จัดการ Error อื่นๆ เช่น 400 Bad Request
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'Validation issues occurred.'}`);
        }

    } catch (error) {
        console.error('Registration API Error:', error);
        alert('Server is down or unreachable.');
    }
}

// ==========================================
// 4. ฟังก์ชันสลับหน้า Login / Register
// ==========================================
window.toggleAuth = function(view) {
    const loginSection = document.getElementById('login-section'); 
    const registerSection = document.getElementById('register-section'); 

    if (view === 'register') {
        loginSection.classList.add('hidden'); 
        registerSection.classList.remove('hidden'); 
    } else {
        registerSection.classList.add('hidden'); 
        loginSection.classList.remove('hidden'); 
    }
};