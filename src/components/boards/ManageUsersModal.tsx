import { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX, FiUserPlus, FiTrash2 } from "react-icons/fi";
import { API_ENDPOINTS } from "../../configs/api";

interface User {
  id: number;
  email: string;
  role: string;
}

interface ManageUsersModalProps {
  boardId: number;
  companyId: number;
  onClose: () => void;
}

export const ManageUsersModal = ({ boardId, companyId, onClose }: ManageUsersModalProps) => {
  const [boardUsers, setBoardUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [boardId, companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários do board
      const boardUsersResponse = await fetch(API_ENDPOINTS.BOARD_USERS(boardId));
      if (!boardUsersResponse.ok) {
        throw new Error("Erro ao buscar usuários do board");
      }
      const boardUsersData = await boardUsersResponse.json();
      setBoardUsers(boardUsersData);

      // Buscar todos os usuários da empresa
      const allUsersResponse = await fetch(`${API_ENDPOINTS.USERS}?company_id=${companyId}`);
      if (!allUsersResponse.ok) {
        throw new Error("Erro ao buscar usuários da empresa");
      }
      const allUsersData = await allUsersResponse.json();

      // Filtrar usuários que NÃO estão no board
      const boardUserIds = new Set(boardUsersData.map((u: User) => u.id));
      const available = allUsersData.filter((u: User) => !boardUserIds.has(u.id));
      setAvailableUsers(available);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      alert("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) {
      alert("Selecione um usuário");
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.BOARDS}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: boardId,
          user_id: parseInt(selectedUserId),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao adicionar usuário");
      }

      alert("Usuário adicionado com sucesso!");
      setSelectedUserId("");
      fetchData();
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao adicionar usuário");
      }
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!confirm("Tem certeza que deseja remover este usuário do board?")) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.BOARDS}/users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: boardId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao remover usuário");
      }

      alert("Usuário removido com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao remover usuário");
      }
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Gerenciar Usuários do Board</h2>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          {loading ? (
            <LoadingText>Carregando...</LoadingText>
          ) : (
            <>
              <Section>
                <SectionTitle>Adicionar Usuário</SectionTitle>
                <AddUserForm>
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Selecione um usuário</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email} ({user.role === "admin" ? "Admin" : "Usuário"})
                      </option>
                    ))}
                  </Select>
                  <AddButton
                    onClick={handleAddUser}
                    disabled={!selectedUserId}
                  >
                    <FiUserPlus /> Adicionar
                  </AddButton>
                </AddUserForm>
                {availableUsers.length === 0 && (
                  <EmptyText>Todos os usuários da empresa já têm acesso</EmptyText>
                )}
              </Section>

              <Section>
                <SectionTitle>
                  Usuários com Acesso ({boardUsers.length})
                </SectionTitle>
                {boardUsers.length === 0 ? (
                  <EmptyText>Nenhum usuário com acesso</EmptyText>
                ) : (
                  <UsersList>
                    {boardUsers.map((user) => (
                      <UserItem key={user.id}>
                        <UserInfo>
                          <UserEmail>{user.email}</UserEmail>
                          <UserRole>
                            {user.role === "admin" ? "Administrador" : "Usuário"}
                          </UserRole>
                        </UserInfo>
                        <RemoveButton
                          onClick={() => handleRemoveUser(user.id)}
                          title="Remover usuário"
                        >
                          <FiTrash2 />
                        </RemoveButton>
                      </UserItem>
                    ))}
                  </UsersList>
                )}
              </Section>
            </>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const AddUserForm = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Select = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  svg {
    font-size: 16px;
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserEmail = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #666;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #ffebee;
  }

  svg {
    font-size: 18px;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 40px 0;
`;

const EmptyText = styled.p`
  color: #999;
  font-size: 14px;
  font-style: italic;
  margin: 8px 0;
`;