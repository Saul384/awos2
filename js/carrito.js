$(document).ready(function() {
    // Variables
    let cartItems = [];
    const cartBody = $('.cart-body');
    const emptyCartMsg = $('.empty-cart-message');
    const cartContent = $('.cart-content');

    // Cargar carrito desde localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            renderCart();
        } else {
            showEmptyCart();
        }
    }

    // Mostrar carrito vacío
    function showEmptyCart() {
        cartContent.addClass('hidden');
        emptyCartMsg.removeClass('hidden');
        updateOrderSummary();
    }

    // Renderizar carrito
    function renderCart() {
        if (cartItems.length === 0) {
            showEmptyCart();
            return;
        }

        cartContent.removeClass('hidden');
        emptyCartMsg.addClass('hidden');

        cartBody.empty();
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            cartBody.append(`
                <div class="cart-item grid grid-cols-12 gap-4 items-center py-4 border-b" data-id="${item.id}">
                    <div class="col-span-6 flex items-center">
                        <img src="../img/${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
                        <div>
                            <h3 class="font-medium">${item.name}</h3>
                            <button class="remove-item text-red-500 text-sm mt-1 hover:text-red-700">
                                <i class="fas fa-trash mr-1"></i> Eliminar
                            </button>
                        </div>
                    </div>
                    <div class="col-span-2 text-center">$${item.price.toLocaleString()}</div>
                    <div class="col-span-2 flex justify-center items-center">
                        <button class="decrease-qty px-2 py-1 bg-gray-200 rounded-l">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity w-12 text-center py-1 border-t border-b border-gray-300">
                        <button class="increase-qty px-2 py-1 bg-gray-200 rounded-r">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="col-span-2 text-right font-semibold">$${itemTotal.toLocaleString()}</div>
                </div>
            `);
        });

        updateOrderSummary();
    }

    // Actualizar resumen del pedido
    function updateOrderSummary() {
        if (cartItems.length === 0) {
            $('.subtotal').text('$0');
            $('.total').text('$0');
            return;
        }

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 10000 ? 0 : 500; // Envío gratis para compras mayores a $10,000
        const total = subtotal + shipping;

        $('.subtotal').text('$' + subtotal.toLocaleString());
        $('.shipping').text(shipping === 0 ? 'Gratis' : '$' + shipping.toLocaleString());
        $('.total').text('$' + total.toLocaleString());
    }

    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }

    // Eventos
    $(document).on('click', '.remove-item', function() {
        const itemId = $(this).closest('.cart-item').data('id');
        cartItems = cartItems.filter(item => item.id !== itemId);
        saveCart();
        renderCart();
    });

    $(document).on('click', '.decrease-qty', function() {
        const itemId = $(this).closest('.cart-item').data('id');
        const item = cartItems.find(item => item.id === itemId);

        if (item.quantity > 1) {
            item.quantity--;
            saveCart();
            renderCart();
        }
    });

    $(document).on('click', '.increase-qty', function() {
        const itemId = $(this).closest('.cart-item').data('id');
        const item = cartItems.find(item => item.id === itemId);

        item.quantity++;
        saveCart();
        renderCart();
    });

    $(document).on('change', '.quantity', function() {
        const itemId = $(this).closest('.cart-item').data('id');
        const item = cartItems.find(item => item.id === itemId);
        const newQuantity = parseInt($(this).val());

        if (!isNaN(newQuantity) && newQuantity >= 1) {
            item.quantity = newQuantity;
            saveCart();
            renderCart();
        } else {
            $(this).val(item.quantity);
        }
    });

    // Cargar carrito al iniciar
    loadCart();
});
