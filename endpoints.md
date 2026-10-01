# Especificación de API & Modelos de Datos - CIRCAJA Reuniones

## 1. Autenticación (`/auth`)

Control de acceso y seguridad mediante tokens JWT.

| Método | Endpoint       | Parámetros / Body                              | Respuesta      | Descripción                                                                     |
| :----- | :------------- | :--------------------------------------------- | :------------- | :------------------------------------------------------------------------------ |
| `POST` | `/auth/login`  | **Body:** `AuthLogin` (`whatsapp` / `username`, `password`) | `AuthResponse` | Autentica las credenciales y genera el token Bearer JWT con roles y expiración. |
| `POST` | `/auth/logout` | **Header:** `Authorization: Bearer <token>`    | `String`       | Cierra la sesión activa del usuario e invalida el contexto de seguridad.        |

---

## 2. Reuniones Arbitrales (`/reuniones`)

Gestión integral de sesiones técnicas, actas de temas analizados, control de asistencia individual con observaciones y reporte de disponibilidad para designadores.

| Método   | Endpoint                                      | Parámetros / Body                                                       | Respuesta                         | Descripción                                                                                                                |
| :------- | :-------------------------------------------- | :---------------------------------------------------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/reuniones`                                  | **Body:** `CrearReunionDTO`                                             | `GetReunionDetalleDTO`            | Registra una nueva reunión arbitral e inicializa opcionalmente la lista de asistencia con todos los árbitros activos.      |
| `GET`    | `/reuniones`                                  | **Query:** `page` (int, default: 0), `size` (int, default: 10)          | `Page<GetReunionResumenDTO>`      | Lista paginada con resumen liviano (conteos de asistencias y disponibilidades) sin transferir los textos pesados de temas. |
| `GET`    | `/reuniones/buscar`                           | **Query:** `fechaIncio` (String), `fechaFin` (String), `page` (int, opcional), `size` (int, opcional) | `Page<GetReunionResumenDTO>`      | Búsqueda de reuniones por rango de fechas (acepta `fechaIncio` / `fechaInicio` y `fechaFin`).                            |
| `GET`    | `/reuniones/{idReunion}`                      | **Path:** `idReunion` (Long)                                            | `GetReunionDetalleDTO`            | Devuelve el detalle completo de la reunión con los textos extensos de cada tema tratado y la grilla de asistencias.        |
| `PUT`    | `/reuniones/{idReunion}`                      | **Path:** `idReunion` (Long)<br>**Body:** `CrearReunionDTO`             | `GetReunionDetalleDTO`            | Actualiza los datos generales de la reunión (fecha, lugar, título, observaciones).                                         |
| `DELETE` | `/reuniones/{idReunion}`                      | **Path:** `idReunion` (Long)                                            | `String`                          | Elimina la reunión y sus temas y asistencias asociadas.                                                                    |
| `PUT`    | `/reuniones/{idReunion}/temas`                | **Path:** `idReunion` (Long)<br>**Body:** `List<TemaReunionDTO>`        | `GetReunionDetalleDTO`            | Actualiza o reemplaza la lista ordenada de temas tratados (soporta textos extensos / Markdown).                            |
| `POST`   | `/reuniones/{idReunion}/asistencia`           | **Path:** `idReunion` (Long)<br>**Body:** `RegistrarAsistenciaBatchDTO` | `GetReunionDetalleDTO`            | Registra o actualiza en lote asistencias y disponibilidades del finde, con opción de sincronizar con los árbitros activos. |
| `GET`    | `/reuniones/{idReunion}/disponibilidad-finde` | **Path:** `idReunion` (Long)                                            | `GetDisponibilidadFinDeSemanaDTO` | Reporte enfocado para designadores: árbitros disponibles sábado, disponibles domingo, ambos días y no disponibles.         |

---

## 3. Padrón de Árbitros (`/arbitros`)

Gestión y consulta del padrón oficial de colegiados.

| Método | Endpoint    | Parámetros / Query                                            | Respuesta              | Descripción                                                                               |
| :----- | :---------- | :------------------------------------------------------------ | :--------------------- | :---------------------------------------------------------------------------------------- |
| `GET`  | `/arbitros` | **Query:** `page` (int, default: 0), `size` (int, default: 10) | `Page<GetArbitroDTO>`  | Lista paginada del padrón de árbitros (activos e inactivos) con información de contacto. |

---

## 4. DTOs y Modelos de Datos (Java / Backend)

### 3.1. Autenticación

```java
public class AuthLogin {
    @NotBlank
    private String whatsapp; // Acepta número de WhatsApp o username
    @NotBlank
    private String password;
}

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private List<String> roles;
    private Long expiresIn;
}
```

---

### 3.2. Creación y Resumen de Reunión

```java
public class CrearReunionDTO {
    @NotNull
    private LocalDateTime fecha;
    @NotBlank
    private String lugar;
    @NotBlank
    private String titulo;
    private String observaciones;
    private Boolean sincronizarArbitrosActivos = true;
    private List<TemaReunionDTO> temas = new ArrayList<>();
}

