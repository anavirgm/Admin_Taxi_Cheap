import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore, collection, query, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

// --- Reemplazo: usar Google Maps en lugar de Leaflet ---
// Nota: reemplaza 'YOUR_GOOGLE_MAPS_API_KEY' por tu API Key de Google Maps.
const GOOGLE_MAPS_API_KEY = 'AIzaSyCBBXkKi_4zsjdtttbohbJEC8CoIHuF8-4';

let map = null;
const driverMarkers = new Map(); // id -> { marker, infoWindow }
let currentTrips = [];

/* helper: obtener latlng desde distintos formatos */
function getLatLngFromData(obj) {
  if (!obj) return null;

  // 1. Manejo directo de GeoPoint de Firebase (tu caso actual)
  if (obj.ubicacion && typeof obj.ubicacion.latitude === 'number') {
    return { lat: obj.ubicacion.latitude, lng: obj.ubicacion.longitude };
  }

  // 2. Otros formatos por si acaso
  if (obj.ubicacion?.lat !== undefined) {
    return { lat: obj.ubicacion.lat, lng: obj.ubicacion.lng };
  }
  
  if (Array.isArray(obj.coords) && obj.coords.length >= 2) {
    return { lat: obj.coords[0], lng: obj.coords[1] };
  }
  
  return null;
}

function createSvgIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(36, 36),
    anchor: new google.maps.Point(18, 18)
  };
}

function updateDriverMarker(id, data) {
  if (!map) return;

  const latlng = getLatLngFromData(data);
  
  // Si no tiene ubicación, quitamos el marcador (si existía) y salimos
  if (!latlng) {
    if (driverMarkers.has(id)) {
      driverMarkers.get(id).marker.setMap(null);
      driverMarkers.delete(id);
    }
    return;
  }

  // LÓGICA DE ESTADO:
  // 1. Si 'en_viaje' es true, manda el color azul.
  // 2. Si 'estado' es true (tu boolean), se considera 'disponible' (Verde).
  // 3. De lo contrario, 'inactivo'.
  let status = 'inactivo';
  if (data.estado === 'en_viaje') {
    status = 'en_viaje';
  } else if (data.estado === true) {
    status = 'disponible';
  }

  let color = '#9ca3af'; // Gris (Inactivo)
  if (status === 'en_viaje') color = '#0284c7'; // Azul
  if (status === 'disponible') color = '#f58e18'; // Verde

  const popupHtml = `
    <div style="min-width:160px; font-family: sans-serif;">
      <div style="font-weight:800; color: #111827;">${data.nombre_completo || 'Conductor'}</div>
      <div style="color:#6b7280; font-size:12px; margin-top: 2px;">
        ${data.dni ? 'DNI: ' + data.dni : ''}
      </div>
      <div style="margin-top:8px;">
        <span class="badge ${status}" style="padding: 4px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase; font-weight: bold;">
          ${status === 'disponible' ? '✅ Disponible' : status === 'en_viaje' ? '🚖 En Viaje' : '💤 Inactivo'}
        </span>
      </div>
    </div>
  `;

  if (driverMarkers.has(id)) {
    const item = driverMarkers.get(id);
    item.marker.setPosition(latlng);
    item.marker.setIcon(createSvgIcon(color));
    item.infoWindow.setContent(popupHtml);
  } else {
    const marker = new google.maps.Marker({
      position: latlng,
      map,
      icon: createSvgIcon(color),
      title: data.nombre_completo || 'Conductor'
    });
    const infoWindow = new google.maps.InfoWindow({ content: popupHtml });
    marker.addListener('click', () => infoWindow.open({ anchor: marker, map }));
    driverMarkers.set(id, { marker, infoWindow });
  }
}

/* Inicia listeners de Firestore (se ejecuta después de initMap) */
function startListeners() {
  // Listener de Conductores (Igual que antes)
  const conductoresRef = collection(db, 'conductores');
  onSnapshot(conductoresRef, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      const id = change.doc.id;
      const data = change.doc.data();
      if (change.type === 'removed') {
        if (driverMarkers.has(id)) {
          driverMarkers.get(id).marker.setMap(null);
          driverMarkers.delete(id);
        }
      } else {
        updateDriverMarker(id, data);
      }
    });
  });

  // Listener de Viajes CORREGIDO
  // Cambiamos 'fecha_creacion' por 'creado' que es el campo real en tu DB
  const viajesRef = query(collection(db, 'viajes'), orderBy('creado', 'desc'), limit(200));
  
  onSnapshot(viajesRef, (snapshot) => {
    console.log("Viajes detectados:", snapshot.size); // Esto te dirá en consola si están llegando datos
    currentTrips = snapshot.docs.map(d => ({ 
      id: d.id, 
      ...d.data() 
    }));
    renderTrips();
  }, (error) => {
    console.error("Error en viajes:", error); 
    // Si sale un error de "Index", Firebase te dará un link aquí para crearlo
  });
}

/* Inicializa el mapa (llamado por callback al cargar la librería) */
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -12.0464, lng: -77.0428 }, // Centro en Lima, Perú
    zoom: 11,
    mapTypeControl: false,
    streetViewControl: false
  });

  startListeners();
  renderTrips();
}


