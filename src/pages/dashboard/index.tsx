import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { boardsAPI } from "../../configs/api";
import { CreateBoardModal } from "../../components/boards/CreateBoardModal";
import { ManageUsersModal } from "../../components/boards/ManageUsersModal";
import { BoardCard } from "../../components/boards/boardcard";

interface Board {
  id: number;
  name: string;
  description?: string;
  company_name: string;
  creator_email: string;
  users: { id: number; email: string }[];
}

interface User {
  id: number;
  email: string;
  role: string;
  company_id: number;
}

export const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageUsersModal, setShowManageUsersModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário está logado
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      loadBoards(user.company_id);
    } catch (error) {
      console.error("Erro ao parsear usuário:", error);
      navigate("/login");
    }
  }, [navigate]);

  const loadBoards = async (companyId: number) => {
    try {
      setLoading(true);
      // ✅ CORRIGIDO: getAll agora recebe apenas company_id
      const data = await boardsAPI.getAll(companyId);
      setBoards(data);
    } catch (error) {
      console.error("Erro ao carregar boards:", error);
      alert("Erro ao carregar boards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (name: string, _description: string) => {
    if (!currentUser) return;

    try {
      await boardsAPI.create({
        name,
        company_id: currentUser.company_id,
      });
      
      alert("Board criado com sucesso!");
      setShowCreateModal(false);
      loadBoards(currentUser.company_id);
    } catch (error) {
      console.error("Erro ao criar board:", error);
      alert("Erro ao criar board");
    }
  };

  const handleDeleteBoard = async (boardId: number) => {
    if (!confirm("Tem certeza que deseja deletar este board?")) return;
    if (!currentUser) return;

    try {
      // ✅ CORRIGIDO: delete agora recebe apenas o ID
      await boardsAPI.delete(boardId);
      alert("Board deletado com sucesso!");
      loadBoards(currentUser.company_id);
    } catch (error) {
      console.error("Erro ao deletar board:", error);
      alert("Erro ao deletar board");
    }
  };

  const handleManageUsers = (boardId: number) => {
    setSelectedBoardId(boardId);
    setShowManageUsersModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <Container>
        <LoadingText>Carregando boards...</LoadingText>
      </Container>
    );
  }

  if (!currentUser) {
    return null;
  }

  const isAdmin = currentUser.role === "admin";

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>📋 Meus Boards</Title>
          <UserInfo>
            {currentUser.email} 
            {isAdmin && <AdminBadge>👑 Admin</AdminBadge>}
          </UserInfo>
        </HeaderLeft>
        <HeaderRight>
          {isAdmin && (
            <CreateButton onClick={() => setShowCreateModal(true)}>
              + Novo Board
            </CreateButton>
          )}
          <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
        </HeaderRight>
      </Header>

      <BoardsGrid>
        {boards.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyText>Nenhum board encontrado</EmptyText>
            {isAdmin && (
              <EmptyHint>Clique em "Novo Board" para começar</EmptyHint>
            )}
          </EmptyState>
        ) : (
          boards.map((board) => (
            <BoardCard
              key={board.id}
              board={{ ...board, description: board.description ?? "" }}
              currentUser={currentUser}
              onManageUsers={handleManageUsers}
              onDelete={handleDeleteBoard}
            />
          ))
        )}
      </BoardsGrid>

      {/* Modais */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}

      {showManageUsersModal && selectedBoardId && (
        <ManageUsersModal
          boardId={selectedBoardId}
          companyId={currentUser.company_id}
          onClose={() => {
            setShowManageUsersModal(false);
            setSelectedBoardId(null);
            loadBoards(currentUser.company_id);
          }}
        />
      )}
    </Container>
  );
};

// ==================== ESTILOS ====================

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const LoadingText = styled.div`
  text-align: center;
  color: white;
  font-size: 18px;
  padding: 40px;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 32px;
  font-weight: 700;
`;

const UserInfo = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AdminBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const BoardsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptyHint = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0;
`;