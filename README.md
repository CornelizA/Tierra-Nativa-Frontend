# ✈️ Tierra Nativa - Paquetes de Viaje

Aplicación web especializada en la gestión y visualización de paquetes turísticos en Argentina. Permite a los usuarios explorar destinos y detalles de itinerario. Los administradores disponen de un completo **CRUD** con una interfaz optimizada y totalmente **responsiva**.

---

## ⚙️ Tecnologías

### 🖥️ Frontend
- **React** (`^19.1.1`)
- **Vite**
- **Axios** (`^1.12.2`)
- **React Router DOM** (`^7.6.0`)
- **SweetAlert2** (Feedback de usuario)
- **Lucide React** (Iconografía)
- **CSS Modular** (Diseño Responsivo)
- **React Testing Library + Jest/Vitest**

### ☕ Backend
- **Java** (`21`)
- **Spring Boot** (`3.5.6`)
- **Spring Data JPA**
- **Lombok**
- **H2 Database** (Runtime/Testing)

---

## 🚀 Instalación local

### 🧩 Requisitos previos
- `Node.js` (Recomendado 18+)
- `Java 21+`
- `Maven`

### 📦 Cloná el repositorio

```bash
git clone [https://github.com/CornelizA/Tierra-Nativa-Frontend.git]
cd Tierra-Nativa
```

### 📁 Backend (/)
```
Bash
# Correr el backend:
./mvnw spring-boot:run
```
El Backend estará disponible en http://localhost:8080.

### 🖼️ Frontend (/frontend)

```
Bash
cd frontend
npm install
```
Configurar variables de entorno:

```
Bash
touch .env
```

Archivo .env (Variables de entorno):

```
Fragmento de código
# .env
# Apunta al endpoint base de tu API de paquetes (Ruta actual: /paquetes)
```
VITE_API_URL=http://localhost:8080/paquetes

Correr el frontend:

```
Bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## 🧪 Testing

Cobertura completa: Se implementaron tests para todos los componentes y páginas usando Jest/Vitest y React Testing Library.

```
Bash
npm test
```

## 👤 Autores
@CornelizA

## 📞 Soporte
¿Encontraste un bug o tienes una sugerencia?

- 🐛 Reportar bug

- 📧 Email: ariannaesthefani@gmail.com