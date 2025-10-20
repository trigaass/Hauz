import styled, { createGlobalStyle } from "styled-components";
import { TopBar } from "../../components/topBar/topBar";
import { useState, useEffect } from "react";
import { Boards } from "../boards";
import { boardsAPI } from "../../configs/api";

interface Board {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  created_by: number;
  company_name?: string;
  creator_email?: string;
}

interface User {
  id: number;
  email: string;
  role: "admin" | "user";
  isAdmin: boolean;
  company_id: number;
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
  * {
    font-family: "Nunito", sans-serif;
    transition: all 0.2s ease-in-out;
  }
  body {
    background-color: #0f1116;
    color: #f2f2f2;
  }
`;

export const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      // Redirecionar para login se não houver usuário
      window.location.href = "/login";
    }
  }, []);

  // Carregar boards quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  const loadBoards = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await boardsAPI.getAll(user.id, user.role);
      console.log(`📋 ${data.length} boards carregados para ${user.role}`);
      setBoards(data);
    } catch (error) {
      console.error("Erro ao carregar boards:", error);
      alert("Erro ao carregar boards. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewBoard = async () => {
    if (!user) return;

    const name = prompt("Nome do board:");
    if (!name) return;

    const description = prompt("Descrição do board (opcional):");

    const boardData = {
      name,
      description: description || undefined,
      company_id: user.company_id,
      created_by: user.id,
    };

    try {
      const result = await boardsAPI.create(boardData);
      if (result.boardId) {
        alert("Board criado com sucesso!");
        loadBoards();
      } else {
        alert("Erro: Resposta do servidor não contém boardId");
      }
    } catch (error) {
      console.error("Erro ao criar board:", error);
      alert("Erro ao criar board. Verifique o console.");
    }
  };

  const removeBoard = async (id: number) => {
    if (!user) return;
    if (!confirm("Deseja realmente excluir este board?")) return;

    try {
      await boardsAPI.delete(id, user.id, user.role);
      setBoards(boards.filter((board) => board.id !== id));
      alert("Board excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao remover board:", error);
      alert("Erro ao remover board. Verifique o console.");
    }
  };

  const openBoard = (id: number) => setSelectedBoardId(id);
  const closeModal = () => setSelectedBoardId(null);

  if (loading || !user) {
    return <LoadingContainer>Carregando...</LoadingContainer>;
  }

  const isAdmin = user.role === "admin" || user.isAdmin;

  return (
    <>
      <GlobalStyle />
      <DashBoardContainer>
        <TopBar />
        
        {/* Mensagem de boas-vindas */}
        <WelcomeMessage>
          <h2>Bem-vindo, {user.email}!</h2>
          <p>
            {isAdmin 
              ? "Você é administrador - pode criar e gerenciar todos os boards da sua empresa"
              : "Você pode visualizar os boards aos quais foi atribuído"}
          </p>
        </WelcomeMessage>

        <BoardContainer>
          {boards.length === 0 && (
            <EmptyState>
              <p>Nenhum board {isAdmin ? "criado" : "atribuído"} ainda.</p>
              {isAdmin && <p>Clique em "+ Novo Board" para começar!</p>}
            </EmptyState>
          )}

          {boards.map((board) => (
            <BoardLink key={board.id} onClick={() => openBoard(board.id)}>
              <BoardInfo>
                <span className="board-name">{board.name}</span>
                {board.description && (
                  <span className="board-desc">{board.description}</span>
                )}
                {board.creator_email && (
                  <span className="board-creator">
                    Criado por: {board.creator_email}
                  </span>
                )}
              </BoardInfo>
              
              {/* Apenas admins podem deletar boards */}
              {isAdmin && (
                <DeleteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBoard(board.id);
                  }}
                  title="Excluir board"
                >
                  ×
                </DeleteButton>
              )}
            </BoardLink>
          ))}
        </BoardContainer>

        {isAdmin && (
          <AddButton onClick={handleNewBoard}>+ Novo Board</AddButton>
        )}

        {selectedBoardId !== null && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>{boards.find((b) => b.id === selectedBoardId)?.name}</h2>
                <CloseButton onClick={closeModal}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                <Boards 
                  boardId={selectedBoardId} 
                  userId={user.id}
                  isAdmin={isAdmin}
                />
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </DashBoardContainer>
    </>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #f2f2f2;
`;

const DashBoardContainer = styled.div`
  padding: 20px;
  background-color: #0f1116;
  min-height: 100vh;
`;

const WelcomeMessage = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 12px;
  
  h2 {
    margin: 0 0 10px 0;
    color: #ff006c;
    font-size: 22px;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    color: #ccc;
    font-size: 14px;
  }
`;

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 16px;
  p {
    margin: 8px 0;
  }
`;

const BoardLink = styled.div`
  background-color: #1c2230;
  border: 1px solid #2a2f3f;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s;
  &:hover {
    border-color: #ff006c;
    transform: translateY(-4px);
  }
`;

const BoardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  .board-name {
    font-weight: 700;
    font-size: 18px;
    color: #ff006c;
  }
  .board-desc {
    font-size: 13px;
    color: #ccc;
  }
  .board-creator {
    font-size: 11px;
    color: #888;
    margin-top: 5px;
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #888;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  &:hover {
    background-color: #ff006c;
    color: #fff;
  }
`;

const AddButton = styled.button`
  margin-top: 25px;
  padding: 14px 28px;
  background-color: #ff006c;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  &:hover {
    background-color: #ff4f9a;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 17, 22, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1c2230;
  border-radius: 16px;
  width: 85vw; /* ocupa 85% da largura da viewport */
  height: 85vh; /* opcional — ocupa 85% da altura também */
  overflow: auto;
  border: 1px solid #2a2f3f;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 30px;
  border-bottom: 1px solid #2a2f3f;
  h2 {
    margin: 0;
    color: #ff006c;
    font-size: 24px;
    font-weight: 800;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #999;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  &:hover {
    background-color: #2a2f3f;
    color: #fff;
  }
`;

const ModalBody = styled.div`
  padding: 20px 25px;
  color: #f2f2f2;
`;