
# ✈️ Tierra Nativa - Paquetes de Viaje

Aplicación web especializada en la gestión y visualización de paquetes turísticos en Argentina. Permite a los usuarios explorar destinos y detalles de itinerario. Los administradores disponen de un completo **CRUD** con una interfaz optimizada y totalmente **responsiva**.

---

## ⚙️ Tecnologías - Frontend

### 🖥️ Core

- **React** (`^19.1.1`)
- **Vite**
- **React Router DOM** (`^7.6.0`)
- **React Testing Library + Jest/Vitest**
- **Context API** Gestión de estado global para paquetes y autenticación de usuario.

### 🎨 Diseño y UI

- **SweetAlert2** (Feedback de usuario)
- **Lucide React** (Iconografía)
- **CSS Modular** (Diseño Responsivo)
- **Diseño Responsivo** Adaptación completa a dispositivos móviles y escritorio (con restricciones específicas para administración).


### 🛠️ Comunicación y Utilidades

- **Axios** (`^1.12.2`)
- **JWT Decode** Decodificación de claims para validación de roles en el cliente.
- **Date-fns** React Datepicker Gestión de calendarios dobles y rangos de fecha.

## ☕ Backend

- **Java** (`21`)
- **Spring Boot** (`3.5.6`)
- **Spring Data JPA**
- **Lombok**
- **Spring Security**  (Autenticación y Autorización)
- **JSON Web Token (JWT)**  (Seguridad basada en estados/tokens)
- **Spring Boot Starter Web**  (Controladores REST)
- **H2 Database** (Runtime/Testing)

---

## 🔑 Funcionalidades Clave

### 👤 Área de Usuario

- **Catálogo Dinámico y Detalle:**  Filtrado por categorías, buscador inteligente y visualización de itinerarios con características dinámicas.

- **Búsqueda Avanzada y Disponibilidad:**  Motor de búsqueda por fechas y provincia con validación de cupos en tiempo real.

- **Calendario con Lógica de Duración Fija:**  Al seleccionar la fecha de inicio, el sistema autocalcula la fecha de fin según los días establecidos para cada paquete.

- **Proceso de Reserva (Checkout):**  Definición de cantidad de personas, captura de número de teléfono y campo de solicitudes especiales. El sistema calcula el total dinámicamente basado en los viajeros.

- **Sistema de Favoritos y Reseñas:**  Persistencia de intereses y lógica de valoración donde solo usuarios con viajes finalizados pueden puntuar.

- **Política de Cancelación:**  Autogestión de cancelaciones permitida hasta 15 días antes de la fecha de inicio.

- **Notificaciones Duales por Correo:**  Envío automático de correo para confirmación de reserva (Voucher) y para confirmación de cancelación.

- **Conectividad Social y Soporte:**  Botón flotante de WhatsApp dinámico y módulo de compartir enlaces.

- **Sistema de Favoritos** Sección privada ("Mis Favoritos") para usuarios autenticados, permitiendo persistir intereses y agilizar la conversión de compra.

- **Reseñas Verificadas** Lógica de negocio donde solo los usuarios con viajes finalizados pueden puntuar y comentar. El sistema recalcula automáticamente el promedio de estrellas en tiempo real.

- **Transparencia y Políticas** Bloque informativo obligatorio en cada paquete detallando políticas de Medio Ambiente, Seguridad y Cancelación.

- **Conectividad Social** Módulo de "Compartir" con copia rápida de enlaces y redirección optimizada a redes sociales.


###  🛡️ Panel de Administración (Desktop Only)

- **Gestión Administrativa de Reservas:** Nuevo panel para supervisar ventas que incluye:

**Listado detallado:** Quién reservó, correo, teléfono, fechas y total.

**Estado de Ocupación:** Monitoreo de cupos disponibles por paquete y fecha.

**Checklist de Coordinación:** Registro interactivo para marcar si ya se estableció contacto con el cliente.

- **Gestión de Paquetes** CRUD completo con asignación de categorías y múltiples características.

- **Gestión de Categorías** Creación de nuevas categorías con soporte para imágenes representativas.

- **Gestión de Características** Sistema de iconos inteligentes (Auto-asignación basada en el título).

- **Control de Usuarios** Listado de usuarios y gestión de permisos (Upgrade a ADMIN).

---

## 🔑 Acceso Especial y Roles de Usuario

El sistema cuenta con una jerarquía de permisos diseñada para proteger la integridad de los datos.

### 🛡️ Superusuario 

Para obtener privilegios totales de creación, edición y eliminación en todo el sistema, se ha reservado una cuenta de desarrollador específica.

- **Correo electrónico**  tierranativa.dev@gmail.com

- **Contraseña**  Tierranativa24$

Requisito previo: Debe iniciar sesión con el correo electronico y contraseña definida, el sistema reconocerá este dominio/correo y le asignará automáticamente el rol de SUPERUSUARIO con permisos de escritura.

El superusuario puede crear reseñas en los paquetes ya que tiene estado "finalizado" en las mismas.

### 👥 Administradores de Lectura

Si a un usuario registrado se le otorga el permiso de "Administrador" desde el panel de gestión de usuarios, sus capacidades serán limitadas:

- **Acceso**  Podrá visualizar todos los paneles de administración (Usuarios, Paquetes, Categorías, Características) y usar su CRUD excepto el de Usuarios.

- **Restricción**  No podrá otorgar ni autorevocarse el role de ADMIN, tendrá solo permiso de LECTURA. 

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

Arianna Corneliz - @CornelizA

## 📞 Soporte
¿Encontraste un bug o tienes una sugerencia?

- 🐛 Reportar bug

- 📧 Email: ariannaesthefani@gmail.com
