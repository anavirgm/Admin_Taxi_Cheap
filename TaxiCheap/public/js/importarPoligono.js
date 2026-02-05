/**
 * IMPORTAR POLÍGONO DE COORDENADAS A FIRESTORE
 * ----------------------------------------------------
 * Requisitos:
 * 1. Tener Firebase Admin configurado en el proyecto
 * 2. Tener un archivo CSV con columnas: lat,lon
 * 3. Ejecutar: node importarPoligono.js
 */

const admin = require("firebase-admin");
const fs = require("fs");

// ⚠️ Si ya tienes inicializado Firebase Admin en otro archivo, usa tu require.
// Aquí un ejemplo típico:
admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json")
});

const db = admin.firestore();

// Archivo CSV con tus coordenadas
const CSV_FILE_PATH = "./miraflores_latlon.csv";

// Colección y documento donde guardarás el polígono
const COLLECTION_NAME = "zonasInseguras";
const DOCUMENT_ID = "miraflores";

/**
 * Función principal
 */
async function importarPoligono() {
  try {
    console.log("📥 Leyendo archivo CSV...");

    const fileContent = fs.readFileSync(CSV_FILE_PATH, "utf8").trim().split("\n");

    // Eliminar encabezado si existe
    const rows = fileContent[0].includes("lat") ? fileContent.slice(1) : fileContent;

    console.log(`📌 Total de coordenadas encontradas: ${rows.length}`);

    // Convertimos filas a GeoPoints
    const geoPoints = rows.map(row => {
      const [latStr, lonStr] = row.split(",");
      const lat = Number(latStr);
      const lon = Number(lonStr);
      return new admin.firestore.GeoPoint(lat, lon);
    });

    console.log("📤 Subiendo polígono a Firestore...");

    await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
      nombre: "Distrito Miraflores - Perú",
      poligono: geoPoints,
      actualizado: new Date()
    });

    console.log("✔️ Polígono importado correctamente");
    console.log(`📍 Guardado en: ${COLLECTION_NAME}/${DOCUMENT_ID}`);

  } catch (error) {
    console.error("❌ Error importando polígono:", error);
  }
}

importarPoligono();
