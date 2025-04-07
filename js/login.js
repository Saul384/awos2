$(document).ready(function () {
    $("#loginForm").submit(function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Obtener los valores del formulario
        let mail_usr = $("#mail_usr").val();
        let pass_usr = $("#pass_usr").val();

        // Realizar la solicitud con fetch
        fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mail_usr, pass_usr
            }) // Convertimos los datos a JSON
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la solicitud");
            }
            return response.json(); // Parseamos la respuesta como JSON
        })
        .then(data => {
            if (data.estatus === "exitoso") {
                let tipoUsuario = data.usuario.tip_usr; // Corregido para usar tip_usr en lugar de tipo_usuario
                console.log(data);

                // Guardamos el token en localStorage
                localStorage.setItem("token", data.token);

                // Redirigir según el tipo de usuario
                if (tipoUsuario === 0) {
                    window.location.href = "http://localhost/proyecto_mhs/motorheavenstore/pages/dashboard.html";
                } else if (tipoUsuario === 1) {
                    window.location.href = "http://localhost/proyecto_mhs/motorheavenstore/index.html";
                } else {
                    alert("Tipo de usuario desconocido.");
                }
            } else {
                // Mostrar mensaje de error
                alert(data.mensaje); // Usamos alert para mostrar el mensaje de error
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error en el servidor. Por favor, intenta de nuevo."); // Usamos alert para mostrar el error
        });
    });
});