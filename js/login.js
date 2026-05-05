// ทำให้แน่ใจว่าโหลดโครงสร้าง HTML เสร็จก่อนเริ่มผูก Event
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. จัดการ Event ของฟอร์ม Login
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // ป้องกันหน้าเว็บ Refresh[cite: 4]

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                // ยิง API ไปยังระบบ Login[cite: 4]
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // สำเร็จ: เก็บ Token ไว้ใน LocalStorage[cite: 4]
                    localStorage.setItem('authToken', data.token);
                    alert(`Welcome back, ${data.user.firstName}!`);
                    
                    // Redirect ไปยังหน้า shop[cite: 4]
                    window.location.href = 'shop.html'; 
                } else {
                    // ไม่สำเร็จ: รหัสผ่านผิด หรือ ไม่มีอีเมล[cite: 4]
                    alert(data.error);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                alert('Server is down or unreachable.');
            }
        });
    }

    // ==========================================
    // 2. จัดการ Event ของฟอร์ม Register[cite: 4]
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
    e.preventDefault(); // หยุดการส่งฟอร์มเพื่อไม่ให้หน้า Refresh[cite: 4]

    // ดึงค่าจาก Input fields (สมมติว่า HTML ใช้ ID เหล่านี้)
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value; //[cite: 4]
    const confirmPassword = document.getElementById('registerConfirmPassword').value; //[cite: 4]

    // --- ส่วนที่ 1: Frontend Validation ---
    
    // 1.1 เช็คว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่[cite: 4]
    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return; // หยุดการทำงานทันที
    }

    // 1.2 เช็คเงื่อนไขรหัสผ่าน: >= 8 ตัวอักษร, 1 ตัวพิมพ์ใหญ่, 1 อักขระพิเศษ
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#\$%\^&\*]).{8,}$/;
    if (!passwordRegex.test(password)) {
        alert("Password Requirement Error: รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร, ประกอบด้วยตัวพิมพ์ใหญ่ 1 ตัว และอักขระพิเศษ 1 ตัว"); //[cite: 2]
        return;
    }

    // --- ส่วนที่ 2: API Call ---
    try {
        // ยิง Request แบบ POST ไปยัง /api/auth/register
        // ใช้ Base URL ให้สอดคล้องกับฝั่ง Login (http://localhost:5000)
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        // --- ส่วนที่ 3: Response Handling ---
        if (response.status === 201) {
            // สำเร็จ (201 Created)[cite: 2]
            alert("Registration successful! You can now log in.");
            
            // รีเซ็ตฟอร์มหลังจากสมัครสำเร็จ
            document.getElementById('register-form').reset(); //[cite: 4]
            
            // สลับหน้าจอผู้ใช้กลับไปยังหน้า Login[cite: 2]
            // โดยเรียกใช้ฟังก์ชัน toggleAuth ที่มีอยู่แล้ว[cite: 4]
            window.toggleAuth('login'); 
            
        } else if (response.status === 409) {
            // อีเมลมีอยู่ในระบบแล้ว (409 Conflict)[cite: 2]
            alert("Username already taken. Please try a different email."); //[cite: 2]
            
        } else {
            // จัดการ Error อื่นๆ เช่น 400 Bad Request[cite: 2]
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
    const loginSection = document.getElementById('login-section'); //[cite: 4]
    const registerSection = document.getElementById('register-section'); //[cite: 4]

    if (view === 'register') {
        loginSection.classList.add('hidden'); //[cite: 4]
        registerSection.classList.remove('hidden'); //[cite: 4]
    } else {
        registerSection.classList.add('hidden'); //[cite: 4]
        loginSection.classList.remove('hidden'); //[cite: 4]
    }
};