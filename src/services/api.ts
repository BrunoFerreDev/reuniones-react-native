import {
  AuthLogin,
  AuthResponse,
  CrearReunionDTO,
  GetArbitroDTO,
  GetDisponibilidadFinDeSemanaDTO,
  GetReunionDetalleDTO,
  GetReunionResumenDTO,
  Page,
  RegistrarAsistenciaBatchDTO,
  TemaReunionDTO,
} from "@/types";

let currentBaseUrl: string =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8085";

let currentToken = "";

export const ApiConfig = {
  getBaseUrl: () => currentBaseUrl,
  setBaseUrl: (url: string) => {
    currentBaseUrl = url;
  },
  getToken: () => currentToken,
  setToken: (token: string) => {
    currentToken = token;
  },
};

// Generic HTTP request strictly calling backend API
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }

  const url = `${currentBaseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && (errData.message || errData.error)) {
        errorMsg = errData.message || errData.error;
      }
    } catch {
      const errText = await response.text().catch(() => "");
      if (errText) errorMsg = errText;
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// Reuniones API
export const ReunionesService = {
  listar: (page = 0, size = 10) =>
    request<Page<GetReunionResumenDTO>>(`reuniones?page=${page}&size=${size}`),

  buscarPorFecha: (
    fechaInicio: string,
    fechaFin: string,
    page = 0,
    size = 10,
  ) =>
    request<Page<GetReunionResumenDTO>>(
      `reuniones/buscar?fechaIncio=${encodeURIComponent(
        fechaInicio,
      )}&fechaFin=${encodeURIComponent(fechaFin)}&page=${page}&size=${size}`,
    ),

  obtenerDetalle: (idReunion: number) =>
    request<GetReunionDetalleDTO>(`reuniones/${idReunion}`),

  crear: (data: CrearReunionDTO) =>
    request<GetReunionDetalleDTO>("reuniones", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizar: (idReunion: number, data: CrearReunionDTO) =>
    request<GetReunionDetalleDTO>(`reuniones/${idReunion}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  actualizarTemas: (idReunion: number, temas: TemaReunionDTO[]) =>
    request<GetReunionDetalleDTO>(`reuniones/${idReunion}/temas`, {
      method: "PUT",
      body: JSON.stringify(temas),
    }),

  registrarAsistencia: (idReunion: number, data: RegistrarAsistenciaBatchDTO) =>
    request<GetReunionDetalleDTO>(`reuniones/${idReunion}/asistencia`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  obtenerDisponibilidadFinde: (idReunion: number) =>
    request<GetDisponibilidadFinDeSemanaDTO>(
      `reuniones/${idReunion}/disponibilidad-finde`,
    ),

  eliminar: (idReunion: number) =>
    request<string>(`reuniones/${idReunion}`, {
      method: "DELETE",
    }),
};

// Árbitros API
export const ArbitrosService = {
  listar: (page = 0, size = 50) =>
    request<Page<GetArbitroDTO>>(`arbitros?page=${page}&size=${size}`),

  crear: (data: Partial<GetArbitroDTO>) =>
    request<GetArbitroDTO>("arbitros", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Autenticación API
export const AuthService = {
  login: async (creds: AuthLogin): Promise<AuthResponse> => {
    const res = await request<AuthResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    if (res && res.token) {
      ApiConfig.setToken(res.token);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await request<string>("auth/logout", {
        method: "POST",
      });
    } finally {
      ApiConfig.setToken("");
    }
  },
};
