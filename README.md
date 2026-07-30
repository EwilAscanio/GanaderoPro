# Sistema Ganadero - Dashboard

**Creador:** [Ewilascanio](https://www.ewilascanio.com)  
**Portafolio:** [www.ewilascanio.com](https://www.ewilascanio.com)

Sistema de gestión ganadera desarrollado con **Next.js 16**, **PostgreSQL** y **NextAuth.js**. Permite administrar animales, registros de producción, facturación, nacimientos, palpaciones y más.

## Tecnologías

- **Next.js 16** (App Router)
- **PostgreSQL** (con `pg`)
- **NextAuth.js** (autenticación)
- **React Hook Form** (formularios)
- **Axios** (cliente HTTP)
- **Recharts** (gráficos)
- **@react-pdf/renderer** (generación de PDF)
- **Lucide React** (iconos)

## Requisitos

- Node.js 18+
- PostgreSQL

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tu_bd
DB_USER=tu_user_bd
DB_PASSWORD=tu_password

NEXTAUTH_SECRET=mi-secreto-seguro
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_EMPRESA_NOMBRE=MI EMPRESA
```

## Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Módulos

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Dashboard con estadísticas y gráficos |
| `/dashboard/animales` | CRUD de animales |
| `/dashboard/animales/registrar` | Registro de nuevo animal |
| `/dashboard/animales/actualizar/[codigo]` | Actualizar animal |
| `/dashboard/clientes` | CRUD de clientes |
| `/dashboard/familia` | Gestión de familias |
| `/dashboard/grupo` | Gestión de grupos |
| `/dashboard/nacimiento` | Registro de nacimientos |
| `/dashboard/palpacion` | Registro de palpaciones |
| `/dashboard/produccion-leche` | Registro de producción de leche |
| `/dashboard/peso` | Registro de peso |
| `/dashboard/vacunacion` | Registro de vacunación |
| `/dashboard/ventas` | Gestión de ventas/facturación |
| `/dashboard/configuracion` | Configuración del sistema |
| `/dashboard/usuarios` | Gestión de usuarios |
| `/dashboard/reportes` | Centro de reportes (ver sección Reportes) |

## Reportes

El sistema incluye **7 reportes** con generación de PDF descargable:

| Reporte | Descripción | Filtros |
|---------|-------------|---------|
| **Familias por Grupo** | Animales agrupados por familia | Grupo, Familia |
| **Producción de Leche** | Litros de leche registrados | Rango de fechas |
| **Facturas** | Facturas emitidas con totales | Rango de fechas |
| **Clientes** | Listado completo de clientes | Ninguno |
| **Nacimientos** | Registro de partos | Rango de fechas |
| **Madres y Crías** | Madres con sus crías (vínculo por codigomadre_ani) | Código de madre |
| **Palpaciones** | Histórico de palpaciones realizadas | Rango de fechas |

## Roles

- **Administrador**: acceso completo a todas las funciones
- **Usuario**: acceso limitado a consulta

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/animal` | Listar / crear animal |
| GET/PUT/DELETE | `/api/animal/[codigo]` | Obtener / actualizar / eliminar animal |
| GET | `/api/animal/[codigo]/crias` | Obtener crías de una madre |
| GET/POST | `/api/clientes` | Listar / crear cliente |
| GET/PUT/DELETE | `/api/clientes/[codigo]` | Obtener / actualizar / eliminar cliente |
| GET/POST | `/api/familia` | Listar / crear familia |
| GET/POST | `/api/grupo` | Listar / crear grupo |
| GET/POST | `/api/nacimiento` | Listar / crear nacimiento |
| POST | `/api/palpacion` | Registrar palpación |
| GET/POST | `/api/produccion-leche` | Listar / crear producción de leche |
| POST | `/api/factura` | Crear factura |
| GET | `/api/dashboard/stats` | Estadísticas del dashboard |
| GET | `/api/reportes/*` | Endpoints para reportes |

## Base de Datos

### Tablas principales

- **animal** - Animales del sistema
- **clientes** - Clientes
- **factura / detalle_factura** - Facturación
- **familia / grupo** - Clasificación de animales
- **nacimiento** - Registro de partos
- **palpacion** - Histórico de palpaciones
- **produccionleche** - Producción lechera
- **vacunacion** - Registro de vacunas
- **configuracion** - Configuración del sistema
- **users / roles** - Usuarios y roles
