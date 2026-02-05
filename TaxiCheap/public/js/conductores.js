import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCv3im6Uk2y0CwUFk98UD3pLGEUU9P2a8w",
    authDomain: "taxi-cheap.firebaseapp.com",
    projectId: "taxi-cheap",
    storageBucket: "taxi-cheap.firebasestorage.app",
    messagingSenderId: "1016802563845",
    appId: "1:1016802563845:web:1a34981181bd0bf1e7496c",
    measurementId: "G-17KZVVPTTV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables globales para manejar los datos y filtros en tiempo real
let todosLosConductores = [];

// 2. OBTENER LISTA DE CONDUCTORES
// 2. OBTENER LISTA DE CONDUCTORES (Modificado para traer vehículos)
// 2. OBTENER LISTA DE CONDUCTORES (Modificado para excluir al predeterminado)
async function obtenerConductores() {
    const conductoresRef = collection(db, "conductores");
    const snapshot = await getDocs(conductoresRef);

    // ID del conductor que quieres ocultar (puedes copiarlo desde Firebase Console)
    const ID_PREDETERMINADO = "conductoresId"; 

    // Filtramos los documentos antes de procesar las promesas de vehículos
    const docsFiltrados = snapshot.docs.filter(docSnap => docSnap.id !== ID_PREDETERMINADO);

    const conductoresPromesas = docsFiltrados.map(async (docSnap) => {
        const datosConductor = docSnap.data();
        let datosVehiculo = null;

        // Si el conductor tiene un vehiculoId, buscamos sus detalles
        if (datosConductor.vehiculoId) {
            const vehiculoRef = doc(db, "vehiculos", datosConductor.vehiculoId);
            const vehiculoSnap = await getDoc(vehiculoRef);
            if (vehiculoSnap.exists()) {
                datosVehiculo = vehiculoSnap.data();
            }
        }

        return {
            id: docSnap.id,
            ...datosConductor,
            vehiculo: datosVehiculo // Inyectamos el objeto vehículo aquí
        };
    });

    todosLosConductores = await Promise.all(conductoresPromesas);
    aplicarFiltros();
}

