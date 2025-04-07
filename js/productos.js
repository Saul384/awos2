document.addEventListener('DOMContentLoaded', function () {
    const API_URL = "http://127.0.0.1:8000/productos";
    const API_CATEGORIAS = "http://127.0.0.1:8000/categorias";
    const form = document.getElementById('productForm');
    const tableBody = document.getElementById('productTableBody');
    const categoriaSelect = document.getElementById('id_cat');

    obtenerProductos();
    cargarCategorias();

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const producto = {
            nom_prod: document.getElementById("nom_prod").value,
            pre_prod: parseFloat(document.getElementById("pre_prod").value),
            desc_prod: document.getElementById("desc_prod").value,
            img_prod: document.getElementById("img_prod").value,
            estatus_prod: 1,
            id_cat: document.getElementById("id_cat").value,
            stock_prod: parseInt(document.getElementById("stock_prod").value)
        };

        if (document.getElementById("estatus_prod").checked) {
            producto.estatus_prod = 1;
        } else {
            producto.estatus_prod = 0;
        }

        if (!producto.img_prod) {
            producto.img_prod = null;
        }

        if (!producto.id_cat) {
            producto.id_cat = null;
        }

        await crearProducto(producto);
        form.reset();
        obtenerProductos();
    });

    async function cargarCategorias() {
        try {
            const response = await fetch(API_CATEGORIAS);
            if (!response.ok) {
                throw new Error("Error al obtener categorías");
            }

            const data = await response.json();
            const categorias = data.categorias || [];

            categoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_cat;
                option.textContent = cat.nom_cat;
                categoriaSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    }

    async function obtenerProductos() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener productos');
            }

            const data = await response.json();
            let productos = [];

            if (data.estatus === 'exitoso' && data.productos) {
                productos = data.productos;
            } else if (Array.isArray(data)) {
                productos = data;
            } else if (data.data) {
                productos = data.data;
            }

            tableBody.innerHTML = "";

            if (productos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9">No hay productos disponibles</td></tr>';
                return;
            }

            productos.forEach(function(producto) {
                let id = 'N/A';
                if (producto.id_producto) {
                    id = producto.id_producto;
                } else if (producto.id_prod) {
                    id = producto.id_prod;
                }

                let nombre = 'Sin nombre';
                if (producto.nombre_producto) {
                    nombre = producto.nombre_producto;
                } else if (producto.nom_prod) {
                    nombre = producto.nom_prod;
                }

                let precio = 0;
                if (producto.precio_producto) {
                    precio = producto.precio_producto;
                } else if (producto.pre_prod) {
                    precio = producto.pre_prod;
                }

                let descripcion = 'Sin descripción';
                if (producto.descripcion_producto) {
                    descripcion = producto.descripcion_producto;
                } else if (producto.desc_prod) {
                    descripcion = producto.desc_prod;
                }

                let stock = 0;
                if (producto.stock_producto) {
                    stock = producto.stock_producto;
                } else if (producto.cant_inv) {
                    stock = producto.cant_inv;
                }

                let categoria = 'Sin categoría';
                if (producto.categoria_prod) {
                    categoria = producto.categoria_prod;
                } else if (producto.nom_cat) {
                    categoria = producto.nom_cat;
                }

                let estado = 0;
                if (producto.estatus_producto !== undefined) {
                    estado = producto.estatus_producto;
                } else if (producto.estatus_prod !== undefined) {
                    estado = producto.estatus_prod;
                }

                let estadoClass = '';
                let estadoText = '';
                if (estado) {
                    estadoClass = 'bg-success';
                    estadoText = 'Activo';
                } else {
                    estadoClass = 'bg-secondary';
                    estadoText = 'Inactivo';
                }

                let imagenHTML = 'Sin imagen';
                if (producto.imagen_producto) {
                    imagenHTML = `<img src="${producto.imagen_producto}" width="50" class="img-thumbnail">`;
                } else if (producto.img_prod) {
                    imagenHTML = `<img src="${producto.img_prod}" width="50" class="img-thumbnail">`;
                }

                let row = `
                    <tr>
                        <td>${id}</td>
                        <td>${nombre}</td>
                        <td>$${precio}</td>
                        <td>${descripcion}</td>
                        <td>${stock}</td>
                        <td>${categoria}</td>
                        <td><span class="badge ${estadoClass}">${estadoText}</span></td>
                        <td>${imagenHTML}</td>
                        <td>
                            <button onclick="editarProducto(${id})" class="btn btn-warning btn-sm">Editar</button>
                            <button onclick="eliminarProducto(${id})" class="btn btn-danger btn-sm">Eliminar</button>
                            <button onclick="cambiarEstado(${id})" class="btn btn-info btn-sm">
                                ${estado ? 'Desactivar' : 'Activar'}
                            </button>
                        </td>
                    </tr>`;

                tableBody.insertAdjacentHTML('beforeend', row);
            });

        } catch (error) {
            console.error("Error al obtener productos:", error);
            tableBody.innerHTML = '<tr><td colspan="9" class="text-danger">Error al cargar productos: ' + error.message + '</td></tr>';
        }
    }

    async function crearProducto(producto) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(producto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el producto');
            }

            const data = await response.json();
            let nombreProducto = 'Nuevo producto';

            if (producto.nom_prod) {
                nombreProducto = producto.nom_prod;
            }

            alert('Producto "' + nombreProducto + '" creado exitosamente!');
            return data;
        } catch (error) {
            console.error("Error al crear el producto:", error);
            alert("Error: " + error.message);
            throw error;
        }
    }

    async function cambiarEstado(id_prod) {
        if (!confirm('¿Estás seguro de cambiar el estado de este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/estado/${id_prod}`, {
                method: "PATCH",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar el estado');
            }

            const data = await response.json();
            if (data.mensaje) {
                alert(data.mensaje);
            } else {
                alert('Estado cambiado correctamente');
            }
            obtenerProductos();
        } catch (error) {
            console.error('Error al cambiar el estado del producto:', error);
            alert('Error: ' + error.message);
        }
    }

    async function eliminarProducto(id_prod) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id_prod}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el producto');
            }

            const data = await response.json();
            if (data.mensaje) {
                alert(data.mensaje);
            } else {
                alert('Producto eliminado correctamente');
            }
            obtenerProductos();
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            alert('Error: ' + error.message);
        }
    }

    async function editarProducto(id) {
        window.location.href = 'editarProducto.html?id_prod=' + id;
    }

    window.editarProducto = editarProducto;
    window.eliminarProducto = eliminarProducto;
    window.cambiarEstado = cambiarEstado;
});
