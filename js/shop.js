(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);

    // Fixed Navbar
    $(window).scroll(function () {
        if ($(window).width() < 992) {
            if ($(this).scrollTop() > 55) {
                $('.fixed-top').addClass('shadow');
            } else {
                $('.fixed-top').removeClass('shadow');
            }
        } else {
            if ($(this).scrollTop() > 55) {
                $('.fixed-top').addClass('shadow').css('top', -55);
            } else {
                $('.fixed-top').removeClass('shadow').css('top', 0);
            }
        } 
    });
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // vegetable carousel
    $(".vegetable-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });

    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });

})(jQuery);

// ==========================================
// ส่วนเชื่อมต่อกับ E-commerce Backend
// ==========================================

// เก็บข้อมูลสินค้าทั้งหมดไว้ใน Global State เพื่อใช้กรองข้อมูลได้ทันที
let allProducts = [];
// เพิ่มตัวแปรสำหรับจัดการเวลา Delay (Debounce)
let searchTimeout = null;

/**
 * 1. ENTRY POINT: requestProducts()
 * ดึงข้อมูลจาก API Backend แทนการดึงจากไฟล์ Local JSON
 */
async function requestProducts() {
    // กำหนด URL ไปที่ Backend API ที่สร้างด้วย Node.js/Express
    const apiURL = 'http://localhost:5000/api/products';
    
    try {
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); 
        
        // Backend ของเราส่งข้อมูลในรูปแบบ { success: true, count: X, data: [...] }
        // จึงต้องเข้าถึง result.data (มี fallback ไว้กรณีส่งมาเป็น array เปล่าๆ)
        allProducts = result.data || result; 
        
        renderUI(allProducts); // แสดงผลครั้งแรก (ทั้งหมด)
        setupEventListeners(); // ตั้งค่าปุ่มค้นหาและหมวดหมู่หลังจากโหลดข้อมูลเสร็จ

    } catch (error) {
        console.error('Network or parsing error:', error);
        // แสดง UI Error หากไม่สามารถเชื่อมต่อ Backend ได้
        renderUI(null, error);
    }
}

/**
 * 2. PRESENTATION LAYER: renderUI()
 * นำข้อมูล Array ไปสร้างเป็น HTML
 */
function renderUI(products, error = null) {
    const container = document.getElementById('product-container');

    if (!container) {
        console.warn('Cannot render: #product-container not found in the DOM.');
        return;
    }

    if (error || !products) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h5 class="text-secondary">Oops! We couldn't load the products right now.</h5>
                <p>Please make sure your Node.js backend is running on port 5000.</p>
            </div>
        `;
        return;
    }

    const productsHTML = products.map(product => `
        <div class="col-md-6 col-lg-6 col-xl-4" key="${product.productId}"> <!-- แก้ไขเป็น product.productId -->
            <div class="rounded position-relative fruite-item">
                <div class="fruite-img">
                    <img src="${product.image_url || 'img/fruite-item-5.jpg'}" class="img-fluid w-100 rounded-top" alt="${product.name}">
                </div>
                <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${product.category || 'General'}</div>
                <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                    <h4>${product.name}</h4>
                    <p>${product.description || 'No description available'}</p>
                    <div class="d-flex justify-content-between flex-lg-wrap">
                        <p class="text-dark fs-5 fw-bold mb-0">$${parseFloat(product.price).toFixed(2)} / ${product.unit || 'kg'}</p>
                        <!-- แก้ไข data-id เป็น product.productId ตรงปุ่ม Add to cart -->
                        <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary add-to-cart" data-id="${product.productId}">
                            <i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join(''); 

    container.innerHTML = productsHTML;
}

/**
 * ฟังก์ชันแสดง UI กำลังโหลดระหว่างการค้นหา
 */
function showSearchLoading() {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5" style="min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h5 class="mt-3 text-secondary">กำลังค้นหาสินค้า...</h5>
            </div>
        `;
    }
}

/**
 * ฟังก์ชันหลักในการกรองข้อมูล (ทำงานฝั่ง Client เหมือนเดิม)
 */
function searchProducts(type, value) {
    showSearchLoading();

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        let filtered = [];
        const term = value.trim().toLowerCase();

        if (type === 'category') {
            filtered = (value === 'all') 
                ? allProducts 
                : allProducts.filter(p => p.category === value);
        } 
        else if (type === 'keyword') {
            if (!term) {
                filtered = allProducts;
            } else {
                filtered = allProducts.filter(p => 
                    (p.name && p.name.toLowerCase().includes(term)) || 
                    (p.description && p.description.toLowerCase().includes(term))
                );
            }
        }

        if (filtered.length === 0) {
            const container = document.getElementById('product-container');
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fa fa-search-minus fa-4x text-warning mb-3"></i>
                    <h4 class="text-secondary">ไม่พบสินค้า "${value}"</h4>
                    <p class="text-muted">ลองค้นหาด้วยคำอื่น หรือคลิกดูสินค้าทั้งหมดด้านล่าง</p>
                    <button class="btn btn-primary rounded-pill px-4 mt-3" onclick="searchProducts('category', 'all')">ดูสินค้าทั้งหมด</button>
                </div>
            `;
            return; 
        }

        renderUI(filtered);

    }, 500); 
}

/**
 * ตั้งค่า Event Listeners 
 */
function setupEventListeners() {
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            searchProducts('category', category);
        });
    });

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            searchProducts('keyword', searchInput.value);
        });

        searchInput.addEventListener('input', () => {
            searchProducts('keyword', searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                searchProducts('keyword', searchInput.value);
            }
        });
    }
}

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', requestProducts);