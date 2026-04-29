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
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });

})(jQuery);
// เก็บข้อมูลสินค้าทั้งหมดไว้ใน Global State เพื่อใช้กรองข้อมูลได้ทันทีโดยไม่ต้อง Fetch ใหม่
let allProducts = [];
// เพิ่มตัวแปรสำหรับจัดการเวลา Delay (Debounce)
let searchTimeout = null;

/**
 * 1. ENTRY POINT: requestProducts()
 * This function is responsible for fetching the data from the server/file.
 * It strictly handles the network request and data parsing.
 */
async function requestProducts() {
    // Define the path to your JSON data
    const jsonPath = 'data/products.json';
    
    try {
        // Data Flow Step 1: Initiate network request
        // We use the browser's fetch() API to request the file. 
        // 'await' pauses this function until the network request completes.
        const response = await fetch(jsonPath);

        // Data Flow Step 2: Validate the response
        // If the server returns a 404 (Not Found) or 500 (Server Error), response.ok is false.
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allProducts = await response.json(); // บันทึกข้อมูลเข้า State
        renderUI(allProducts); // แสดงผลครั้งแรก (ทั้งหมด)
        
        setupEventListeners(); // ตั้งค่าปุ่มค้นหาและหมวดหมู่หลังจากโหลดข้อมูลเสร็จ

    } catch (error) {
        console.error('Network or parsing error:', error);
        
        // If an error occurs, we pass 'null' for data, and pass the error object
        // so the UI layer knows to display an error state.
        renderUI(null, error);
    }
}


/**
 * 2. PRESENTATION LAYER: renderUI()
 * This function receives pure data and is responsible only for updating the DOM.
 * * @param {Array|null} products - Array of product objects from JSON. Null if error occurred.
 * @param {Error|null} error - Error object if the fetch failed.
 */
function renderUI(products, error = null) {
    const container = document.getElementById('product-container');

    // Safety Check: Ensure the container exists before doing any work
    if (!container) {
        console.warn('Cannot render: #product-container not found in the DOM.');
        return;
    }

    // Data Flow Step 5: Handle the Error State visually
    // If the data is missing or an error was passed, render the fallback UI.
    if (error || !products) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h5 class="text-secondary">Oops! We couldn't load the products right now.</h5>
                <p>Please try refreshing the page or come back later.</p>
            </div>
        `;
        return;
    }

    // Data Flow Step 6: Transform Data into HTML String
    // We map through the array of product objects. For each object, we inject its
    // properties (name, price, image) into an HTML template literal.
    const productsHTML = products.map(product => `
        <div class="col-md-6 col-lg-6 col-xl-4" key="${product.id}">
            <div class="rounded position-relative fruite-item">
                <div class="fruite-img">
                    <img src="${product.image_url}" class="img-fluid w-100 rounded-top" alt="${product.name}">
                </div>
                <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${product.category}</div>
                <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="d-flex justify-content-between flex-lg-wrap">
                        <p class="text-dark fs-5 fw-bold mb-0">$${product.price.toFixed(2)} / ${product.unit}</p>
                        <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary" onclick="addToCart(event, ${product.id})">
                            <i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join(''); 

    // Data Flow Step 7: Paint the DOM
    // We inject the massive, single HTML string into the container. 
    // This triggers the browser to calculate layout and paint the 20 products onto the screen.
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
 * ฟังก์ชันหลักในการกรองข้อมูล (เพิ่มระบบ Delay และ Loading)
 * @param {string} type - 'category' หรือ 'keyword'
 * @param {string} value - ค่าที่ต้องการค้นหา
 */
function searchProducts(type, value) {
    // 1. เรียกใช้งาน UI โหลดข้อมูลทันทีที่มีการคลิกหรือพิมพ์
    showSearchLoading();

    // 2. ถ้ามีการค้นหาค้างอยู่ก่อนหน้านี้ ให้ยกเลิกทิ้ง (Debounce)
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // 3. เริ่มหน่วงเวลา (ตั้งไว้ที่ 800 มิลลิวินาที หรือ 0.8 วินาที)
    searchTimeout = setTimeout(() => {
        let filtered = [];
        const term = value.trim().toLowerCase();

        // ตรรกะการกรองข้อมูล (เหมือนของเดิม)
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
                    p.name.toLowerCase().includes(term) || 
                    p.description.toLowerCase().includes(term)
                );
            }
        }

        // 4. จัดการกรณี "ไม่พบสินค้า" ให้แสดง UI แทนการใช้ alert()
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
            return; // หยุดการทำงาน ไม่ต้องส่งไป renderUI
        }

        // 5. ส่งข้อมูลที่กรองเสร็จแล้วไปวาดบนหน้าเว็บ
        renderUI(filtered);

    }, 500); // <--- ปรับความช้า/เร็วของการ Load ได้ที่ตัวเลขนี้ (1000 = 1 วินาที)
}

/**
 * ตั้งค่า Event Listeners ทั้งหมดในจุดเดียว
 */
function setupEventListeners() {
    // 1. จัดการการคลิกหมวดหมู่
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            searchProducts('category', category);
        });
    });

    // 2. จัดการการค้นหาผ่าน Input Box
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
        // คลิกไอคอนค้นหา
        searchButton.addEventListener('click', () => {
            searchProducts('keyword', searchInput.value);
        });

        // ดักจับทุกครั้งที่มีการพิมพ์ (Real-time Search with Debouncing)
        searchInput.addEventListener('input', () => {
            // โค้ดนี้จะถูกเรียกทุกตัวอักษรที่พิมพ์
            // แต่ตัวฟังก์ชัน searchProducts มีกลไกเคลียร์เวลา (clearTimeout) 
            // ทำให้มันจะประมวลผลจริงๆ ก็ต่อเมื่อผู้ใช้หยุดพิมพ์ไปแล้ว 0.8 วินาที
            searchProducts('keyword', searchInput.value);
        });

        // (ทางเลือก) ยังคงเก็บการกด Enter ไว้เผื่อผู้ใช้ใจร้อนพิมพ์จบแล้วกด Enter ทันที
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรชถ้าอยู่ในฟอร์ม
                searchProducts('keyword', searchInput.value);
            }
        });
    }
}

// 3. INITIALIZATION
// Wait for the HTML document to be fully loaded before starting the sequence.
document.addEventListener('DOMContentLoaded', requestProducts);