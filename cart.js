// Cart JavaScript for E-commerce Website

document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Display cart items
    displayCartItems(cart);
    
    // Update cart totals
    updateCartTotals(cart);
    
    // Check if cart is empty
    checkEmptyCart(cart);
    
    // Quantity controls
    document.querySelectorAll('.increment').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.qty-input');
            const productId = this.closest('.cart-item').getAttribute('data-id');
            updateCartItemQuantity(productId, parseInt(input.value) + 1);
            input.value = parseInt(input.value) + 1;
        });
    });
    
    document.querySelectorAll('.decrement').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.qty-input');
            const productId = this.closest('.cart-item').getAttribute('data-id');
            const newQuantity = Math.max(1, parseInt(input.value) - 1);
            updateCartItemQuantity(productId, newQuantity);
            input.value = newQuantity;
        });
    });
    
    // Quantity input changes
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.closest('.cart-item').getAttribute('data-id');
            const newQuantity = Math.max(1, parseInt(this.value) || 1);
            updateCartItemQuantity(productId, newQuantity);
            this.value = newQuantity;
        });
    });
    
    // Remove items
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.getAttribute('data-id');
            removeCartItem(productId);
            
            // Animation
            cartItem.classList.add('fade-out');
            setTimeout(() => {
                cartItem.remove();
                
                // Update after removal
                const updatedCart = JSON.parse(localStorage.getItem('cart')) || [];
                updateCartTotals(updatedCart);
                checkEmptyCart(updatedCart);
            }, 300);
        });
    });
    
    // Coupon application
    const couponForm = document.querySelector('.coupon');
    if (couponForm) {
        couponForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const couponCode = this.querySelector('input').value;
            applyCoupon(couponCode);
            this.querySelector('input').value = '';
        });
    }
    
    // Proceed to checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                e.preventDefault();
                showNotification('Your cart is empty!', 'error');
            }
        });
    }
});

// Display cart items
function displayCartItems(cart) {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;
    
    // Clear existing items (except empty message)
    document.querySelectorAll('.cart-item').forEach(item => item.remove());
    
    // Mock product data - replace with actual API call in production
    const products = {
        '1': { name: 'Wireless Headphones', price: 49.99, image: 'https://m.media-amazon.com/images/I/61gOCNIvudL._AC_SL1500_.jpg' },
        '2': { name: 'Smart Watch', price: 129.99, image: 'https://m.media-amazon.com/images/I/61ftG19NACL._AC_SL1500_.jpg' },
        '3': { name: 'Bluetooth Speaker', price: 79.99, image: 'https://m.media-amazon.com/images/I/71hvGkBMFNL._AC_SL1500_.jpg' },
        '4': { name: 'Wireless Earbuds', price: 89.99, image: 'https://via.placeholder.com/100' },
        '5': { name: 'Fitness Tracker', price: 59.99, image: 'https://via.placeholder.com/100' },
        '6': { name: 'Power Bank 20000mAh', price: 39.99, image: 'https://via.placeholder.com/100' }
    };
    
    // Add items to cart display
    cart.forEach(item => {
        const product = products[item.id];
        if (product) {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item fade-in';
            cartItem.setAttribute('data-id', item.id);
            
            cartItem.innerHTML = `
                <div class="item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="item-details">
                    <h3>${product.name}</h3>
                    <p class="item-price">$${product.price.toFixed(2)}</p>
                    <div class="item-actions">
                        <div class="quantity">
                            <button class="decrement">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="qty-input">
                            <button class="increment">+</button>
                        </div>
                        <button class="remove-btn">Remove</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.insertBefore(cartItem, document.querySelector('.empty-cart-message'));
        }
    });
    
    // Update item count display
    document.getElementById('item-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Update cart totals
function updateCartTotals(cart) {
    // Mock product data - replace with actual API call in production
    const products = {
        '1': 49.99,
        '2': 129.99,
        '3': 79.99,
        '4': 89.99,
        '5': 59.99,
        '6': 39.99
    };
    
    let subtotal = 0;
    
    cart.forEach(item => {
        if (products[item.id]) {
            subtotal += products[item.id] * item.quantity;
        }
    });
    
    // Calculate shipping (free over $50)
    const shipping = subtotal > 50 ? 0 : 5.99;
    
    // Calculate tax (8%)
    const tax = subtotal * 0.08;
    
    // Calculate total
    let total = subtotal + shipping + tax;
    
    // Apply discount if exists
    const discount = localStorage.getItem('cart-discount');
    if (discount) {
        const discountValue = parseFloat(discount);
        total -= discountValue;
    }
    
    // Update DOM
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
    
    // Update cart count in header
    updateCartCount();
}

// Check if cart is empty
function checkEmptyCart(cart) {
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
    } else {
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
    }
}

// Update cart item quantity in localStorage
function updateCartItemQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update totals
        updateCartTotals(cart);
    }
}

// Remove item from cart
function removeCartItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Remove discount if cart is now empty
    if (cart.length === 0) {
        localStorage.removeItem('cart-discount');
    }
    
    // Update cart count in header
    updateCartCount();
    
    // Show notification
    showNotification('Product removed from cart');
}

// Apply coupon code
function applyCoupon(code) {
    // In a real implementation, this would validate with your backend
    let discount = 0;
    let message = 'Invalid coupon code';
    
    // Mock coupon codes
    switch(code.toUpperCase()) {
        case 'DISCOUNT10':
            discount = calculateDiscount(10);
            message = '10% discount applied!';
            break;
        case 'FREESHIP':
            applyFreeShipping();
            message = 'Free shipping applied!';
            break;
        case 'SAVE20':
            discount = calculateDiscount(20);
            message = '20% discount applied!';
            break;
    }
    
    if (discount > 0) {
        localStorage.setItem('cart-discount', discount.toString());
        updateCartTotals(JSON.parse(localStorage.getItem('cart')) || []);
    }
    
    showNotification(message, discount > 0 ? 'success' : 'error');
}

function calculateDiscount(percent) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = {
        '1': 49.99, '2': 129.99, '3': 79.99, '4': 89.99, '5': 59.99, '6': 39.99
    };
    
    let subtotal = 0;
    cart.forEach(item => {
        if (products[item.id]) {
            subtotal += products[item.id] * item.quantity;
        }
    });
    
    return subtotal * (percent / 100);
}

function applyFreeShipping() {
    // This would be handled in the updateCartTotals function
    // We just need to store this preference
    localStorage.setItem('free-shipping', 'true');
    updateCartTotals(JSON.parse(localStorage.getItem('cart')) || []);
}