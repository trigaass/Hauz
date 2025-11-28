import styled, { createGlobalStyle } from "styled-components";
import { TopBar } from "../../components/topBar/topBar";
import { useState, useEffect } from "react";
import { Boards } from "../boards";
import { boardsAPI, sessionsAPI } from "../../configs/api"; // ✅ ADICIONAR sessionsAPI
import { useNavigate } from "react-router-dom";
import { FiImage } from "react-icons/fi";
import { ImageGalleryModal } from "../boards/ImageGalleryModal";
import { FloatingChat } from "../../components/chat/floatingChat";
import { AdminUsersModal } from "../../components/userManager/userManager";
import { AttachmentsModal } from "../../components/attachment/attachmentsModal";

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
  isAdmin?: boolean;
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
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [galleryBoardId, setGalleryBoardId] = useState<number | null>(null);
  const [galleryBoardName, setGalleryBoardName] = useState<string>("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      loadBoards(parsedUser.company_id);
    } catch (error) {
      console.error("Erro ao parsear usuário:", error);
      navigate("/login");
    }
  }, [navigate]);

  const loadBoards = async (companyId: number) => {
    setLoading(true);
    try {
      const data = await boardsAPI.getAll(companyId);
      setBoards(data);
    } catch (error) {
      console.error("Erro ao carregar boards:", error);
      alert("Erro ao carregar boards.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewBoard = async () => {
    if (!currentUser) return;
    const name = prompt("Nome do board:");
    if (!name) return;

    const description = prompt("Descrição do board (opcional):");

    try {
      await boardsAPI.create({
        name,
        description: description ?? undefined,
        company_id: currentUser.company_id,
      });

      alert("Board criado com sucesso!");
      loadBoards(currentUser.company_id);
    } catch (error) {
      console.error("Erro ao criar board:", error);
      alert("Erro ao criar board.");
    }
  };

  const removeBoard = async (id: number) => {
    if (!confirm("Deseja realmente excluir este board?")) return;
    try {
      await boardsAPI.delete(id);
      alert("Board excluído com sucesso!");
      if (currentUser) loadBoards(currentUser.company_id);
    } catch (error) {
      console.error("Erro ao remover board:", error);
      alert("Erro ao remover board.");
    }
  };

  const openBoard = (id: number) => setSelectedBoardId(id);
  const closeModal = () => setSelectedBoardId(null);

  const openGallery = (
    boardId: number,
    boardName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setGalleryBoardId(boardId);
    setGalleryBoardName(boardName);
  };

  const closeGallery = () => {
    setGalleryBoardId(null);
    setGalleryBoardName("");
  };

  if (loading) {
    return <LoadingContainer>Carregando...</LoadingContainer>;
  }

  if (!currentUser) {
    return null;
  }

  const isAdmin = currentUser.role === "admin" || currentUser.isAdmin === true;

  return (
    <>
      <GlobalStyle />
      <DashBoardContainer>
        <TopBar
          isAdmin={isAdmin}
          onLogout={() => {
            const sessionId = localStorage.getItem("session_id");
            if (sessionId) {
              sessionsAPI.registerLogout(parseInt(sessionId));
            }
            localStorage.clear();
            navigate("/login");
          }}
          onAddUser={() => navigate("/register-user")}
          onManageUsers={() => setShowAdminModal(true)}
        />

        <WelcomeMessage>
          <TopRow>
            <h2>Bem-vindo, {currentUser.email}!</h2>
            <p>{isAdmin ? "(Admin)" : "(user)"}</p>
          </TopRow>

          {isAdmin && (
            <AddButton onClick={handleNewBoard}>+ Novo Board</AddButton>
          )}
        </WelcomeMessage>

        {/* Lista de Boards */}
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
                <BoardNameRow>
                  <span className="board-name">{board.name}</span>
                </BoardNameRow>
                {board.description && (
                  <span className="board-desc">{board.description}</span>
                )}
                {board.creator_email && (
                  <span className="board-creator">
                    Criado por: {board.creator_email}
                  </span>
                )}
              </BoardInfo>

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

        {/* Modal de Board */}
        {selectedBoardId !== null && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>{boards.find((b) => b.id === selectedBoardId)?.name}</h2>
                <HeaderActions>
                  <GalleryButtonHeader
                    onClick={(e) => {
                      const b = boards.find((b) => b.id === selectedBoardId);
                      if (b) openGallery(b.id, b.name, e);
                    }}
                    title="Ver galeria de imagens"
                  >
                    <FiImage />
                    <span>Visualizar Galeria</span>
                  </GalleryButtonHeader>
                  <CloseButton onClick={closeModal}>×</CloseButton>
                </HeaderActions>
              </ModalHeader>
              <ModalBody>
                <Boards
                  boardId={selectedBoardId}
                  userId={currentUser.id}
                  isAdmin={isAdmin}
                />
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}

        {galleryBoardId !== null && (
          <ImageGalleryModal
            boardId={galleryBoardId}
            boardName={galleryBoardName}
            onClose={closeGallery}
          />
        )}

        {currentUser && (
          <FloatingChat
            currentUser={{
              ...currentUser,
              isAdmin: currentUser.isAdmin || currentUser.role === "admin",
            }}
          />
        )}

        {showAdminModal && currentUser && (
          <AdminUsersModal
            companyId={currentUser.company_id}
            onClose={() => setShowAdminModal(false)}
          />
        )}

        {currentUser && showAttachmentsModal && (
  <AttachmentsModal
    companyId={currentUser.company_id}
    userId={currentUser.id}
    isAdmin={isAdmin}
    onClose={() => setShowAttachmentsModal(false)}
  />
)}
      </DashBoardContainer>
    </>
  );
};

// ==================== ESTILOS ====================

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

const TopRow = styled.div``;

const WelcomeMessage = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;

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

  button {
    margin-bottom: 15px;
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
  flex: 1;

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

const BoardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
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
  width: 95vw;
  height: 95vh;
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const GalleryButtonHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: rgba(255, 0, 108, 0.1);
  border: 1px solid #ff006c;
  color: #ff006c;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background-color: #ff006c;
    color: white;
    transform: translateY(-1px);
  }

  svg {
    font-size: 18px;
  }

  span {
    white-space: nowrap;
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: #2a2f3f;
    color: #fff;
  }
`;

const ModalBody = styled.div`
  padding: 20px 25px;
  color: #f2f2f2;
`;
