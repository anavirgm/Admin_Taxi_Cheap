import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js';

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
let todosLosPasajeros = [];

// 2. OBTENER LISTA DE PASAJEROS
async function obtenerPasajeros() {
    const pasajerosRef = collection(db, "pasajeros");
    const snapshot = await getDocs(pasajerosRef);
    
    const ID_PREDETERMINADO = "pasajeroId"; // Cambia esto por el ID real

    todosLosPasajeros = [];
    snapshot.forEach(doc => {
        // Solo agregamos si NO es el ID predeterminado
        if (doc.id !== ID_PREDETERMINADO) {
            todosLosPasajeros.push({ id: doc.id, ...doc.data() });
        }
    });

    aplicarFiltros(); 
}

// 3. FUNCIÓN PARA RENDERIZAR (ahora tabla)
function renderizarPasajeros(lista) {
    const tbody = document.querySelector("#passengersTable tbody");
    tbody.innerHTML = "";

    if (!lista.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6" style="text-align:center; padding: 40px 12px; color:#6b7280;">No se encontraron pasajeros.</td>`;
        tbody.appendChild(tr);
        return;
    }

    lista.forEach((pasajero) => {
        // No mostrar si el estado es false (Borrado lógico)
        if (pasajero.estado_verificacion === false) return;

        const verificado = pasajero.verificado ?? false;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="passenger-cell">
                    <img class="passenger-avatar" src="${pasajero.foto_perfil || '/placeholder.svg'}" alt="Avatar">
                    <div class="passenger-meta">
                        <div class="passenger-name">${pasajero.nombre_completo || 'Sin nombre'}</div>
                    </div>
                </div>
            </td>
            <td>${pasajero.email || 'N/A'}</td>
            <td>${pasajero.telefono || 'N/A'}</td>
            <td>${Number(pasajero.calificacion || 0).toFixed(1)} <span class="rating">★</span></td>
            <td>${verificado ? '<span class="status-badge status-verified">Verificado</span>' : '<span class="status-badge status-pending">Pendiente</span>'}</td>
            <td class="actions-cell">
                <button class="view-btn" data-id="${pasajero.id}">Ver</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // listeners para los botones "Ver"
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = (e) => mostrarDetallesPasajero(e.target.getAttribute('data-id'));
    });
}

// 4. LÓGICA DE FILTRADO (Búsqueda, Estado y Orden)
function aplicarFiltros() {
    const textoBusqueda = document.getElementById("searchPassengers").value.toLowerCase();
    const filtroEstado = document.getElementById("filterStatus").value;
    const orden = document.getElementById("sortOrder").value; // Leer el nuevo filtro de orden

    let resultados = todosLosPasajeros.filter(c => {
        const coincideBusqueda = 
            (c.nombre_completo?.toLowerCase().includes(textoBusqueda)) ||
            (c.dni?.toLowerCase().includes(textoBusqueda)) ||
            (c.email?.toLowerCase().includes(textoBusqueda));
        
        let coincideEstado = true;
        if (filtroEstado === "verificados") coincideEstado = (c.verificado === true);
        if (filtroEstado === "pendientes") coincideEstado = (c.verificado === false);

        return coincideBusqueda && coincideEstado;
    });

    // --- LÓGICA DE ORDENAMIENTO ---
    resultados.sort((a, b) => {
        const fechaA = a.fecha_creacion?.seconds || 0;
        const fechaB = b.fecha_creacion?.seconds || 0;
        
        if (orden === "reciente") {
            return fechaB - fechaA; // El más nuevo arriba
        } else {
            return fechaA - fechaB; // El más antiguo arriba
        }
    });
    renderStatCards(resultados); 
    renderizarPasajeros(resultados);
}

