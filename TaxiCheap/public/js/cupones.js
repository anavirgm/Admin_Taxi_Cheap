// Importa las dependencias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

// Configuración de Firebase (usa la configuración de tu proyecto)
const firebaseConfig = {
    apiKey: "AIzaSyCv3im6Uk2y0CwUFk98UD3pLGEUU9P2a8w",
    authDomain: "taxi-cheap.firebaseapp.com",
    projectId: "taxi-cheap",
    storageBucket: "taxi-cheap.firebasestorage.app",
    messagingSenderId: "1016802563845",
    appId: "1:1016802563845:web:1a34981181bd0bf1e7496c",
    measurementId: "G-17KZVVPTTV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a la colección 'cupones' en Firestore
const couponsCollection = collection(db, "cupones");

// Función para obtener los cupones
const getCoupons = async () => {
    const querySnapshot = await getDocs(couponsCollection);
    const couponsGrid = document.getElementById("couponsGrid");

    // Limpiar cualquier cupón que esté cargado previamente
    couponsGrid.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const coupon = doc.data();

        // Crear una tarjeta para cada cupón
        const couponCard = document.createElement("div");
        couponCard.classList.add("coupon-card");

        // Agregar los detalles del cupón a la tarjeta
        couponCard.innerHTML = `
            <div class="coupon-card-header">
                <span class="coupon-card-status ${coupon.activo ? 'activo' : 'inactivo'}">${coupon.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div class="coupon-card-body">
                <h3 class="coupon-card-code">${coupon.codigo}</h3>
                <p class="coupon-card-description">${coupon.descripcion}</p>
                <div class="coupon-card-footer">
                    <span class="coupon-card-discount">Descuento: ${coupon.valor_descuento}%</span>
                    <span class="coupon-card-expiry">Expira: ${new Date(coupon.fecha_expiracion.seconds * 1000).toLocaleString()}</span>
                </div>
            </div>
        `;

        // Agregar el evento para abrir el modal
        couponCard.addEventListener("click", () => openCouponModal(coupon, doc.id));

        // Insertar la tarjeta del cupón en el contenedor
        couponsGrid.appendChild(couponCard);
    });
};

// Llamar la función para cargar los cupones cuando la página se carga
getCoupons();


// Función para abrir el modal con los detalles del cupón
const openCouponModal = (coupon, couponId) => {
    document.getElementById("modalCouponCode").textContent = coupon.codigo;
    document.getElementById("modalCouponDescription").textContent = coupon.descripcion;
    document.getElementById("modalCouponDiscount").textContent = `${coupon.valor_descuento}%`;
    document.getElementById("modalCouponExpiry").textContent = new Date(coupon.fecha_expiracion.seconds * 1000).toLocaleString();
    document.getElementById("modalCouponStatus").textContent = coupon.activo ? 'Activo' : 'Inactivo';
    document.getElementById("couponModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");

    // Eventos para editar o eliminar
    document.getElementById("btnEditCoupon").onclick = () => editCoupon(couponId);
    document.getElementById("btnDeleteCoupon").onclick = () => deleteCoupon(couponId);
};

// Función para cerrar el modal
document.getElementById("closeModal").onclick = () => {
    document.getElementById("couponModal").classList.remove("active");
    document.getElementById("modalOverlay").classList.remove("active");
};


const editCoupon = (couponId) => {
    // Aquí puedes agregar la lógica para editar el cupón, abriendo un formulario con los datos actuales
    alert(`Editando el cupón con ID: ${couponId}`);
};


import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

// Función para eliminar un cupón de Firestore
const deleteCoupon = async (couponId) => {
    try {
        await deleteDoc(doc(db, "cupones", couponId));
        alert("Cupón eliminado correctamente");
        getCoupons();  // Volver a cargar los cupones después de eliminar uno
    } catch (error) {
        console.error("Error al eliminar el cupón: ", error);
        alert("Hubo un error al eliminar el cupón");
    }
};

document.getElementById("searchCoupons").addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const querySnapshot = await getDocs(couponsCollection);
    const couponsGrid = document.getElementById("couponsGrid");

    couponsGrid.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const coupon = doc.data();

        // Filtrar los cupones que coincidan con el código o descripción
        if (coupon.codigo.toLowerCase().includes(query) || coupon.descripcion.toLowerCase().includes(query)) {
            const couponCard = document.createElement("div");
            couponCard.classList.add("coupon-card");

            couponCard.innerHTML = `
                <div class="coupon-card-header">
                    <span class="coupon-card-status ${coupon.activo ? 'activo' : 'inactivo'}">${coupon.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div class="coupon-card-body">
                    <h3 class="coupon-card-code">${coupon.codigo}</h3>
                    <p class="coupon-card-description">${coupon.descripcion}</p>
                    <div class="coupon-card-footer">
                        <span class="coupon-card-discount">Descuento: ${coupon.valor_descuento}%</span>
                        <span class="coupon-card-expiry">Expira: ${new Date(coupon.fecha_expiracion.seconds * 1000).toLocaleString()}</span>
                    </div>
                </div>
            `;

            couponCard.addEventListener("click", () => openCouponModal(coupon, doc.id));

            couponsGrid.appendChild(couponCard);
        }
    });
});
