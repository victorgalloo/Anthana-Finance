# Rendimientos Web

Aplicación de gestión de rendimientos construida con React + Vite + TypeScript + Firebase.

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase (Opcional para desarrollo)
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication (Email/Password)
4. Copia las credenciales a `.env`:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

## 📱 Funcionalidades

- ✅ **Autenticación con Firebase**
  - Login/Registro con email y contraseña
  - Protección de rutas
  - Gestión de sesiones

- ✅ **Rutas Protegidas**
  - `/login` - Página de autenticación
  - `/app` - Panel de usuario (requiere login)
  - `/admin` - Panel de administración (requiere email con "admin")

- ✅ **UI Moderna**
  - Diseño con Tailwind CSS
  - Responsive
  - Navegación intuitiva

## 🔧 Desarrollo Sin Firebase

La aplicación funciona sin configuración de Firebase:
- Muestra advertencia de configuración
- Permite ver la interfaz y navegación
- Perfecta para desarrollo frontend

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx      # Barra de navegación
│   └── ProtectedRoute.tsx # Protección de rutas
├── hooks/              # Custom hooks
│   └── useAuth.ts      # Hook de autenticación
├── pages/              # Páginas de la aplicación
│   ├── Login.tsx       # Página de login
│   ├── Admin.tsx       # Panel de administración
│   └── App.tsx         # Panel de usuario
├── firebase.ts         # Configuración de Firebase
└── App.tsx             # Componente principal
```

## 🎯 Próximos Pasos

1. **Configurar Firebase** para autenticación real
2. **Implementar Firestore** para datos
3. **Añadir funcionalidades** de rendimientos
4. **Mejorar UI/UX** con más componentes
5. **Testing** y optimización

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router DOM
- **Build**: Vite