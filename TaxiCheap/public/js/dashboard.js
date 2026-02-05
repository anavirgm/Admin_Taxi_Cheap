
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// Configuración de Firebase
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

async function obtenerNumeroConductores() {
  const conductoresRef = collection(db, "conductores");
  const snapshot = await getDocs(conductoresRef);
  const total = snapshot.size;
  document.querySelector(".card-conduc").textContent = total;
}

async function obtenerNumeroPasajeros() {
  const conductoresRef = collection(db, "pasajeros");
  const snapshot = await getDocs(conductoresRef);
  const total = snapshot.size;
  document.querySelector(".card-pasajero").textContent = total;
}

async function obtenerNumeroCupones() {
  const conductoresRef = collection(db, "cupones");
  const snapshot = await getDocs(conductoresRef);
  const total = snapshot.size;
  document.querySelector(".card-cupones").textContent = total;
}


async function renderDashboard() {
    const viajesRef = collection(db, "viajes");
    const snapshot = await getDocs(viajesRef);
    
    let ingresosTotales = 0;
    let viajesActivos = 0;
    let cancelados = 0;
    let totalViajes = snapshot.size;

    snapshot.forEach(doc => {
        const data = doc.data();
        
        // 1. Calcular Ingresos (solo viajes aceptados/completados)
        if (data.completado === true) {
            ingresosTotales += (data.precio_real || 0);
        }

        // 2. Viajes Activos
        if (data.completado === true) {
            viajesActivos++;
        }

        // 3. Conteo para Tasa de Cancelación
        if (data.estado === "cancelado") {
            cancelados++;
        }
    });

    // Renderizar Tarjetas
    document.querySelector(".card-ingresos").textContent = `S/ ${ingresosTotales.toFixed(2)}`;
    const tasaCancelacion = totalViajes > 0 ? ((cancelados / totalViajes) * 100).toFixed(1) : 0;
    document.querySelector(".card-cancelacion").textContent = `${tasaCancelacion}%`;
    
    // Llamar al gráfico
    generarGrafico24Horas();
}

async function generarGrafico24Horas() {
    const ahora = new Date();
    const hace24Horas = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));
    
    const q = query(
        collection(db, "viajes"),
        where("creado", ">=", hace24Horas),
        orderBy("creado", "asc")
    );

    const querySnapshot = await getDocs(q);
    
    // Agrupar viajes por hora
    const conteoPorHora = {};
    querySnapshot.forEach(doc => {
        const hora = doc.data().creado.toDate().getHours();
        conteoPorHora[hora] = (conteoPorHora[hora] || 0) + 1;
    });

    const labels = Object.keys(conteoPorHora).map(h => `${h}:00`);
    const dataValues = Object.values(conteoPorHora);

    const ctx = document.getElementById('viajesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Viajes',
                data: dataValues,
                borderColor: '#ff6f00',
                backgroundColor: 'rgba(255, 132, 0, 0.34)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

// Inicializar todo
renderDashboard();
obtenerNumeroConductores(); // Las que ya tenías
obtenerNumeroPasajeros();
obtenerNumeroCupones();


// Variables
const menuToggle = document.getElementById("menuToggle")
const closeSidebar = document.getElementById("closeSidebar")
const sidebar = document.getElementById("sidebar")
const sidebarOverlay = document.getElementById("sidebarOverlay")
const menuLinks = document.querySelectorAll(".sidebar-menu a")
const sidebarToggleDesktop = document.getElementById("sidebarToggleDesktop")

// Abrir sidebar en móvil
menuToggle.addEventListener("click", () => {
  sidebar.classList.add("active")
  sidebarOverlay.classList.add("active")
})

sidebarToggleDesktop.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
})

// Cerrar sidebar
closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("active")
  sidebarOverlay.classList.remove("active")
})

// Cerrar sidebar al hacer click en overlay
sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active")
  sidebarOverlay.classList.remove("active")
})

// Cerrar sidebar al cambiar el tamaño de la pantalla
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("active")
    sidebarOverlay.classList.remove("active")
  }
})
