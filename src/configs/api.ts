const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hauzserver.onrender.com";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  USERS: `${API_BASE_URL}/api/users`,
  COMPANIES: `${API_BASE_URL}/api/companies`,
  BOARDS: `${API_BASE_URL}/api/boards`,
  CARDS: `${API_BASE_URL}/api/cards`,
  TASKS: `${API_BASE_URL}/api/tasks`,
};

// ========== BOARDS API ==========
export const boardsAPI = {
  getAll: async (userId: number, role: string) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}?user_id=${userId}&role=${role}`);
    if (!response.ok) throw new Error("Erro ao carregar boards");
    return response.json();
  },

  create: async (data: { name: string; description?: string; company_id: number; created_by: number }) => {
    const response = await fetch(API_ENDPOINTS.BOARDS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar board");
    return response.json();
  },

  delete: async (id: number, userId: number, role: string) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${id}?user_id=${userId}&role=${role}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar board");
    return response.json();
  },

  getUsers: async (boardId: number) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${boardId}/users`);
    if (!response.ok) throw new Error("Erro ao carregar usuários do board");
    return response.json();
  },

  addUser: async (boardId: number, userId: number, adminId: number) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${boardId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, admin_id: adminId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao adicionar usuário");
    }
    return response.json();
  },

  removeUser: async (boardId: number, userId: number, adminId: number) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${boardId}/users/${userId}?admin_id=${adminId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao remover usuário");
    }
    return response.json();
  },
};

// ========== CARDS API ==========
export const cardsAPI = {
  getAll: async (boardId: number) => {
    const response = await fetch(`${API_ENDPOINTS.CARDS}?board_id=${boardId}`);
    if (!response.ok) throw new Error("Erro ao carregar cards");
    return response.json();
  },

  create: async (data: { board_id: number; title: string; position: number }) => {
    const response = await fetch(API_ENDPOINTS.CARDS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar card");
    return response.json();
  },

  update: async (id: number, data: { title: string }) => {
    const response = await fetch(`${API_ENDPOINTS.CARDS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar card");
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_ENDPOINTS.CARDS}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar card");
    return response.json();
  },
};

// ========== TASKS API ==========
export const tasksAPI = {
  getAll: async (cardId: number) => {
    const response = await fetch(`${API_ENDPOINTS.TASKS}?card_id=${cardId}`);
    if (!response.ok) throw new Error("Erro ao carregar tasks");
    return response.json();
  },

  create: async (data: { card_id: number; content: string; position: number; image?: File }) => {
    const formData = new FormData();
    formData.append("card_id", data.card_id.toString());
    formData.append("content", data.content);
    formData.append("position", data.position.toString());

    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await fetch(API_ENDPOINTS.TASKS, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar task");
    }

    return response.json();
  },

  update: async (id: number, data: { content?: string; completed?: boolean }) => {
    const response = await fetch(`${API_ENDPOINTS.TASKS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar task");
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_ENDPOINTS.TASKS}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar task");
    return response.json();
  },

  deleteImage: async (id: number) => {
    const response = await fetch(`${API_ENDPOINTS.TASKS}/${id}/image`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar imagem");
    return response.json();
  },
};