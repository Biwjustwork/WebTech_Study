document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    console.log("=== กดปุ่ม Place Order แล้ว! ===");

    // 1. ดึง Token เพื่อยืนยันตัวตน
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
        window.location.href = '/login.html';
        return;
    }

    // 2. ดึงข้อมูลตะกร้าสินค้าตามโครงสร้าง Key: shoppingCart
    const cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    if (cartData.length === 0) {
        alert("ตะกร้าสินค้าว่างเปล่า ไม่สามารถสั่งซื้อได้");
        return;
    }

    // 3. รวบรวมข้อมูลลูกค้าจากฟอร์ม
    const payload = {
        customer: {
            email: document.getElementById('email').value 
        },
        cartItems: cartData 
    };

    // 4. ส่งข้อมูลไปยัง Backend
    try {
        const response = await fetch('http://localhost:3000/api/checkout', { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <-- เพิ่ม Token ตรงนี้
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert("สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: " + result.orderId);
            localStorage.removeItem('shoppingCart'); 
            window.location.href = '/shop.html';
        } else {
            alert("เกิดข้อผิดพลาด: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});