import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";

  try {

    // -------------------------------
    // 🔐 Iniciar sesión correctamente (V9)
    // -------------------------------
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // -------------------------------
    // 🔎 Consultar Firestore correctamente (V9)
    // -------------------------------
    const adminRef = doc(db, "administradores", user.uid);
    const adminDoc = await getDoc(adminRef);

    if (adminDoc.exists()) {
      // ✔ El usuario es administrador
      window.location.href = "/public/admin/auth/dashboard.html";
    } else {
      document.getElementById("emailError").textContent = "No tienes permisos de administrador.";
      await signOut(auth);
    }

  } catch (error) {

    if (error.code === "auth/user-not-found") {
      document.getElementById("emailError").textContent = "Usuario no encontrado.";
    } else if (error.code === "auth/wrong-password") {
      document.getElementById("passwordError").textContent = "Contraseña incorrecta.";
    } else {
      document.getElementById("emailError").textContent = "Hubo un error al intentar iniciar sesión.";
      console.error(error);
    }
  }
});
