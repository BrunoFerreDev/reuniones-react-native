# Módulo Frontend: Proyecto del Secretario

Documentación técnica y especificación de peticiones API HTTP para el proyecto Frontend del **Secretario**.

---

## 🔒 Autenticación y Autorización

- **Header requerido**: `Authorization: Bearer <TOKEN_JWT>`
- **Roles autorizados**: `SECRETARIO`, `PRESIDENTE`, `SUPERUSER`

---

## 📋 Tabla de Endpoints Disponibles por Dominio

### 👤 Gestión de Árbitros (`/arbitros/**`)

| Método | Endpoint                                   | Descripción                                                                       | Roles Autorizados                        |
| :----- | :----------------------------------------- | :-------------------------------------------------------------------------------- | :--------------------------------------- |
| `POST` | `/arbitros`                                | Crear un nuevo árbitro en la plataforma                                           | `SECRETARIO`, `PRESIDENTE`               |
| `PUT`  | `/arbitros/{idArbitro}`                    | Modificar datos personales o deportivos de un árbitro                             | `SECRETARIO`, `PRESIDENTE`               |
| `GET`  | `/arbitros`                                | Traer listado completo de árbitros (Paginado)                                     | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/arbitros/traer-disponibles`              | Traer árbitros disponibles                                                        | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/arbitros/no-disponibles`                 | Traer árbitros no disponibles                                                     | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/arbitros/por-rol`                        | Filtrar árbitros por rol asignado (`SUPERUSER`, `SECRETARIO`, `DESIGNADOR`, etc.) | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `PUT`  | `/arbitros/{idArbitro}/toggle`             | Activar / Desactivar estado del árbitro                                           | `SECRETARIO`, `PRESIDENTE`               |
| `PUT`  | `/arbitros/{idArbitro}/disponibilidad`     | Actualizar disponibilidad de un árbitro específico                                | `SECRETARIO`, `DESIGNADOR`               |
| `PUT`  | `/arbitros/modificar-disponibilidad-total` | Resetear disponibilidad global de la nómina                                       | `SUPERUSER`, `PRESIDENTE`                |

---

### 🚫 Gestión de Suspensiones y Sanciones (`/suspenciones/**`)

| Método   | Endpoint                             | Descripción                                      | Roles Autorizados                        |
| :------- | :----------------------------------- | :----------------------------------------------- | :--------------------------------------- |
| `GET`    | `/suspenciones`                      | Traer todas las suspensiones cargadas (Paginado) | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `POST`   | `/arbitros/{idArbitro}/suspenciones` | Cargar nueva sanción / suspensión a un árbitro   | `SECRETARIO`, `PRESIDENTE`               |
| `GET`    | `/arbitros/{idArbitro}/suspenciones` | Consultar historial de sanciones de un árbitro   | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `DELETE` | `/suspenciones/{idSuspencion}`       | Eliminar / anular una suspensión activa          | `SECRETARIO`, `PRESIDENTE`               |

---

### 📝 Módulo de Reuniones y Actas (`/reuniones/**`)

| Método | Endpoint                            | Descripción                                           | Roles Autorizados                        |
| :----- | :---------------------------------- | :---------------------------------------------------- | :--------------------------------------- |
| `POST` | `/reuniones`                        | Crear nueva reunión de comisión / colegio de árbitros | `SECRETARIO`, `PRESIDENTE`               |
| `GET`  | `/reuniones`                        | Listar actas y reuniones registradas                  | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/reuniones/{idReunion}`            | Obtener detalle de acta de reunión por ID             | `SECRETARIO`, `PRESIDENTE`               |
| `PUT`  | `/reuniones/{idReunion}`            | Actualizar temas tratados y conclusiones del acta     | `SECRETARIO`, `PRESIDENTE`               |
| `POST` | `/reuniones/{idReunion}/asistencia` | Tomar / registrar asistencia de árbitros convocados   | `SECRETARIO`, `PRESIDENTE`               |

---

### 👁️ Supervisión de Designaciones y Finanzas (Lectura)

| Método | Endpoint                      | Descripción                              | Roles Autorizados                        |
| :----- | :---------------------------- | :--------------------------------------- | :--------------------------------------- |
| `GET`  | `/designaciones/buscar`       | Consultar cuadrillas y fechas disputadas | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/designaciones/mes`          | Consultar designaciones por mes          | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/designaciones/estadisticas` | Consultar estadísticas generales         | `SECRETARIO`, `PRESIDENTE`, `DESIGNADOR` |
| `GET`  | `/finanzas/dashboard`         | Consultar balance y estado de tesorería  | `SECRETARIO`, `PRESIDENTE`               |

---

## 🚀 Detalle de Peticiones y Payloads JSON

### 1. Crear Nuevo Árbitro

- **Endpoint**: `POST /arbitros`
- **Body (`ArbitroDTO`)**:

```json
{
  "nombre": "Carlos",
  "apellido": "González",
  "dni": "38999111",
  "email": "carlos.gonzalez@example.com",
  "whatsapp": "+5493764000000",
  "categoria": "INTERMEDIO",
  "tieneAuto": true
}
```

> **Categorías disponibles**: `INICIAL`, `EN_FORMACION`, `INTERMEDIO`, `AVANZADO`, `PRINCIPAL_1`, `PRINCIPAL_2`, `PRINCIPAL_3`.

- **Respuesta (200 OK)**:

```json
{
  "idArbitro": 12,
  "nombre": "Carlos",
  "apellido": "González",
  "dni": "38999111",
  "email": "carlos.gonzalez@example.com",
  "whatsapp": "+5493764000000",
  "categoria": "INTERMEDIO",
  "tieneAuto": true,
  "activo": true,
  "roles": ["ARBITRO"]
}
```

---

### 2. Cargar Suspensión a Árbitro

- **Endpoint**: `POST /arbitros/{idArbitro}/suspenciones`
- **Body (`SuspencionDTO`)**:

```json
{
  "idArbitro": 12,
  "idCancha": 3,
  "tipoSuspencion": 2,
  "fechaIncidente": "2026-09-20T10:00:00",
  "fechaFin": "2026-10-20T23:59:59",
  "motivo": "Conducta antideportiva en cancha"
}
```

> **Valores para `tipoSuspencion`**: `1` (Amonestación/Leve), `2` (Inhabilitación por Fecha / Cancha).

- **Respuesta (200 OK)**:

```json
{
  "idSuspencion": 5,
  "idArbitro": 12,
  "nombreArbitro": "Carlos González",
  "nombreCancha": "Cancha San Martín",
  "tipoSuspencion": 2,
  "fechaIncidente": "2026-09-20T10:00:00",
  "fechaFin": "2026-10-20T23:59:59",
  "motivo": "Conducta antideportiva en cancha"
}
```

---

### 3. Crear Reunión

- **Endpoint**: `POST /reuniones`
- **Body (`ReunionDTO`)**:

```json
{
  "fecha": "2026-09-25T19:00:00",
  "lugar": "Sede Central Colegio de Árbitros",
  "temasTratados": "Revisión de reglamento y designaciones de la fecha 10",
  "asistentesIds": [8, 12, 15, 19]
}
```

- **Respuesta (200 OK)**:

```json
{
  "idReunion": 3,
  "fecha": "2026-09-25T19:00:00",
  "lugar": "Sede Central Colegio de Árbitros",
  "temasTratados": "Revisión de reglamento y designaciones de la fecha 10",
  "cantidadAsistentes": 4
}
```
