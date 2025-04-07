document.addEventListener('DOMContentLoaded', function() {
    // Simulación de carrito (deberías reemplazar esto con tu lógica real)
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [
        { nombre: 'Moto 1', cantidad: 1, precio: 5000 },
        { nombre: 'Moto 2', cantidad: 1, precio: 7000 }
    ];

    // Elementos del DOM
    const selectEnvio = document.getElementById('envio');
    const resumenTbody = document.querySelector('#resumen-pedido tbody');
    const costoEnvio = document.getElementById('costo-envio');
    const totalElement = document.getElementById('total');
    const btnConfirmar = document.getElementById('confirmar-compra');
    const tarjetaDetails = document.getElementById('tarjeta-details');

    // Mostrar/ocultar detalles de tarjeta según método de pago
    document.querySelectorAll('input[name="pago"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'tarjeta') {
                tarjetaDetails.style.display = 'block';
            } else {
                tarjetaDetails.style.display = 'none';
            }
        });
    });

    // Calcular subtotal
    function calcularSubtotal() {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    // Actualizar resumen del pedido
    function actualizarResumen() {
        resumenTbody.innerHTML = '';
        
        carrito.forEach(item => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
            `;
            resumenTbody.appendChild(fila);
        });

        const subtotal = calcularSubtotal();
        const envio = parseFloat(selectEnvio.value);
        const total = subtotal + envio;

        costoEnvio.textContent = `$${envio.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Evento para cambio en método de envío
    selectEnvio.addEventListener('change', actualizarResumen);

    // Validación básica de tarjeta
    function validarTarjeta() {
        const numTarjeta = document.getElementById('num-tarjeta').value.replace(/\s/g, '');
        const nombreTarjeta = document.getElementById('nombre-tarjeta').value;
        const expiracion = document.getElementById('expiracion').value;
        const cvv = document.getElementById('cvv').value;

        if (numTarjeta.length !== 16 || !/^\d+$/.test(numTarjeta)) {
            alert('Por favor ingresa un número de tarjeta válido (16 dígitos)');
            return false;
        }

        if (!nombreTarjeta.trim()) {
            alert('Por favor ingresa el nombre como aparece en la tarjeta');
            return false;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
            alert('Formato de fecha de expiración inválido (MM/AA)');
            return false;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            alert('CVV debe tener 3 o 4 dígitos');
            return false;
        }

        return true;
    }

    // Confirmar compra
    btnConfirmar.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validar términos
        if (!document.getElementById('terminos').checked) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        // Validar método de pago
        const metodoPago = document.querySelector('input[name="pago"]:checked').value;
        
        if (metodoPago === 'tarjeta' && !validarTarjeta()) {
            return;
        }

        // Validar información del cliente
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const direccion = document.getElementById('direccion').value;

        if (!nombre || !email || !direccion) {
            alert('Por favor completa toda la información requerida');
            return;
        }

        // Simular procesamiento
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = 'Procesando...';
        
        // Simular retraso de red
        setTimeout(() => {
            // Aquí iría la integración con pasarela de pago real
            alert('¡Compra confirmada con éxito! Serás redirigido a la página de confirmación.');
            
            // Limpiar carrito
            localStorage.removeItem('carrito');
            
            // Redirigir (simulado)
            window.location.href = 'confirmacion.html';
        }, 2000);
    });

    // Inicializar
    actualizarResumen();
});