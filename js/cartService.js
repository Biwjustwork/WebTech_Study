// js/cartService.js

/**
 * ฟังก์ชันหลักในการจัดการตะกร้า (ครอบคลุมขั้นตอนที่ 2 ถึง 6)
 * @param {string} id - รหัสสินค้าที่ส่งเข้ามา
 */
function handleAddToCart(id) {
    // ขั้นตอนที่ 2: โหลด cart array ใน local storage 
    // ใช้ JSON.parse เพื่อแปลง String กลับเป็น Array (ถ้าไม่มีข้อมูลให้คืนค่าเป็น Array ว่าง [])
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // ขั้นตอนที่ 3: เช็ก ID product นั้นว่าเคยอยู่ใน cart array ไหม
    // เราใช้ .findIndex() เพื่อหาว่าสินค้านั้นอยู่ตำแหน่ง (index) ไหนใน Array
    const existingProductIndex = cart.findIndex(item => item.id === id);

    if (existingProductIndex !== -1) {
        // ขั้นตอนที่ 4.1: ถ้ามีอยู่แล้วให้เพิ่ม quantity +1
        cart[existingProductIndex].quantity += 1;
    } else {
        // ขั้นตอนที่ 4.2: ถ้าไม่มี ให้เพิ่ม product นั้นลงใน cart array โดยมี quantity = 1
        cart.push({ id: id, quantity: 1 });
    }

    // ขั้นตอนที่ 5: ทำการ save cart array ใน local storage
    // ต้องแปลง Array กลับเป็น String ด้วย JSON.stringify ก่อนบันทึก
    localStorage.setItem('shoppingCart', JSON.stringify(cart));

    // ขั้นตอนที่ 6: update cart array (อัปเดต UI หรือ State อื่นๆ)
    updateCartUI(cart);
    
    console.log("Cart Updated in LocalStorage:", cart);
}

/**
 * ฟังก์ชันสำหรับอัปเดต UI ของตะกร้า (ตัวอย่างการนำไปใช้ในขั้นตอนที่ 6)
 */
function updateCartUI(cart) {
    // ใช้ .reduce() เพื่อคำนวณจำนวนชิ้น (Quantity) ของสินค้าทั้งหมดในตะกร้า
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log(`ตอนนี้มีสินค้าในตะกร้าทั้งหมด ${totalItems} ชิ้น`);
    
    // TODO: ในอนาคตถ้าคุณมีไอคอนตะกร้าบน Navbar (เช่น <span id="cart-badge">0</span>)
    // คุณสามารถเอาคอมเมนต์ด้านล่างออกเพื่ออัปเดตตัวเลขได้เลย
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.innerText = totalItems;
    }
}

/**
 * ฟังก์ชันเริ่มต้น ผูก Event Listener
 */
function initCartService() {
    const catalogContainer = document.getElementById('product-container');
    
    if (catalogContainer) {
        catalogContainer.addEventListener('click', function(event) {
            const addToCartBtn = event.target.closest('.add-to-cart');
            
            if (addToCartBtn) {
                event.preventDefault(); 
                
                const productId = addToCartBtn.getAttribute('data-id');
                
                // 1. จัดการข้อมูลหลังบ้าน (ตะกร้า)
                handleAddToCart(productId);

                // --- เพิ่มใหม่: จัดการเอฟเฟกต์ (Animation) ---
                // 2. หารูปภาพของสินค้าที่ถูกคลิก (วิ่งขึ้นไปหาคลาส .fruite-item แล้วทะลุลงไปหาแท็ก img)
                const productCard = addToCartBtn.closest('.fruite-item');
                const productImg = productCard ? productCard.querySelector('img') : null;
                
                // 3. หาไอคอนตะกร้าที่อยู่บน Navbar
                const cartIcon = document.querySelector('.fa-shopping-bag'); 
                
                // 4. สั่งให้รูปภาพลอยไปหาตะกร้า
                if (productImg && cartIcon) {
                    flyToCart(productImg, cartIcon);
                }
            }
        });
    }

    const initialCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    updateCartUI(initialCart);
}

/**
 * ฟังก์ชันสร้างแอนิเมชันรูปภาพลอยเข้าตะกร้า
 * @param {HTMLElement} sourceImg - รูปภาพสินค้าต้นทาง
 * @param {HTMLElement} targetEl - ไอคอนตะกร้าปลายทาง
 */
function flyToCart(sourceImg, targetEl) {
    if (!sourceImg || !targetEl) return;

    const startRect = sourceImg.getBoundingClientRect();
    const endRect = targetEl.getBoundingClientRect();

    const flyingImg = sourceImg.cloneNode();
    
    // 💡 เพิ่มบรรทัดนี้: ลบคลาสของ Bootstrap ที่ติดมา (เช่น w-100, img-fluid) 
    // เพื่อป้องกันไม่ให้รูปขยายเต็มหน้าจอ
    flyingImg.className = ''; 

    // กำหนดขนาดให้เท่ากับรูปในกล่องเป๊ะๆ
    flyingImg.style.position = 'fixed';
    flyingImg.style.top = `${startRect.top}px`;
    flyingImg.style.left = `${startRect.left}px`;
    flyingImg.style.width = `${startRect.width}px`;   // ล็อกความกว้าง
    flyingImg.style.height = `${startRect.height}px`; // ล็อกความสูง
    flyingImg.style.margin = '0';                     // เคลียร์ Margin
    flyingImg.style.objectFit = 'cover';
    flyingImg.style.borderRadius = '50%';
    flyingImg.style.zIndex = '9999';
    flyingImg.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    flyingImg.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    flyingImg.style.pointerEvents = 'none';           // ป้องกันเมาส์ไปโดนรูปตอนกำลังลอย

    document.body.appendChild(flyingImg);

    flyingImg.getBoundingClientRect(); // Force Reflow

    // เปลี่ยนค่าพิกัดให้เป็นปลายทาง
    flyingImg.style.top = `${endRect.top + (endRect.height / 2)}px`;
    flyingImg.style.left = `${endRect.left + (endRect.width / 2)}px`;
    flyingImg.style.width = '20px';
    flyingImg.style.height = '20px';
    flyingImg.style.opacity = '0';
    flyingImg.style.transform = 'translate(-50%, -50%)';

    setTimeout(() => {
        flyingImg.remove();
        
        targetEl.style.transform = 'scale(1.3)';
        targetEl.style.transition = 'transform 0.2s';
        setTimeout(() => {
            targetEl.style.transform = 'scale(1)';
        }, 200);

    }, 1000);
}

// สั่งให้ระบบตะกร้าทำงานเมื่อโหลด DOM เสร็จ
document.addEventListener('DOMContentLoaded', initCartService);