// 5. MOSTRAR DETALLES EN MODAL
async function mostrarDetallesPasajero(pasajeroId) {
    const modal = document.getElementById("passengerModal");
    const modalActions = document.querySelector(".modal-actions");

    // Limpiar botones a su estado original
    modalActions.innerHTML = `
        <button class="btn-verify" id="btnVerifyPassenger">✓ Verificar Pasajero</button>
        <button class="btn-edit" id="btnEditPassenger">✏️ Editar</button>
        <button class="btn-delete" id="btnDeletePassenger">🗑️ Desactivar</button>
    `;

    const pasajero = todosLosPasajeros.find(c => c.id === pasajeroId);

    // Mapeo de datos al HTML del modal
    document.getElementById("modalPassengerPhoto").src = pasajero.foto_perfil || '/placeholder.svg';
    document.getElementById("modalPassengerName").innerText = pasajero.nombre_completo || 'N/A';
    document.getElementById("modalPassengerDNI").innerText = pasajero.dni || 'N/A';
    document.getElementById("modalPassengerEmail").innerText = pasajero.email || 'N/A';
    document.getElementById("modalPassengerPhone").innerText = pasajero.telefono || 'N/A';
    document.getElementById("modalPassengerNacionalidad").innerText = pasajero.nacionalidad || 'N/A';
    document.getElementById("modalPassengerDistrito").innerText = pasajero.distrito_residencia || 'N/A';
    document.getElementById("modalPassengerFecha").innerText = pasajero.fecha_nacimiento || 'N/A';
    document.getElementById("modalPassengerRegistro").innerText = pasajero.fecha_creacion?.toDate?.().toLocaleDateString?.() || 'N/A';
    document.getElementById("modalPassengerCalificacion").innerText = Number(pasajero.calificacion || 0).toFixed(1);
    
    const isVerified = pasajero.verificado ?? false;
    const verifiedBadge = document.getElementById("modalPassengerVerified");
    verifiedBadge.innerText = isVerified ? "Sí" : "Pendiente";
    verifiedBadge.className = `verified-badge ${isVerified ? 'verified' : 'pending'}`;

    // Documentos (solo DNI para pasajeros)
    document.getElementById("modalDNI").src = pasajero.dni || '/placeholder.svg';

    // Eventos de botones del modal
    const btnVerify = document.getElementById("btnVerifyPassenger");
    if (isVerified) {
        btnVerify.innerText = "✓ Ya Verificado";
        btnVerify.disabled = true;
        btnVerify.style.backgroundColor = '#4CAF50';
    } else {
        btnVerify.onclick = () => verificarPasajero(pasajeroId);
    }

    document.getElementById("btnDeletePassenger").onclick = () => desactivarPasajero(pasajeroId);

    document.getElementById("btnEditPassenger").onclick = () => {
        const fields = ["modalPassengerName", "modalPassengerDNI", "modalPassengerEmail", "modalPassengerPhone", "modalPassengerNacionalidad", "modalPassengerDistrito", "modalPassengerFecha"];
        fields.forEach(id => {
            const span = document.getElementById(id);
            const val = span.innerText === 'N/A' ? '' : span.innerText;
            span.innerHTML = `<input type="text" class="edit-input" id="input-${id}" value="${val}">`;
        });

        modalActions.innerHTML = `
            <button class="btn-save" id="btnSaveEdit">💾 Guardar Cambios</button>
            <button class="btn-cancel" id="btnCancelEdit">❌ Cancelar</button>
        `;

        document.getElementById("btnCancelEdit").onclick = () => mostrarDetallesPasajero(pasajeroId);
        document.getElementById("btnSaveEdit").onclick = async () => { /* save handled below */
            
            const UpdatedData = {
                nombre_completo: document.getElementById("input-modalPassengerName").value.trim(),
                dni: document.getElementById("input-modalPassengerDNI").value.trim(),
                email: document.getElementById("input-modalPassengerEmail").value.trim(),
                telefono: document.getElementById("input-modalPassengerPhone").value.trim(),
                nacionalidad: document.getElementById("input-modalPassengerNacionalidad").value.trim(),
                distrito_residencia: document.getElementById("input-modalPassengerDistrito").value.trim(),
                fecha_nacimiento: document.getElementById("input-modalPassengerFecha").value.trim()
            };
            await guardarCambiosPasajero(pasajeroId, UpdatedData);
        };
        
    };

    modal.style.display = "flex";
    document.getElementById("closeModal").onclick = () => modal.style.display = "none";
}

// 6. FUNCIONES DE BASE DE DATOS
async function guardarCambiosPasajero(pasajeroId, data) {
    try {
        await updateDoc(doc(db, "pasajeros", pasajeroId), data);
        alert("¡Datos actualizados con éxito!");
        await obtenerPasajeros(); // Refresca lista y datos globales
        document.getElementById("passengerModal").style.display = "none";
    } catch (e) { alert("Error al guardar cambios"); }
}

async function verificarPasajero(pasajeroId) {
    if (confirm("¿Confirmar verificación de este pasajero?")) {
        try{ await updateDoc(doc(db, "pasajeros", pasajeroId), { verificado: true }); 
            alert('Pasajero verificado'); 
            await obtenerPasajeros(); 
            document.getElementById('passengerModal').style.display = 'none'; 
        }catch(e){alert('Error al verificar');}
    }
}

async function desactivarPasajero(pasajeroId) {
    if (confirm("¿Estás seguro de desactivar a este pasajero? No aparecerá en la lista activa.")) {
        try{ await updateDoc(doc(db, "pasajeros", pasajeroId), { estado: false }); alert('Pasajero desactivado'); await obtenerPasajeros(); document.getElementById('passengerModal').style.display = 'none'; }catch(e){alert('Error al desactivar');}
    }
}



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

// 7. LISTENERS DE FILTROS Y BÚSQUEDA
document.getElementById("searchPassengers").addEventListener("input", aplicarFiltros);
document.getElementById("filterStatus").addEventListener("change", aplicarFiltros);
// Listener para el orden (Reciente/Antiguo)
document.getElementById("sortOrder").addEventListener("change", aplicarFiltros);

// Visor de imágenes (Funciona para fotos y miniaturas de documentos)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('doc-thumb') || e.target.id === 'modalPassengerPhoto') {
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
window.onload = obtenerPasajeros;
