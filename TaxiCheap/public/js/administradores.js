import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCv3im6Uk2y0CwUFk98UD3pLGEUU9P2a8w",
    authDomain: "taxi-cheap.firebaseapp.com",
    projectId: "taxi-cheap",
    storageBucket: "taxi-cheap.firebasestorage.app",
    messagingSenderId: "1016802563845",
    appId: "1:1016802563845:web:1a34981181bd0bf1e7496c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializar Storage
const adminsRef = collection(db, "administradores");

let allAdmins = [];
let formHTMLBackup = ''; 

// Referencias al DOM
const modal = document.getElementById("adminModal");
const overlay = document.getElementById("adminOverlay");
const modalBody = document.querySelector("#adminModal .modal-body");
const modalTitle = document.getElementById("modalTitle");

// --- LISTENERS ---
onSnapshot(adminsRef, (snapshot) => {
    allAdmins = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAdmins();
});

function renderAdmins() {
    const tbody = document.querySelector("#adminsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    allAdmins.forEach(admin => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${admin.foto_url || 'https://ui-avatars.com/api/?background=f58e18&color=fff&name='+admin.usuario}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                    <div>
                        <div style="font-weight:bold;">${admin.nombre_completo || admin.usuario}</div>
                        <div style="font-size:11px; color:#666;">@${admin.usuario}</div>
                    </div>
                </div>
            </td>
            <td>${admin.email}</td>
            <td><span class="badge verified">${admin.rol}</span></td>
            <td>
                <button class="view-admin" onclick="openAdminProfile('${admin.id}')">Ver Perfil</button>
                <button class="btn-delete" onclick="deleteAdmin('${admin.id}')">✕</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- FUNCIÓN PARA SUBIR IMAGEN ---
async function uploadImage(file) {
    if (!file) return null;
    const storageRef = ref(storage, `admins_fotos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

// --- GUARDAR O ACTUALIZAR ---
async function handleFormSubmit(e) {
    e.preventDefault();
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Subiendo datos...";

    const id = document.getElementById("adminId").value;
    const fileInput = document.getElementById("adminFotoFile");
    let fotoUrl = document.getElementById("adminFotoUrl").value;

    try {
        // Si el usuario seleccionó un archivo nuevo, lo subimos
        if (fileInput.files[0]) {
            fotoUrl = await uploadImage(fileInput.files[0]);
        }

        const data = {
            nombre_completo: document.getElementById("adminNombre").value,
            foto_url: fotoUrl,
            usuario: document.getElementById("adminUser").value,
            email: document.getElementById("adminEmail").value,
            rol: document.getElementById("adminRol").value,
            telefono: document.getElementById("adminPhone").value,
            status: document.getElementById("adminStatus").value
        };

        if (id) {
            await updateDoc(doc(db, "administradores", id), data);
            alert("Administrador actualizado");
        } else {
            await addDoc(adminsRef, data);
            alert("Administrador creado");
        }
        cerrarModal();
    } catch (error) {
        console.error(error);
        alert("Error al guardar información");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Guardar Administrador";
    }
}


// --- EL RESTO DE FUNCIONES (abrirModal, cerrarModal, openAdminProfile, etc) ---
// (Asegúrate de copiar las funciones de gestión de modal del código anterior)

window.openAdminProfile = (id) => {
    const admin = allAdmins.find(a => a.id === id);
    if (!admin) return;

    // Lógica de colores para estatus
    const statusColor = admin.status === "Activo" ? "#10b981" : admin.status === "En pausa" ? "#f59e0b" : "#ef4444";

    modalTitle.innerText = "Expediente de Administrador";
    modalBody.innerHTML = `
        <div class="pro-card">
            <div class="pro-banner" style="height: 100px; background: linear-gradient(90deg, #6daaff, #5aafff); border-radius: 12px 12px 0 0;"></div>
            <div class="pro-content" style="padding: 0 20px 20px 20px; text-align: center; margin-top: -50px;">
                <img src="${admin.foto_url || 'https://ui-avatars.com/api/?background=f58e18&color=fff&size=128&name='+admin.usuario}" 
                     style="width: 100px; height: 100px; border-radius: 50%; border: 5px solid white; object-fit: cover; background: #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <div style="margin-top:10px;">
                    <h2 style="margin:0; font-size:1.5rem;">${admin.nombre_completo || admin.usuario}</h2>
                    <p style="color:#6b7280; margin:5px 0;">@${admin.usuario} • <span style="color:${statusColor}; font-weight:bold;">${admin.status || 'Activo'}</span></p>
                    <span style="display:inline-block; padding:4px 12px; background:#eff6ff; color:#2563eb; border-radius:20px; font-weight:bold; font-size:11px; text-transform:uppercase;">${admin.rol}</span>
                </div>
                
                <div class="pro-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:25px; text-align:left; border-top:1px solid #f3f4f6; padding-top:20px;">
                    <div class="pro-item">
                        <strong style="display:block; font-size:10px; color:#9ca3af; text-transform:uppercase;">Email</strong>
                        <span style="font-size:13px; color:#374151; font-weight:500;">${admin.email}</span>
                    </div>
                    <div class="pro-item">
                        <strong style="display:block; font-size:10px; color:#9ca3af; text-transform:uppercase;">Teléfono</strong>
                        <span style="font-size:13px; color:#374151; font-weight:500;">${admin.telefono || 'No registrado'}</span>
                    </div>
                    <div class="pro-item">
                        <strong style="display:block; font-size:10px; color:#9ca3af; text-transform:uppercase;">ID Sistema</strong>
                        <span style="font-family:monospace; font-size:11px; color:#6b7280;">${admin.id}</span>
                    </div>
                    <div class="pro-item">
                        <strong style="display:block; font-size:10px; color:#9ca3af; text-transform:uppercase;">Fecha</strong>
                        <span style="font-size:13px; color:#374151;">${new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-top:30px;">
                    <button onclick="editAdminMode('${admin.id}')" style="flex:2; padding:12px; background:#111827; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">✏️ Editar Información</button>
                    <button onclick="cerrarModal()" style="flex:1; padding:12px; background:#f3f4f6; color:#374151; border:none; border-radius:8px; cursor:pointer;">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    abrirModal();
};

// --- ELIMINAR ---
window.deleteAdmin = async (id) => {
    if(confirm("¿Seguro que deseas eliminar este administrador?")) {
        await deleteDoc(doc(db, "administradores", id));
    }
};

// --- MODO EDICIÓN ---
window.editAdminMode = (id) => {
    const admin = allAdmins.find(a => a.id === id);
    modalTitle.innerText = "Editando Perfil";
    modalBody.innerHTML = formHTMLBackup;
    
    document.getElementById("adminId").value = admin.id;
    document.getElementById("adminNombre").value = admin.nombre_completo || "";
    document.getElementById("adminFotoUrl").value = admin.foto_url || "";
    document.getElementById("adminUser").value = admin.usuario;
    document.getElementById("adminEmail").value = admin.email;
    document.getElementById("adminRol").value = admin.rol;
    document.getElementById("adminPhone").value = admin.telefono || "";
    document.getElementById("adminStatus").value = admin.status || "Activo";
    
    document.getElementById("adminForm").onsubmit = handleFormSubmit;
};

function abrirModal() {
    modal.style.display = "block";
    overlay.style.display = "block";
    setTimeout(() => { modal.classList.add("active"); overlay.classList.add("active"); }, 10);
}

function cerrarModal() {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    setTimeout(() => { modal.style.display = "none"; overlay.style.display = "none"; }, 300);
}

document.getElementById("btnAddAdmin").onclick = () => {
    modalTitle.innerText = "Nuevo Administrador";
    modalBody.innerHTML = formHTMLBackup;
    document.getElementById("adminForm").onsubmit = handleFormSubmit;
    abrirModal();
};

window.deleteAdmin = async (id) => {
    if(confirm("¿Seguro que deseas eliminar este administrador?")) {
        await deleteDoc(doc(db, "administradores", id));
    }
};

document.getElementById("closeAdminModal").onclick = cerrarModal;
overlay.onclick = cerrarModal;

window.addEventListener('DOMContentLoaded', () => {
    const initialForm = document.getElementById("adminForm");
    if (initialForm) formHTMLBackup = initialForm.outerHTML;
});