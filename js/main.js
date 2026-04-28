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

        // Data Flow Step 3: Parse the JSON
        // We extract the raw text from the response and parse it into a native JavaScript Array.
        const productsData = await response.json();

        // Data Flow Step 4: Pass data to the UI layer
        // We hand the processed array over to the renderUI function.
        renderUI(productsData);

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

// 3. INITIALIZATION
// Wait for the HTML document to be fully loaded before starting the sequence.
document.addEventListener('DOMContentLoaded', requestProducts);


// Utility function for your "Add to Cart" button
function addToCart(event, productId) {
    event.preventDefault(); 
    console.log(`Adding product ${productId} to cart...`);
    // Future Cart Logic will go here
}