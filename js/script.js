// Configuración de la API
const API_BASE_URL = 'http://localhost:8000'; // Reemplaza con la URL de tu API

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const productosContainer = document.querySelector('.productos');
    const searchIcon = document.getElementById('search-icon');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const cartCounter = document.createElement('span'); // Elemento para el contador
    
    // Crear e insertar el contador del carrito
    function setupCartCounter() {
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartCounter.className = 'absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center';
            cartCounter.id = 'cart-counter';
            cartBtn.appendChild(cartCounter);
            updateCartCounter();
        }
    }
    
    // Verificar estado de autenticación
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const isLoggedIn = token !== null;
        
        const cartBtn = document.getElementById('cart-btn');
        const profileBtn = document.getElementById('profile-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginBtn = document.getElementById('login-btn');
        
        if (cartBtn) {
            if (isLoggedIn) {
                cartBtn.classList.remove('hidden');
            } else {
                cartBtn.classList.add('hidden');
            }
        }
        
        if (profileBtn) {
            if (isLoggedIn) {
                profileBtn.classList.remove('hidden');
            } else {
                profileBtn.classList.add('hidden');
            }
        }
        
        if (logoutBtn) {
            if (isLoggedIn) {
                logoutBtn.classList.remove('hidden');
            } else {
                logoutBtn.classList.add('hidden');
            }
        }
        
        if (loginBtn) {
            if (isLoggedIn) {
                loginBtn.classList.add('hidden');
            } else {
                loginBtn.classList.remove('hidden');
            }
        }
        
        setupCartCounter();
    }
    
    // Función para cerrar sesión
    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        checkAuthStatus();
    }
    
    // Cargar productos desde la API
    async function loadProducts() {
        try {
            productosContainer.innerHTML = '<div class="text-center py-8">Cargando productos...</div>';
            
            const response = await fetch(`${API_BASE_URL}/catalogo`);
            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }
            
            const data = await response.json();
            
            if (data.estatus === 'exitoso' && data.productos.length > 0) {
                displayProducts(data.productos);
            } else {
                productosContainer.innerHTML = '<div class="text-center py-8">No hay productos disponibles</div>';
            }
        } catch (error) {
            console.error('Error:', error);
            productosContainer.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar productos: ' + error.message + '</div>';
        }
    }
    
    // Mostrar productos en el DOM
    function displayProducts(products) {
        productosContainer.innerHTML = '';
        
        products.forEach(function(product) {
            const productCard = document.createElement('div');
            productCard.className = 'producto bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105';
            productCard.dataset.id = product.id_prod;
            productCard.dataset.name = product.nom_prod;
            productCard.dataset.price = product.pre_prod;
            productCard.dataset.category = product.cat_id;
            
            const productImage = product.img_prod || 'img/placeholder.jpg';
            const productDescription = product.desc_prod || 'Sin descripción';
            const isAvailable = product.cant_inv > 0;
            
            productCard.innerHTML = `
                <img src="${productImage}" alt="${product.nom_prod}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="font-semibold text-lg">${product.nom_prod}</h3>
                    <p class="text-gray-600 text-sm my-2">${productDescription}</p>
                    <div class="flex justify-between items-center mt-4">
                        <span class="font-bold text-blue-900">$${product.pre_prod}</span>
                        <span class="text-sm ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 rounded-full">
                            ${isAvailable ? 'Disponible: ' + product.cant_inv : 'Agotado'}
                        </span>
                    </div>
                    <button class="add-to-cart mt-4 w-full ${isAvailable ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'} text-white px-4 py-2 rounded transition-colors">
                        ${isAvailable ? 'Agregar al carrito' : 'No disponible'}
                    </button>
                </div>
            `;
            
            productosContainer.appendChild(productCard);
        });
        
        setupAddToCartButtons();
    }
    
    // Configurar eventos para los botones de agregar al carrito
    function setupAddToCartButtons() {
        const buttons = document.querySelectorAll('.add-to-cart');
        
        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    alert('Debes iniciar sesión para agregar productos al carrito');
                    return;
                }
                
                if (button.textContent === 'No disponible') {
                    return;
                }
                
                const productCard = this.closest('.producto');
                const productId = productCard.dataset.id;
                const productName = productCard.dataset.name;
                const productPrice = parseFloat(productCard.dataset.price);
                
                addToCart(productId, productName, productPrice);
                
                button.textContent = '¡Agregado!';
                button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                button.classList.add('bg-green-500', 'hover:bg-green-600');
                
                setTimeout(function() {
                    button.textContent = 'Agregar al carrito';
                    button.classList.remove('bg-green-500', 'hover:bg-green-600');
                    button.classList.add('bg-blue-500', 'hover:bg-blue-600');
                }, 2000);
            });
        });
    }
    
    // Función para agregar productos al carrito
    function addToCart(productId, productName, productPrice) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let itemExists = false;
        
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id === productId) {
                cart[i].quantity += 1;
                itemExists = true;
                break;
            }
        }
        
        if (!itemExists) {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
    }
    
    // Actualizar contador del carrito
    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalItems = 0;
        
        for (let i = 0; i < cart.length; i++) {
            totalItems += cart[i].quantity;
        }
        
        const counterElement = document.getElementById('cart-counter');
        if (counterElement) {
            counterElement.textContent = totalItems;
            if (totalItems > 0) {
                counterElement.classList.remove('hidden');
            } else {
                counterElement.classList.add('hidden');
            }
        }
    }
    
    // Función de búsqueda mejorada
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            searchResults.innerHTML = '';
            return;
        }
        
        const productCards = document.querySelectorAll('.producto');
        let resultsHTML = '';
        let foundResults = false;
        
        productCards.forEach(function(card) {
            const name = card.dataset.name.toLowerCase();
            const category = card.dataset.category.toLowerCase();
            
            if (name.includes(searchTerm)) {
                resultsHTML += '<div class="p-2 hover:bg-gray-100 cursor-pointer">' + card.dataset.name + ' ($' + card.dataset.price + ')</div>';
                foundResults = true;
            } else if (category.includes(searchTerm)) {
                resultsHTML += '<div class="p-2 hover:bg-gray-100 cursor-pointer">' + card.dataset.name + ' ($' + card.dataset.price + ')</div>';
                foundResults = true;
            }
        });
        
        if (!foundResults) {
            resultsHTML = '<div class="p-2 text-gray-500">No se encontraron resultados</div>';
        }
        
        searchResults.innerHTML = resultsHTML;
        
        const resultItems = document.querySelectorAll('#search-results div');
        resultItems.forEach(function(result) {
            result.addEventListener('click', function() {
                const productName = this.textContent.split(' (')[0];
                const allProductCards = document.querySelectorAll('.producto');
                let productCard = null;
                
                for (let i = 0; i < allProductCards.length; i++) {
                    if (allProductCards[i].dataset.name === productName) {
                        productCard = allProductCards[i];
                        break;
                    }
                }
                
                if (productCard) {
                    productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    productCard.classList.add('ring-2', 'ring-blue-500');
                    
                    setTimeout(function() {
                        productCard.classList.remove('ring-2', 'ring-blue-500');
                    }, 2000);
                }
                
                searchContainer.style.display = 'none';
                searchInput.value = '';
                searchResults.innerHTML = '';
            });
        });
    }
    
    // Event Listeners
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    searchIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (searchContainer.style.display === 'block') {
            searchContainer.style.display = 'none';
        } else {
            searchContainer.style.display = 'block';
            searchInput.focus();
        }
    });
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    document.addEventListener('click', function(event) {
        if (!searchContainer.contains(event.target) && event.target !== searchIcon) {
            searchContainer.style.display = 'none';
        }
    });
    
    // Inicialización
    checkAuthStatus();
    loadProducts();
    updateCartCounter();
});