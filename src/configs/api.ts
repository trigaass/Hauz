const API_URL = "http://localhost:3000/api";

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  COMPANIES: `${API_URL}/companies`,
  USERS: `${API_URL}/users`,
  BOARDS: `${API_URL}/boards`,
  CARDS: `${API_URL}/cards`,
  TASKS: `${API_URL}/tasks`,
  BOARD_USERS: (boardId: number) => `${API_URL}/boards/${boardId}/users`,
};

// Helper para tratar erros
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  return response.text();
};

// Boards
export const boardsAPI = {
  getAll: async (userId: number, role: string) => {
    try {
      console.log(`GET ${API_URL}/boards?userId=${userId}&role=${role}`);
      const response = await fetch(`${API_URL}/boards?userId=${userId}&role=${role}`);
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em boardsAPI.getAll:", error);
      throw error;
    }
  },

  addUser: async (board_id: number, user_id: number, admin_id: number) => {
    try {
      console.log(`POST ${API_URL}/boards/users`, { board_id, user_id, admin_id });
      const response = await fetch(`${API_URL}/boards/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, user_id, admin_id }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em boardsAPI.addUser:", error);
      throw error;
    }
  },

  removeUser: async (board_id: number, user_id: number, admin_id: number) => {
    try {
      console.log(`DELETE ${API_URL}/boards/users`, { board_id, user_id, admin_id });
      const response = await fetch(`${API_URL}/boards/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, user_id, admin_id }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em boardsAPI.removeUser:", error);
      throw error;
    }
  },

  getUsers: async (board_id: number) => {
    try {
      console.log(`GET ${API_URL}/boards/${board_id}/users`);
      const response = await fetch(`${API_URL}/boards/${board_id}/users`);
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em boardsAPI.getUsers:", error);
      throw error;
    }
  },
  
  create: async (data: { name: string; description?: string; company_id: number; created_by: number }) => {
    try {
      console.log(`POST ${API_URL}/boards`, data);
      const response = await fetch(`${API_URL}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em boardsAPI.create:", error);
      throw error;
    }
  },
  
  delete: async (id: number, userId: number, role: string) => {
    try {
      console.log(`DELETE ${API_URL}/boards/${id}?userId=${userId}&role=${role}`);
      const response = await fetch(`${API_URL}/boards/${id}?userId=${userId}&role=${role}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em boardsAPI.delete:", error);
      throw error;
    }
  },
};

// Cards
export const cardsAPI = {
  getAll: async (boardId: number) => {
    try {
      console.log(`GET ${API_URL}/cards?board_id=${boardId}`);
      const response = await fetch(`${API_URL}/cards?board_id=${boardId}`);
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em cardsAPI.getAll:", error);
      throw error;
    }
  },
  
  create: async (data: { board_id: number; title?: string; position?: number }) => {
    try {
      console.log(`POST ${API_URL}/cards`, data);
      const response = await fetch(`${API_URL}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em cardsAPI.create:", error);
      throw error;
    }
  },
  
  update: async (id: number, data: { title?: string; position?: number }) => {
    try {
      console.log(`PUT ${API_URL}/cards/${id}`, data);
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em cardsAPI.update:", error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      console.log(`DELETE ${API_URL}/cards/${id}`);
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em cardsAPI.delete:", error);
      throw error;
    }
  },
};

// Tasks - 🆕 COM SUPORTE A IMAGENS
export const tasksAPI = {
  getAll: async (cardId: number) => {
    try {
      console.log(`GET ${API_URL}/tasks?card_id=${cardId}`);
      const response = await fetch(`${API_URL}/tasks?card_id=${cardId}`);
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em tasksAPI.getAll:", error);
      throw error;
    }
  },
  
  // 🆕 Criar task COM ou SEM imagem
  create: async (data: { card_id: number; content: string; position?: number; image?: File }) => {
    try {
      const formData = new FormData();
      formData.append('card_id', data.card_id.toString());
      formData.append('content', data.content);
      formData.append('position', (data.position || 0).toString());
      
      // Se tiver imagem, adicionar ao FormData
      if (data.image) {
        formData.append('image', data.image);
      }

      console.log(`POST ${API_URL}/tasks (com FormData)`);
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        // NÃO enviar Content-Type quando usar FormData - o navegador define automaticamente
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em tasksAPI.create:", error);
      throw error;
    }
  },
  
  // 🆕 Atualizar task COM ou SEM nova imagem
  update: async (id: number, data: { content?: string; position?: number; completed?: boolean; image?: File }) => {
    try {
      // Se tiver imagem, usar FormData
      if (data.image) {
        const formData = new FormData();
        if (data.content !== undefined) formData.append('content', data.content);
        if (data.position !== undefined) formData.append('position', data.position.toString());
        if (data.completed !== undefined) formData.append('completed', data.completed.toString());
        formData.append('image', data.image);

        console.log(`PUT ${API_URL}/tasks/${id} (com FormData)`);
        const response = await fetch(`${API_URL}/tasks/${id}`, {
          method: "PUT",
          body: formData,
        });
        return handleResponse(response);
      } else {
        // Sem imagem, usar JSON normal
        console.log(`PUT ${API_URL}/tasks/${id}`, data);
        const response = await fetch(`${API_URL}/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return handleResponse(response);
      }
    } catch (error) {
      console.error("Erro em tasksAPI.update:", error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      console.log(`DELETE ${API_URL}/tasks/${id}`);
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em tasksAPI.delete:", error);
      throw error;
    }
  },

  // 🆕 Deletar apenas a imagem de uma task
  deleteImage: async (id: number) => {
    try {
      console.log(`DELETE ${API_URL}/tasks/${id}/image`);
      const response = await fetch(`${API_URL}/tasks/${id}/image`, {
        method: "DELETE",
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erro em tasksAPI.deleteImage:", error);
      throw error;
    }
  },
};