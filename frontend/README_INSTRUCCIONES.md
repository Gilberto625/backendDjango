# 🚀 Frontend Angular - Sistema de Autenticación con 2FA y Google Login

Sistema completo de autenticación en Angular 17 con:
- ✅ Registro de usuarios + Verificación 2FA por email
- ✅ Login con email/contraseña + Verificación 2FA
- ✅ Login con Google (Firebase)
- ✅ Página protegida (Home/Dashboard)
- ✅ Guards de autenticación
- ✅ Integración con backend Django

---

## 📋 **REQUISITOS PREVIOS**

Antes de ejecutar el proyecto, asegúrate de tener:

- ✅ Node.js v18+ y npm instalados
- ✅ Backend Django corriendo en `http://localhost:8000`
- ✅ Cuenta de Firebase con autenticación de Google habilitada

---

## 🔧 **PASO 1: CONFIGURAR FIREBASE**

### 1.1 Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto" o selecciona uno existente
3. Activa **Authentication** > **Sign-in method** > Habilita **Google**

### 1.2 Obtener credenciales de Firebase

1. En Firebase Console, ve a **Configuración del proyecto** (icono de engranaje)
2. En la sección "Tus apps", agrega una aplicación web
3. Copia las credenciales que se muestran

### 1.3 Configurar credenciales en el proyecto

Edita el archivo `src/environments/environment.ts` y reemplaza con tus credenciales:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/usuarios',

  firebase: {
    apiKey: "AIzaSy...",  // Tu API Key
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:..."
  }
};
```

---

## 📦 **PASO 2: INSTALAR DEPENDENCIAS**

```bash
cd frontendAngular
npm install
```

Esto instalará:
- Angular 17
- Angular Material 17
- Firebase 10
- AngularFire 17
- Y todas las dependencias necesarias

---

## ▶️ **PASO 3: EJECUTAR EL PROYECTO**

### Opción 1: Desarrollo normal

```bash
ng serve
```

### Opción 2: Con puerto específico

```bash
ng serve --port 4200
```

### Opción 3: Abrir automáticamente en navegador

```bash
ng serve --open
```

El frontend estará disponible en: **http://localhost:4200**

---

## 🎯 **FLUJO DE LA APLICACIÓN**

### 1. **REGISTRO**

1. Accede a `http://localhost:4200/register`
2. Completa el formulario de registro con todos los campos:
   - Nombre, Apellidos
   - Username (mínimo 4 caracteres)
   - Correo electrónico
   - Teléfono (10 dígitos)
   - Contraseña (mínimo 8 caracteres)
   - Pregunta y respuesta secreta
3. Click en "Registrar"
4. **Automáticamente** se te redirige a la página de verificación 2FA
5. Revisa tu correo electrónico y copia el código de 6 dígitos
6. Ingresa el código en la página de verificación
7. Click en "Verificar Código"
8. **¡Registro exitoso!** Serás redirigido al login

### 2. **LOGIN CON EMAIL Y CONTRASEÑA**

1. Accede a `http://localhost:4200/login`
2. Ingresa tu correo y contraseña
3. Click en "Iniciar Sesión"
4. **Automáticamente** se te redirige a la página de verificación 2FA
5. Revisa tu correo y copia el código de 6 dígitos
6. Ingresa el código
7. Click en "Verificar Código"
8. **¡Sesión iniciada!** Serás redirigido a la página Home

### 3. **LOGIN CON GOOGLE**

1. Accede a `http://localhost:4200/login`
2. Click en el botón "🔐 Iniciar con Google"
3. Selecciona tu cuenta de Google
4. **Automáticamente**:
   - Si tu correo ya existe → Inicia sesión directamente
   - Si tu correo NO existe → Crea una cuenta automáticamente y luego inicia sesión
5. **¡Sesión iniciada!** Serás redirigido a la página Home

### 4. **PÁGINA HOME (PROTEGIDA)**

- Solo accesible si estás autenticado
- Muestra tu información de usuario
- Botón para cerrar sesión

---

## 🗂️ **ESTRUCTURA DEL PROYECTO**

```
frontendAngular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── register/           # Formulario de registro
│   │   │   ├── login/              # Formulario de login + Google
│   │   │   ├── verify2fa/          # Verificación 2FA
│   │   │   └── home/               # Página protegida
│   │   ├── services/
│   │   │   └── auth.service.ts     # Servicio de autenticación
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Protección de rutas
│   │   ├── app.config.ts           # Configuración global
│   │   └── app.routes.ts           # Rutas de la aplicación
│   ├── environments/
│   │   └── environment.ts          # Configuración Firebase + API
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🛣️ **RUTAS DISPONIBLES**

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/` | Redirige a `/login` | No |
| `/register` | Página de registro | No |
| `/login` | Página de inicio de sesión | No |
| `/verify-2fa` | Verificación de código 2FA | No |
| `/home` | Dashboard/Home | **Sí** (requiere autenticación) |

