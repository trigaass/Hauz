const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://hauzserver.onrender.com";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  USERS: `${API_BASE_URL}/api/users`,
  COMPANIES: `${API_BASE_URL}/api/companies`,
  BOARDS: `${API_BASE_URL}/api/boards`,
  CARDS: `${API_BASE_URL}/api/cards`,
  TASKS: `${API_BASE_URL}/api/tasks`,
  CHAT: `${API_BASE_URL}/api`,
  ATTACHMENTS: `${API_BASE_URL}/api/attachments`,
};

// ========== BOARDS API ==========
export const boardsAPI = {
  // Buscar todos os boards de uma empresa
  getAll: async (companyId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BOARDS}?company_id=${companyId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar boards");
    return response.json();
  },

  // Criar board
  create: async (data: {
    name: string;
    company_id: number;
    created_by: number; // ✅ ADICIONAR
    description?: string;
  }) => {
    const response = await fetch(API_ENDPOINTS.BOARDS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar board");
    return response.json();
  },

  // Deletar board
  delete: async (id: number) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar board");
    return response.json();
  },

  // Buscar usuários de um board
  getUsers: async (boardId: number) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${boardId}/users`);
    if (!response.ok) throw new Error("Erro ao carregar usuários do board");
    return response.json();
  },

  // 🆕 Buscar todas as imagens de um board
  getImages: async (boardId: number) => {
    const response = await fetch(`${API_ENDPOINTS.BOARDS}/${boardId}/images`);
    if (!response.ok) throw new Error("Erro ao carregar imagens do board");
    return response.json();
  },

  // Adicionar usuário ao board
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

  // Remover usuário de um board
  removeUser: async (boardId: number, userId: number, adminId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BOARDS}/${boardId}/users/${userId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId }),
      }
    );
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

  create: async (data: {
    board_id: number;
    title: string;
    position: number;
  }) => {
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

  create: async (data: {
    card_id: number;
    content: string;
    position: number;
    image?: File;
  }) => {
    const formData = new FormData();
    formData.append("card_id", data.card_id.toString());
    formData.append("content", data.content);
    formData.append("position", data.position.toString());
    if (data.image) formData.append("image", data.image);

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

  update: async (
    id: number,
    data: { content?: string; completed?: boolean }
  ) => {
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

// ========== CHAT API ==========
export const chatAPI = {
  // Buscar usuários disponíveis para conversar
  getAvailableUsers: async (userId: number, companyId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.CHAT}/users/available?user_id=${userId}&company_id=${companyId}`
    );
    if (!response.ok) throw new Error("Erro ao buscar usuários");
    return response.json();
  },

  // Criar ou buscar conversa
  getOrCreateConversation: async (userId1: number, userId2: number) => {
    const response = await fetch(`${API_ENDPOINTS.CHAT}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id_1: userId1, user_id_2: userId2 }),
    });
    if (!response.ok) throw new Error("Erro ao criar conversa");
    return response.json();
  },

  // Buscar conversas do usuário
  getUserConversations: async (userId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.CHAT}/conversations/user/${userId}`
    );
    if (!response.ok) throw new Error("Erro ao buscar conversas");
    return response.json();
  },

  // Buscar mensagens de uma conversa
  getMessages: async (
    conversationId: number,
    userId: number,
    limit = 50,
    offset = 0
  ) => {
    const response = await fetch(
      `${API_ENDPOINTS.CHAT}/conversations/${conversationId}/messages?user_id=${userId}&limit=${limit}&offset=${offset}`
    );
    if (!response.ok) throw new Error("Erro ao buscar mensagens");
    return response.json();
  },

  // Enviar mensagem
  sendMessage: async (
    conversationId: number,
    senderId: number,
    content: string
  ) => {
    const response = await fetch(`${API_ENDPOINTS.CHAT}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      }),
    });
    if (!response.ok) throw new Error("Erro ao enviar mensagem");
    return response.json();
  },

  // Marcar mensagens como lidas
  markAsRead: async (conversationId: number, userId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.CHAT}/conversations/${conversationId}/read`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }
    );
    if (!response.ok) throw new Error("Erro ao marcar como lido");
    return response.json();
  },
};

// ========== SESSIONS API ==========
export const sessionsAPI = {
  // Registrar login
  registerLogin: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/sessions/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) throw new Error("Erro ao registrar login");
    return response.json();
  },

  // Registrar logout
  registerLogout: async (sessionId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/sessions/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!response.ok) throw new Error("Erro ao registrar logout");
    return response.json();
  },

  // Buscar tempo de todos os usuários (Admin)
  getAllUsersTime: async (companyId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/users/all?company_id=${companyId}`
    );
    if (!response.ok) throw new Error("Erro ao buscar tempo dos usuários");
    return response.json();
  },
};

// ========== ATTACHMENTS API ==========
export const attachmentsAPI = {
  // Buscar todos os anexos da empresa
  getAll: async (companyId: number, userId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.ATTACHMENTS}?company_id=${companyId}&user_id=${userId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar anexos");
    return response.json();
  },

  // Buscar anexo específico
  getById: async (id: number, userId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.ATTACHMENTS}/${id}?user_id=${userId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar anexo");
    return response.json();
  },

  // Criar anexo (com upload de arquivo)
  create: async (data: {
    file: File;
    company_id: number;
    uploaded_by: number;
    title: string;
    description?: string;
  }) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("company_id", data.company_id.toString());
    formData.append("uploaded_by", data.uploaded_by.toString());
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);

    const response = await fetch(API_ENDPOINTS.ATTACHMENTS, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao enviar anexo");
    }

    return response.json();
  },

  // Marcar como visto
  markAsViewed: async (id: number, userId: number) => {
    const response = await fetch(`${API_ENDPOINTS.ATTACHMENTS}/${id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) throw new Error("Erro ao marcar como visto");
    return response.json();
  },

  // Buscar estatísticas (admin)
  getStats: async (id: number, adminId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.ATTACHMENTS}/${id}/stats?admin_id=${adminId}`
    );
    if (!response.ok) throw new Error("Erro ao buscar estatísticas");
    return response.json();
  },

  // Buscar usuários que não visualizaram (admin)
  getNotViewed: async (id: number, adminId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.ATTACHMENTS}/${id}/not-viewed?admin_id=${adminId}`
    );
    if (!response.ok) throw new Error("Erro ao buscar usuários");
    return response.json();
  },

  // Deletar anexo (admin)
  delete: async (id: number, adminId: number) => {
    const response = await fetch(`${API_ENDPOINTS.ATTACHMENTS}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: adminId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao deletar anexo");
    }
    return response.json();
  },
};
