import { useState, useEffect } from "react";
import styled from "styled-components";
import { boardsAPI } from "../../configs/api";

interface BoardUser {
  id: number;
  email: string;
  role: string;
}

interface AllUser {
  id: number;
  email: string;
  role: string;
  company_id: number;
}

interface Props {
  boardId: number;
  adminId: number;
  companyId: number;
  isAdmin: boolean;
}

export const BoardUsersManager = ({ boardId, adminId, companyId, isAdmin }: Props) => {
  const [boardUsers, setBoardUsers] = useState<BoardUser[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadBoardUsers();
    if (isAdmin) {
      loadAllUsers();
    }
  }, [boardId]);

  const loadBoardUsers = async () => {
    try {
      const users = await boardsAPI.getUsers(boardId);
      setBoardUsers(users);
    } catch (error) {
      console.error("Erro ao carregar usuários do board:", error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users?company_id=${companyId}`);
      const users = await response.json();
      setAllUsers(users);
    } catch (error) {
      console.error("Erro ao carregar todos os usuários:", error);
    }
  };

  const addUser = async (userId: number) => {
    setLoading(true);
    try {
      await boardsAPI.addUser(boardId, userId, adminId);
      alert("Usuário adicionado com sucesso!");
      loadBoardUsers();
      setShowAddModal(false);
    } catch (error: any) {
      console.error("Erro ao adicionar usuário:", error);
      alert(error.message || "Erro ao adicionar usuário");
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId: number) => {
    if (!confirm("Deseja remover este usuário do board?")) return;

    setLoading(true);
    try {
      await boardsAPI.removeUser(boardId, userId, adminId);
      alert("Usuário removido com sucesso!");
      loadBoardUsers();
    } catch (error: any) {
      console.error("Erro ao remover usuário:", error);
      alert(error.message || "Erro ao remover usuário");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários que ainda não estão no board
  const availableUsers = allUsers.filter(
    (user) => !boardUsers.some((bu) => bu.id === user.id)
  );

  return (
    <Container>
      <Header>
        <Title>👥 Usuários com Acesso</Title>
        {isAdmin && (
          <AddButton onClick={() => setShowAddModal(true)} disabled={loading}>
            + Adicionar Usuário
          </AddButton>
        )}
      </Header>

      <UsersList>
        {boardUsers.length === 0 ? (
          <EmptyMessage>Nenhum usuário com acesso a este board</EmptyMessage>
        ) : (
          boardUsers.map((user) => (
            <UserItem key={user.id}>
              <UserInfo>
                <UserEmail>{user.email}</UserEmail>
                <UserRole>{user.role === "admin" ? "👑 Admin" : "👤 Usuário"}</UserRole>
              </UserInfo>
              {isAdmin && (
                <RemoveButton
                  onClick={() => removeUser(user.id)}
                  disabled={loading}
                  title="Remover usuário"
                >
                  ×
                </RemoveButton>
              )}
            </UserItem>
          ))
        )}
      </UsersList>

      {/* Modal para adicionar usuário */}
      {showAddModal && isAdmin && (
        <ModalOverlay onClick={() => setShowAddModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Adicionar Usuário ao Board</h3>
              <CloseButton onClick={() => setShowAddModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {availableUsers.length === 0 ? (
                <EmptyMessage>
                  Todos os usuários da empresa já têm acesso a este board
                </EmptyMessage>
              ) : (
                <UsersList>
                  {availableUsers.map((user) => (
                    <UserItem key={user.id}>
                      <UserInfo>
                        <UserEmail>{user.email}</UserEmail>
                        <UserRole>
                          {user.role === "admin" ? "👑 Admin" : "👤 Usuário"}
                        </UserRole>
                      </UserInfo>
                      <AddUserButton
                        onClick={() => addUser(user.id)}
                        disabled={loading}
                      >
                        Adicionar
                      </AddUserButton>
                    </UserItem>
                  ))}
                </UsersList>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #0f1116;
  border-radius: 12px;
  border: 1px solid #2a2f3f;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.h3`
  margin: 0;
  color: #f2f2f2;
  font-size: 18px;
  font-weight: 700;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background-color: #ff006c;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background-color: #ff4f9a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #ff006c;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserEmail = styled.span`
  color: #f2f2f2;
  font-weight: 600;
  font-size: 14px;
`;

const UserRole = styled.span`
  color: #999;
  font-size: 12px;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  
  &:hover:not(:disabled) {
    background-color: #ff006c;
    color: #fff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddUserButton = styled.button`
  padding: 6px 14px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  
  &:hover:not(:disabled) {
    background-color: #34c759;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #999;
  padding: 20px;
  margin: 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 17, 22, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background-color: #1c2230;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #2a2f3f;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #2a2f3f;
  
  h3 {
    margin: 0;
    color: #ff006c;
    font-size: 18px;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  
  &:hover {
    background-color: #2a2f3f;
    color: #fff;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
`;