public class GetReunionResumenDTO {
    private Long idReunion;
    private LocalDateTime fecha;
    private String lugar;
    private String titulo;
    private String observaciones;
    private Boolean editable;

    private int totalTemas;
    private long totalPresentes;
    private long totalAusentes;
    private long totalJustificados;
    private long disponiblesSabado;
    private long disponiblesDomingo;
}
```

---

### 3.3. Detalle Completo de Reunión

```java
public class GetReunionDetalleDTO {
    private Long idReunion;
    private LocalDateTime fecha;
    private String lugar;
    private String titulo;
    private String observaciones;
    private Boolean editable;

    private long totalPresentes;
    private long totalAusentes;
    private long totalJustificados;
    private long disponiblesSabado;
    private long disponiblesDomingo;

    @Builder.Default
    private List<TemaReunionDTO> temas = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> asistencias = new ArrayList<>();
}
```

---

### 3.4. Temas de Reunión (Orden del Día)

```java
public class TemaReunionDTO {
    private Long idTema;
    @NotBlank
    private String titulo;
    private String descripcion;
    private Integer orden;
    private String urlMaterial;
    private String conclusiones;
    private Integer tiempoMinutos;
}
```

---

### 3.5. Asistencias y Árbitros

```java
public enum EstadoAsistencia {
    PRESENTE,
    AUSENTE,
    JUSTIFICADO
}

public class GetArbitroDTO {
    private Long idArbitro;
    private String nombre;
    private String apellido;
    private String categoria;
    private String whatsapp;
    private Boolean estadoSistema;
    private Boolean tieneAuto;
    private String talleCamiseta;
    private String talleShort;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
}

public class GetAsistenciaDTO {
    private Long idAsistencia;
    private GetArbitroDTO arbitro;
    private EstadoAsistencia estadoAsistencia;
    private String observacion;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
}

public class RegistrarAsistenciaBatchDTO {
    private Boolean sincronizarConActivos;
    private List<AsistenciaItemBatchDTO> asistencias = new ArrayList<>();
}

public class AsistenciaItemBatchDTO {
    private Long idAsistencia;
    private Long idArbitro;
    @NotNull
    private EstadoAsistencia estadoAsistencia;
    private String observacion;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
}
```

---

### 3.6. Reporte de Disponibilidad Fin de Semana (Designaciones)

```java
public class GetDisponibilidadFinDeSemanaDTO {
    private Long idReunion;
    private LocalDateTime fechaReunion;
    private String tituloReunion;

    private long totalEvaluados;
    private long totalDisponiblesSabado;
    private long totalDisponiblesDomingo;
    private long totalDisponiblesAmbosDias;
    private long totalNoDisponibles;

