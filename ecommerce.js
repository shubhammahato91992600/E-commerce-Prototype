// Main JavaScript File for E-commerce Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navbar = document.querySelector('.header .navbar');
    
    menuBtn.addEventListener('click', function() {
        navbar.classList.toggle('active');
        menuBtn.classList.toggle('fa-times');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header')) {
            navbar.classList.remove('active');
            menuBtn.classList.remove('fa-times');
        }
    });
    
    // Search Form Toggle
    const searchBtn = document.getElementById('search-btn');
    const searchForm = document.querySelector('.search-form');
    
    searchBtn.addEventListener('click', function() {
        searchForm.classList.toggle('active');
    });
    
    // Close search when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#search-btn') && !e.target.closest('.search-form')) {
            searchForm.classList.remove('active');
        }
    });
    
    // Initialize Swiper Sliders
    if (document.querySelector('.product-slider')) {
        const productSwiper = new Swiper('.product-slider', {
            loop: true,
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            }
        });
    }
    
    // Add to Cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            addToCart(productId);
            
            // Animation feedback
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
            }, 1000);
        });
    });
    
    // Quick View Modal
    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.closest('.product-card').getAttribute('data-id') || 
                             this.closest('.slide').getAttribute('data-id');
            showQuickView(productId);
        });
    });
    
    // Price Range Slider
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            document.getElementById('max-price').textContent = '$' + this.value;
            filterProductsByPrice(this.value);
        });
    }
    
    // Sort By Select
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
    
    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            subscribeToNewsletter(email);
            this.reset();
        });
    }
    
    // Initialize cart count
    updateCartCount();
    
    // Category Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            switchCategoryTab(category);
        });
    });
    
    // Initialize product filters
    if (document.querySelector('.products-container')) {
        initializeProductFilters();
    }
});

// Product Functions
function showQuickView(productId) {
    // In a real implementation, this would fetch product details from your database
    const product = getProductById(productId);
    
    // Create modal HTML
    const modalHTML = `
        <div class="quick-view-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="product-details">
                    <div class="product-images">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h2>${product.name}</h2>
                        <div class="price">$${product.price.toFixed(2)}</div>
                        <div class="rating">
                            ${getRatingStars(product.rating)}
                            <span>(${product.reviews} reviews)</span>
                        </div>
                        <p class="description">${product.description || 'No description available.'}</p>
                        <div class="actions">
                            <div class="quantity">
                                <button class="decrement">-</button>
                                <input type="number" value="1" min="1" class="qty-input">
                                <button class="increment">+</button>
                            </div>
                            <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.querySelector('.quick-view-modal .close-modal').addEventListener('click', closeQuickView);
    document.querySelector('.quick-view-modal .add-to-cart').addEventListener('click', function() {
        const qty = parseInt(document.querySelector('.quick-view-modal .qty-input').value);
        addToCart(product.id, qty);
        closeQuickView();
    });
    
    // Quantity controls
    document.querySelector('.quick-view-modal .increment').addEventListener('click', function() {
        const input = this.parentElement.querySelector('.qty-input');
        input.value = parseInt(input.value) + 1;
    });
    
    document.querySelector('.quick-view-modal .decrement').addEventListener('click', function() {
        const input = this.parentElement.querySelector('.qty-input');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
}

function closeQuickView() {
    document.querySelector('.quick-view-modal').remove();
}

function getProductById(id) {
    // Mock product data - replace with actual API call in production
    const products = {
        '1': { id: '1', name: 'Wireless Headphones', price: 49.99, rating: 4.5, reviews: 24, 
              image: 'https://via.placeholder.com/400', description: 'Premium wireless headphones with noise cancellation.' },
        '2': { id: '2', name: 'Smart Watch', price: 129.99, rating: 5, reviews: 42, 
              image: 'https://via.placeholder.com/400', description: 'Feature-rich smartwatch with health monitoring.' },
        // Add more products as needed
    };
    return products[id] || { id: '0', name: 'Product Not Found', price: 0, rating: 0, reviews: 0 };
}

function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

function filterProductsByPrice(maxPrice) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const price = parseFloat(product.querySelector('.product-price').textContent.replace('$', ''));
        if (price > maxPrice) {
            product.style.display = 'none';
        } else {
            product.style.display = 'block';
        }
    });
}

function sortProducts(sortBy) {
    const container = document.querySelector('.products-container');
    const products = Array.from(document.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        const aPrice = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
        const bPrice = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
        const aName = a.querySelector('.product-title').textContent;
        const bName = b.querySelector('.product-title').textContent;
        
        switch(sortBy) {
            case 'price-low': return aPrice - bPrice;
            case 'price-high': return bPrice - aPrice;
            case 'name-asc': return aName.localeCompare(bName);
            case 'name-desc': return bName.localeCompare(aName);
            default: return 0;
        }
    });
    
    // Reattach sorted products
    products.forEach(product => container.appendChild(product));
}

function initializeProductFilters() {
    // Set initial max price from slider
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        filterProductsByPrice(priceSlider.value);
    }
}

// Category Functions
function switchCategoryTab(category) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-category="${category}"]`).classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(category).classList.add('active');
    
    // Initialize slider for the active tab
    if (document.querySelector(`#${category} .product-slider`)) {
        new Swiper(`#${category} .product-slider`, {
            loop: true,
            spaceBetween: 20,
            navigation: {
                nextEl: `#${category} .swiper-button-next`,
                prevEl: `#${category} .swiper-button-prev`,
            },
            slidesPerView: 3,
            breakpoints: {
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }
}

// Newsletter Functions
function subscribeToNewsletter(email) {
    // In a real implementation, this would send to your backend
    console.log('Subscribing email:', email);
    showNotification('Thank you for subscribing to our newsletter!');
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification slide-down ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles dynamically if not already added
if (!document.getElementById('notification-styles')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notification-styles';
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1.5rem 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            font-size: 1.6rem;
            transform: translateY(-150%);
        }
        .notification.success {
            background: #28a745;
            color: white;
        }
        .notification.error {
            background: #dc3545;
            color: white;
        }
    `;
    document.head.appendChild(notificationStyles);
}

// Cart Functions (shared with cart.js)
function addToCart(productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity: quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.querySelectorAll('#cart-count').forEach(element => {
        element.textContent = totalItems;
    });
}