/* Carga dinámica de Google Maps y define window.initMap para callback */
function loadGoogleMaps(apiKey) {
  if (window.google && window.google.maps) {
    initMap();
    return;
  }
  window.initMap = initMap;
  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

/* Resto de funciones (renderTrips, openTripModal, listeners DOM) permanecen iguales,
   solo adaptamos el centrado del mapa para Google Maps */
function renderTrips() {
  const tbody = document.querySelector('#tripsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = (document.getElementById('searchTrips')?.value || '').toLowerCase();
  const filter = document.getElementById('filterTripStatus')?.value || 'todos';

  // 1. Filtrado lógico
  const filtered = currentTrips.filter(t => {
    // Buscamos por ID de viaje o IDs de personas ya que no tenemos nombres directos aquí
    const hay = (t.viajeId || t.id || '') + ' ' + (t.conductorId || '') + ' ' + (t.pasajeroId || '');
    const matchSearch = hay.toLowerCase().includes(search);
    const matchFilter = filter === 'todos' ? true : (t.estado === filter);
    return matchSearch && matchFilter;
  });

  // 2. Actualización de Stats (Cards) superiores
  // Ajustado a tus estados: "finalizado", "aceptado", etc.
  document.getElementById('statTotal').innerText = currentTrips.length;
  document.getElementById('statEnViaje').innerText = currentTrips.filter(t => t.estado === 'aceptado' || t.estado === 'en_curso').length;
  document.getElementById('statPendientes').innerText = currentTrips.filter(t => t.estado === 'pendiente').length;
  document.getElementById('statCompletados').innerText = currentTrips.filter(t => t.estado === 'finalizado').length;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:#6b7280;">No se encontraron viajes.</td></tr>`;
    return;
  }

  // 3. Renderizado de filas
  filtered.forEach(trip => {
    // Formatear coordenadas de GeoPoint a texto legible si es necesario
    const origenTxt = trip.origen ? `${trip.origen.latitude.toFixed(4)}, ${trip.origen.longitude.toFixed(4)}` : '—';
    const destinoTxt = trip.destino ? `${trip.destino.latitude.toFixed(4)}, ${trip.destino.longitude.toFixed(4)}` : '—';
    
    const distancia = trip.distancia ? `${Number(trip.distancia).toFixed(2)} km` : '—';
    const precio = trip.precio ? `$${Number(trip.precio).toFixed(2)}` : '—';
    const estado = trip.estado || 'desconocido';
    const fechaViaje = trip.creado?.toDate 
    ? trip.creado.toDate().toLocaleString() 
    : 'Sin fecha';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-size: 11px; font-family: monospace;">${trip.viajeId || trip.id}</span></td>
      <td><small>${trip.conductorId ? trip.conductorId.substring(0,8) + '...' : '—'}</small></td>
      <td><small>${trip.pasajeroId ? trip.pasajeroId.substring(0,8) + '...' : '—'}</small></td>
      <td style="max-width:200px; font-size: 11px; color: #666;">
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          📍 ${origenTxt} <br> 🏁 ${destinoTxt}
        </div>
      </td>
      <td>${distancia}</td>
      <td><strong>${precio}</strong></td>
      <td><span class="badge ${estado}">${estado.toUpperCase()}</span></td>
      <td class="actions-cell"><button class="view-trip" data-id="${trip.viajeId || trip.id}">Ver</button></td>
    `;
    tbody.appendChild(tr);

    // Acción del botón Ver
    tr.querySelector('.view-trip').onclick = () => {
      // Centrar mapa en el origen del viaje
      if (trip.origen) {
        const coords = { lat: trip.origen.latitude, lng: trip.origen.longitude };
        map.panTo(coords);
        map.setZoom(15);
      }
      openTripModal(trip);
    };
  });
}

/* Busqueda + filtro */
document.getElementById('searchTrips').addEventListener('input', renderTrips);
document.getElementById('filterTripStatus').addEventListener('change', renderTrips);

/* Modal abrir/cerrar (sin cambios) */
function openTripModal(trip) {
  const modal = document.getElementById('tripModal');
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalTripId').innerText = `Viaje ${trip.id}`;
  const body = document.getElementById('modalTripBody');
  body.innerHTML = `
    <p><strong>Conductor:</strong> ${trip.conductor_nombre || trip.conductor?.nombre_completo || '—'}</p>
    <p><strong>Pasajero:</strong> ${trip.pasajero_nombre || trip.pasajero?.nombre_completo || '—'}</p>
    <p><strong>Ruta:</strong> ${(trip.origen?.direccion || '—')} → ${(trip.destino?.direccion || '—')}</p>
    <p><strong>Distancia:</strong> ${trip.distancia || trip.km || '—'}</p>
    <p><strong>Precio:</strong> ${trip.precio ? '$'+Number(trip.precio).toFixed(2) : '—'}</p>
    <p><strong>Estado:</strong> ${trip.estado || '—'}</p>
  `;
  modal.classList.add('active');
  overlay.classList.add('active');
}
document.getElementById('closeTripModal').onclick = () => {
  document.getElementById('tripModal').classList.remove('active');
  document.getElementById('modalOverlay').classList.remove('active');
};
document.getElementById('modalOverlay').onclick = () => {
  document.getElementById('tripModal').classList.remove('active');
  document.getElementById('modalOverlay').classList.remove('active');
};

/* Cargar Google Maps y arrancar */
loadGoogleMaps(GOOGLE_MAPS_API_KEY);