// 3. FUNCIÓN PARA RENDERIZAR (ahora tabla)
function renderizarConductores(lista) {
    const tbody = document.querySelector("#driversTable tbody");
    tbody.innerHTML = "";

    if (!lista.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="7" style="text-align:center; padding: 40px 12px; color:#6b7280;">No se encontraron conductores.</td>`;
        tbody.appendChild(tr);
        return;
    }

    lista.forEach((conductor) => {
        if (conductor.estado === false) return;

        const verificado = conductor.verificado ?? false;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="conductor-cell">
                    <img class="conductor-avatar" src="${conductor.foto_perfil || '/placeholder.svg'}" alt="Avatar">
                    <div class="conductor-meta">
                        <div class="conductor-name">${conductor.nombre_completo || 'Sin nombre'}</div>
                        
                    </div>
                </div>
            </td>
            <td>${conductor.email || 'N/A'}</td>
            <td>
                ${conductor.vehiculo
                            ? `<strong>${conductor.vehiculo.marca || 'S/M'}</strong>
                            <strong>${conductor.vehiculo.modelo || 'S/M'}</strong>
                    <div class="conductor-sub">${conductor.vehiculo.placa || ''}</div>`
                            : '<span style="color:#9ca3af;">Sin vehículo</span>'
                        }
            </td>
            <td style="font-weight:700;">${conductor.viajes || 0}</td>
            <td>${Number(conductor.calificacion || 0).toFixed(1)} <span class="rating">★</span></td>
            <td>${conductor.estado === false ? '<span class="status-badge status-inactive">Inactivo</span>' : verificado ? '<span class="status-badge status-verified">Verificado</span>' : '<span class="status-badge status-pending">Pendiente</span>'}</td>
            <td class="actions-cell">
                <button class="view-btn" data-id="${conductor.id}">Ver</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // listeners para los botones "Ver"
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = (e) => mostrarDetallesConductor(e.target.getAttribute('data-id'));
    });
}

// --- Nueva función: renderiza las statistic cards usando la lista actual (filtrada)
// --- Nueva función: renderiza las statistic cards usando la lista actual
function renderStatCards(lista) {
    // 1. Total de conductores en la lista actual
    const total = lista.length;

    // 2. Activos: estado === true
    const activos = lista.filter(c => c.estado === true).length;

    // 3. Verificados: verificado === true
    const verificados = lista.filter(c => c.verificado === true).length;

    // 4. Calificación promedio (solo mayores a 0)
    const calificaciones = lista
        .map(c => Number(c.calificacion || 0))
        .filter(val => val > 0);

    const suma = calificaciones.reduce((a, b) => a + b, 0);
    const promedio = calificaciones.length ? (suma / calificaciones.length).toFixed(1) : '0.0';

    // Actualizar el DOM
    const $ = id => document.getElementById(id);
    
    if ($('cardTotal')) $('cardTotal').innerText = total;
    if ($('cardActive')) $('cardActive').innerText = activos;
    if ($('cardVerified')) $('cardVerified').innerText = verificados; // Nueva línea
    if ($('cardAvgRating')) {
        $('cardAvgRating').innerHTML = `${promedio} <span class="star" style="color: #f59e0b;">★</span>`;
    }
}

// 4. LÓGICA DE FILTRADO (Búsqueda, Estado y Orden)
function aplicarFiltros() {
    const searchEl = document.getElementById("searchDrivers");
    const filtroEl = document.getElementById("filterStatus");
    const ordenEl = document.getElementById("sortOrder");

    const textoBusqueda = searchEl ? searchEl.value.toLowerCase() : '';
    const filtroEstado = filtroEl ? filtroEl.value : 'todos';
    const orden = ordenEl ? ordenEl.value : 'reciente';

    // usar la lista correcta (conductores)
    let resultados = todosLosConductores.filter(c => {
        const coincideBusqueda =
            (c.nombre_completo?.toLowerCase().includes(textoBusqueda)) ||
            (String(c.dni || '').toLowerCase().includes(textoBusqueda)) ||
            (c.email?.toLowerCase().includes(textoBusqueda));

        let coincideEstado = true;
        if (filtroEstado === "verificados") coincideEstado = (c.verificado === true);
        if (filtroEstado === "pendientes") coincideEstado = (c.verificado === false);

        return coincideBusqueda && coincideEstado;
    });

    // ordenamiento por fecha de creación (si existe)
    resultados.sort((a, b) => {
        const fechaA = a.fecha_creacion?.seconds || 0;
        const fechaB = b.fecha_creacion?.seconds || 0;
        return orden === "reciente" ? fechaB - fechaA : fechaA - fechaB;
    });

    // actualizar stats (si hay cards) y tabla de conductores
    renderStatCards(resultados); 
    renderizarConductores(resultados);
}

// 5. MOSTRAR DETALLES EN MODAL
async function mostrarDetallesConductor(conductorId) {
    const modal = document.getElementById("driverModal");
    const modalActions = document.querySelector(".modal-actions");

    // Limpiar botones a su estado original
    modalActions.innerHTML = `
        <button class="btn-verify" id="btnVerifyDriver">✓ Verificar Conductor</button>
        <button class="btn-edit" id="btnEditDriver">✏️ Editar</button>
        <button class="btn-delete" id="btnDeleteDriver">🗑️ Desactivar</button>
    `;

    const conductor = todosLosConductores.find(c => c.id === conductorId);

    // Mapeo de datos al HTML del modal
    document.getElementById("modalDriverPhoto").src = conductor.foto_perfil || '/placeholder.svg';
    document.getElementById("modalDriverName").innerText = conductor.nombre_completo || 'N/A';
    document.getElementById("modalDriverDNI").innerText = conductor.dni || 'N/A';
    document.getElementById("modalDriverEmail").innerText = conductor.email || 'N/A';
    document.getElementById("modalDriverPhone").innerText = conductor.telefono || 'N/A';
    document.getElementById("modalDriverNacionalidad").innerText = conductor.nacionalidad || 'N/A';
    document.getElementById("modalDriverDistrito").innerText = conductor.distrito_residencia || 'N/A';
    document.getElementById("modalDriverFecha").innerText = conductor.fecha_nacimiento || 'N/A';
    document.getElementById("modalDriverRegistro").innerText = conductor.fecha_creacion?.toDate().toLocaleDateString() || 'N/A';
    document.getElementById("modalDriverNivel").innerText = conductor.nivel || 'N/A';
    document.getElementById("modalDriverViajes").innerText = conductor.viajes || 0;
    document.getElementById('modalDriverCalificacion').textContent = Number(conductor.calificacion || 0).toFixed(1);

    const isVerified = conductor.verificado ?? false;
    const verifiedBadge = document.getElementById("modalDriverVerified");
    verifiedBadge.innerText = isVerified ? "Sí" : "Pendiente";
    verifiedBadge.className = `verified-badge ${isVerified ? 'verified' : 'pending'}`;

    // Documentos
    document.getElementById("modalSOAT").src = conductor.soat_url || '/placeholder.svg';
    document.getElementById("modalRevTecnica").src = conductor.revision_tecnica || '/placeholder.svg';
    document.getElementById("modalLicenciaAnverso").src = conductor.licencia_anverso_url || '/placeholder.svg';
    document.getElementById("modalLicenciaReverso").src = conductor.licencia_reverso_url || '/placeholder.svg';

    // Eventos de botones del modal
    const btnVerify = document.getElementById("btnVerifyDriver");
    if (isVerified) {
        btnVerify.innerText = "✓ Ya Verificado";
        btnVerify.disabled = true;
        btnVerify.style.backgroundColor = '#4CAF50';
    } else {
        btnVerify.onclick = () => verificarConductor(conductorId);
    }

    document.getElementById("btnDeleteDriver").onclick = () => desactivarConductor(conductorId);

    // Lógica del botón Editar dentro del modal
    document.getElementById("btnEditDriver").onclick = () => {
        const fields = ["modalDriverName", "modalDriverDNI", "modalDriverEmail", "modalDriverPhone", "modalDriverNacionalidad", "modalDriverDistrito", "modalDriverFecha", "modalDriverNivel"];
        fields.forEach(id => {
            const span = document.getElementById(id);
            const val = span.innerText === 'N/A' ? '' : span.innerText;
            span.innerHTML = `<input type="text" class="edit-input" id="input-${id}" value="${val}">`;
        });

        modalActions.innerHTML = `
            <button class="btn-save" id="btnSaveEdit">💾 Guardar Cambios</button>
            <button class="btn-cancel" id="btnCancelEdit">❌ Cancelar</button>
        `;

        document.getElementById("btnCancelEdit").onclick = () => mostrarDetallesConductor(conductorId);
        document.getElementById("btnSaveEdit").onclick = async () => {
            const updatedData = {
                nombre_completo: document.getElementById("input-modalDriverName").value,
                dni: document.getElementById("input-modalDriverDNI").value,
                email: document.getElementById("input-modalDriverEmail").value,
                telefono: document.getElementById("input-modalDriverPhone").value,
                nacionalidad: document.getElementById("input-modalDriverNacionalidad").value,
                distrito_residencia: document.getElementById("input-modalDriverDistrito").value,
                fecha_nacimiento: document.getElementById("input-modalDriverFecha").value,
                nivel: document.getElementById("input-modalDriverNivel").value,
            };
            await guardarCambiosConductor(conductorId, updatedData);
        };
    };

    modal.style.display = "flex";
    document.getElementById("closeModal").onclick = () => modal.style.display = "none";
}

// 6. FUNCIONES DE BASE DE DATOS
async function guardarCambiosConductor(conductorId, data) {
    try {
        await updateDoc(doc(db, "conductores", conductorId), data);
        alert("¡Datos actualizados con éxito!");
        await obtenerConductores(); // Refresca lista y datos globales
        document.getElementById("driverModal").style.display = "none";
    } catch (e) { alert("Error al guardar cambios"); }
}

async function verificarConductor(conductorId) {
    if (confirm("¿Confirmar verificación de este conductor?")) {
        try {
            await updateDoc(doc(db, "conductores", conductorId), { verificado: true });
            alert("Conductor verificado correctamente");
            await obtenerConductores();
            document.getElementById("driverModal").style.display = "none";
        } catch (e) { alert("Error al verificar"); }
    }
}

async function desactivarConductor(conductorId) {
    if (confirm("¿Estás seguro de desactivar a este conductor? No aparecerá en la lista activa.")) {
        try {
            await updateDoc(doc(db, "conductores", conductorId), { estado: false });
            alert("Conductor desactivado.");
            await obtenerConductores();
            document.getElementById("driverModal").style.display = "none";
        } catch (e) { alert("Error al desactivar"); }
    }
}

// 7. LISTENERS DE FILTROS Y BÚSQUEDA
document.getElementById("searchDrivers").addEventListener("input", aplicarFiltros);
document.getElementById("filterStatus").addEventListener("change", aplicarFiltros);
// Listener para el orden (Reciente/Antiguo)
document.getElementById("sortOrder").addEventListener("change", aplicarFiltros);

// Visor de imágenes (Funciona para fotos y miniaturas de documentos)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('doc-thumb') || e.target.id === 'modalDriverPhoto') {
        const viewer = document.getElementById('imageViewer');
        const viewerImg = document.getElementById('imageViewerImg');
        viewerImg.src = e.target.src;
        viewer.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
});

document.getElementById('closeImageViewer').onclick = () => {
    document.getElementById('imageViewer').classList.remove('show');
    document.body.style.overflow = '';
};

// 8. CARGA INICIAL
window.onload = obtenerConductores;