// Configuración para desarrollo
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/usuarios',

  // Configuración de Firebase (reemplaza con tus credenciales)
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
