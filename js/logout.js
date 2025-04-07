$(document).ready(function () {
    $("#logout").click(function () {
        let token = localStorage.getItem("token");
        if (!token) {
            alert("No hay sesion activa.");
            location.reload(); // Recarga la página actual
            return;
        }

        fetch("http://localhost:8000/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json();
            })
            .then((data) => {
                localStorage.clear();
                alert(data.mensaje || "Sesion cerrada correctamente.");
                window.location.href = '../index.html';
                //location.reload(); // Recarga la página actual después de cerrar sesión
            })
            .catch((error) => {
                console.error("Error:", error);
                localStorage.clear();
                alert("Error al cerrar sesion. Recargando...");
                window.location.href = '../index.html'; // Recarga incluso si hay error
            });
    });
});