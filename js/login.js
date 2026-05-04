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
                const response = await fetch('http://localhost:5000/api/auth/login', {
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
                    alert(`Welcome back, ${data.user.firstName}!`);
                    
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
    // 2. จัดการ Event ของฟอร์ม Register (ตรวจสอบรหัสผ่าน)
    // ==========================================
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password !== confirmPassword) {
                e.preventDefault(); // หยุดการส่งฟอร์ม
                alert("Passwords do not match. Please try again.");
            } else {
                // TODO: ใส่ Logic สำหรับยิง API สมัครสมาชิกตรงนี้ในอนาคต
                e.preventDefault();
                alert("Ready to call Register API!");
            }
        });
    }
});

// ==========================================
// 3. ฟังก์ชันสลับหน้า Login / Register
// ==========================================
// นำมาประกาศไว้ด้านนอกและกำหนดลงระดับ window เพื่อให้ onclick ใน HTML เรียกใช้ได้
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