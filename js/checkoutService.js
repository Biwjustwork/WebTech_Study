document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    console.log("=== กดปุ่ม Place Order แล้ว! ===");

    // 1. ดึงข้อมูลตะกร้าสินค้าตามโครงสร้าง Key: shoppingCart ของคุณ
    const cartData = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    console.log("ข้อมูลตะกร้า:", cartData);

    if (cartData.length === 0) {
        alert("ตะกร้าสินค้าว่างเปล่า ไม่สามารถสั่งซื้อได้");
        return;
    }

    // 2. รวบรวมข้อมูลลูกค้าจากฟอร์ม
    const payload = {
        customer: {
            email: document.getElementById('email').value
            // เพิ่มฟิลด์อื่นๆ ตามฟอร์มของคุณ
        },
        cartItems: cartData // ส่ง Array [{"id":"1","quantity":2}] ไปยัง Backend
    };

    // 3. ส่งข้อมูล (Payload) ไปยัง Backend
    try {
        // ในไฟล์ checkoutService.js บรรทัดที่ 25
        const response = await fetch('http://localhost:5000/api/checkout', { // <-- เปลี่ยนตรงนี้
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            // ทำงานสำเร็จ เคลียร์ตะกร้าและเปลี่ยนหน้า
            alert("สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: " + result.orderId);
            localStorage.removeItem('shoppingCart'); 
            window.location.href = '/thankyou.html';
        } else {
            // แสดง Error หากฝั่ง Server ตรวจพบปัญหา
            alert("เกิดข้อผิดพลาด: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});