    @Builder.Default
    private List<GetAsistenciaDTO> disponiblesSabado = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> disponiblesDomingo = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> disponiblesAmbosDias = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> noDisponibles = new ArrayList<>();
}
```

---

### 4.7. Estructura Paginada Genérica (`Page<T>`)

```java
public class Page<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean empty;
}
```

---

## 5. Configuración de Entorno (`.env`)

```env
VITE_BASE_URL="http://localhost:8081/"
```

---

## 6. Ejemplos de JSON (Payloads Request / Response)

### `GET /arbitros?page=0&size=10` (Response: `Page<GetArbitroDTO>`)
```json
{
  "content": [
    {
      "idArbitro": 1,
      "nombre": "Facundo Tello",
      "documento": "34.892.110",
      "categoria": "Principal Nacional AFA",
      "email": "f.tello@arbitros.org",
      "telefono": "+54 9 11 4820-1120",
      "activo": true
    },
    {
      "idArbitro": 2,
      "nombre": "Mariana de Almeida",
      "documento": "36.102.449",
      "categoria": "Asistente Internacional FIFA",
      "email": "m.dealmeida@arbitros.org",
      "telefono": "+54 9 11 5590-3321",
      "activo": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 14,
  "totalPages": 2,
  "first": true,
  "last": false,
  "empty": false
}
```

### `POST /reuniones` (Request)
```json
{
  "fecha": "2026-09-08T19:30:00",
  "lugar": "Sede Central Colegio de Árbitros",
  "titulo": "Reunión Técnica Semanal - Fecha 9",
  "observaciones": "Puntualidad en la entrega de informes de la fecha.",
  "sincronizarArbitrosActivos": true,
  "temas": [
    {
      "titulo": "Criterio de Manos (Regla 12)",
      "descripcion": "Análisis de video jugadas polémicas.",
      "orden": 1,
      "tiempoMinutos": 30,
      "urlMaterial": "https://ifab.com/es/laws/latest/fouls-and-misconduct/"
    }
  ]
}
```

### `POST /reuniones/{idReunion}/asistencia` (Request Batch)
```json
{
  "sincronizarConActivos": false,
  "asistencias": [
    {
      "idAsistencia": 101,
      "idArbitro": 1,
      "estadoAsistencia": "PRESENTE",
      "observacion": "Presente en horario",
      "disponibleSabado": true,
      "disponibleDomingo": true
    },
    {
      "idAsistencia": 102,
      "idArbitro": 2,
      "estadoAsistencia": "JUSTIFICADO",
      "observacion": "Certificado médico presentado",
      "disponibleSabado": false,
      "disponibleDomingo": false
    },
    {
      "idAsistencia": 103,
      "idArbitro": 3,
      "estadoAsistencia": "AUSENTE",
      "observacion": "Sin aviso previo",
      "disponibleSabado": false,
      "disponibleDomingo": false
    }
  ]
}


public class GetArbitroDTO {
    private Long idArbitro;
    private String nombre;
    private String apellido;
    private String whatsapp;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
    private String talleShort;
    private String talleCamiseta;
    private String categoria;
    private Boolean tieneAuto;
    private Boolean estadoSistema;

    public GetArbitroDTO(Arbitro arbitro) {
        this.idArbitro = arbitro.getIdArbitro();
        this.nombre = arbitro.getNombre();
        this.apellido = arbitro.getApellido();
        this.whatsapp = arbitro.getWhatsapp();
        this.disponibleSabado = arbitro.getDisponibleSabado();
        this.disponibleDomingo = arbitro.getDisponibleDomingo();
        this.talleShort = arbitro.getTalleShort();
        this.talleCamiseta = arbitro.getTalleCamiseta();
        this.categoria = arbitro.getCategoria() != null ? arbitro.getCategoria().name() : null;
        this.tieneAuto = arbitro.getTieneAuto();
        this.estadoSistema = arbitro.getEstadoSistema();
    }
    }
```