---

## 🔐 **SEGURIDAD IMPLEMENTADA**

1. **CSRF Protection**: Tokens CSRF en todas las peticiones al backend
2. **Auth Guards**: Rutas protegidas que requieren autenticación
3. **HTTP Cookies**: Credenciales enviadas con `withCredentials: true`
4. **Session Management**: Sesiones guardadas en localStorage
5. **Firebase Auth**: Autenticación segura con Google

---

## 🧪 **PRUEBAS RECOMENDADAS**

### Prueba 1: Registro completo

```
1. Ir a /register
2. Llenar formulario
3. Verificar que recibe email con código
4. Ingresar código correcto
5. Verificar redirección a /login
```

### Prueba 2: Login con 2FA

```
1. Ir a /login
2. Ingresar credenciales
3. Verificar que recibe email con código
4. Ingresar código correcto
5. Verificar redirección a /home
```

### Prueba 3: Login con Google (usuario nuevo)

```
1. Ir a /login
2. Click en botón de Google
3. Seleccionar cuenta que NO está registrada
4. Verificar que crea cuenta automáticamente
5. Verificar redirección a /home
```

### Prueba 4: Login con Google (usuario existente)

```
1. Ir a /login
2. Click en botón de Google
3. Seleccionar cuenta YA registrada
4. Verificar que inicia sesión directamente
5. Verificar redirección a /home
```

### Prueba 5: Protección de rutas

```
1. Sin estar autenticado, ir a /home
2. Verificar que redirige a /login
3. Autenticarse
4. Verificar que ahora sí permite acceso a /home
```

---

## 🐛 **TROUBLESHOOTING**

### Error: "Firebase app not initialized"

**Solución**: Verifica que las credenciales de Firebase en `environment.ts` sean correctas.

### Error: "CORS policy blocking"

**Solución**:
1. Asegúrate de que el backend Django esté corriendo
2. Verifica que en el backend Django, el archivo `.env` tenga:
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:4200
   ```

### Error: "Cannot find module @angular/material"

**Solución**:
```bash
npm install @angular/material@17 @angular/cdk@17 @angular/animations@17
```

### Error: "Firebase: Error (auth/popup-blocked)"

**Solución**: Permite pop-ups en tu navegador para localhost:4200

### Error: "Código incorrecto o expirado"

**Solución**:
- Los códigos 2FA expiran en 5 minutos
- Tienes máximo 5 intentos
- Si expira o superas los intentos, debes volver a registrarte/iniciar sesión

---

## 📱 **COMPATIBILIDAD**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🚀 **COMANDOS ÚTILES**

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Ejecutar en puerto específico
ng serve --port 4200

# Abrir automáticamente
ng serve --open

# Build para producción
ng build

# Ver estructura del proyecto
ng generate component nombre-componente --skip-tests

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 **ENDPOINTS DEL BACKEND**

El frontend se comunica con estos endpoints del backend Django:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/usuarios/csrf/` | GET | Obtener CSRF token |
| `/api/usuarios/register/` | POST | Registrar usuario |
| `/api/usuarios/register/2fa/verificar/` | POST | Verificar 2FA registro |
| `/api/usuarios/login/` | POST | Iniciar sesión |
| `/api/usuarios/login/2fa/verificar/` | POST | Verificar 2FA login |
| `/api/usuarios/login/google/` | POST | Login con Google |

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

Antes de ejecutar, verifica que:

- [ ] Backend Django está corriendo en `http://localhost:8000`
- [ ] Firebase está configurado en `environment.ts`
- [ ] Autenticación de Google está habilitada en Firebase Console
- [ ] Dependencias instaladas con `npm install`
- [ ] No hay errores en la consola del navegador

---

## 🎉 **¡LISTO!**

Si todo está configurado correctamente:

1. Backend Django corriendo en `http://localhost:8000`
2. Frontend Angular corriendo en `http://localhost:4200`
3. Firebase configurado correctamente

**¡Ya puedes usar la aplicación completa!**

---

## 📧 **SOPORTE**

Si tienes problemas:

1. Verifica que el backend Django esté corriendo
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que las credenciales de Firebase sean correctas
4. Asegúrate de que el backend tenga CORS habilitado

---

**Desarrollado con Angular 17 + Angular Material + Firebase** 🚀
