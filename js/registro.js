document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');

    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Obtener valores DIRECTAMENTE de los inputs
            const datos = {
                mail_usr: document.getElementById('mail_usr').value,
                pass_usr: document.getElementById('pass_usr').value
            };
            
            console.log('Datos obtenidos:', datos); // Verifica en consola

            // Validación simplificada
            if (!datos.mail_usr || !datos.pass_usr) {
                alert('Todos los campos son obligatorios');
                return;
            }

            fetch('http://127.0.0.1:8000/registro', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'successful') {
                    window.location.href = '../pages/login.html';
                } else {
                    alert(data.message || 'Error en el registro');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            });
        });
    }
});