import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Title } from "./title";
import { Tasks } from "./tasks";
import { cardsAPI } from "../../configs/api";
import { ConfirmModal } from "./ConfirmModal";

interface Card {
  id: number;
  board_id: number;
  title: string;
  position: number;
}

interface CardsProps {
  boardId: number;
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
  * {
    font-family: "Nunito", sans-serif;
    transition: all 0.2s ease-in-out;
  }
`;

export const Cards = ({ boardId }: CardsProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    loadCards();
  }, [boardId]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await cardsAPI.getAll(boardId);
      setCards(data);
    } catch (error) {
      console.error("Erro ao carregar cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCard = async () => {
    try {
      const result = await cardsAPI.create({
        board_id: boardId,
        title: "Novo Card",
        position: cards.length,
      });

      if (result.cardId) {
        loadCards();
      }
    } catch (error) {
      console.error("Erro ao criar card:", error);
    }
  };

  const removeCard = (id: number) => {
    setConfirmAction({
      title: "Excluir Card",
      message: "Tem certeza que deseja excluir este card? Todas as tasks serão removidas.",
      onConfirm: async () => {
        try {
          await cardsAPI.delete(id);
          setCards(cards.filter((card) => card.id !== id));
          setShowConfirm(false);
        } catch (error) {
          console.error("Erro ao remover card:", error);
          alert("Erro ao remover card");
        }
      }
    });
    setShowConfirm(true);
  };

  const updateCardTitle = async (id: number, title: string) => {
    try {
      await cardsAPI.update(id, { title });
      setCards(cards.map((card) => (card.id === id ? { ...card, title } : card)));
    } catch (error) {
      console.error("Erro ao atualizar título:", error);
    }
  };

  if (loading) return <LoadingText>Carregando cards...</LoadingText>;

  return (
    <>
      <GlobalStyle />
      <TasksContainer>
        {cards.map((card) => (
          <Card key={card.id}>
            <CardHeader>
              <Title
                initialTitle={card.title}
                onSave={(newTitle) => updateCardTitle(card.id, newTitle)}
              />
              <DeleteButton onClick={() => removeCard(card.id)}>×</DeleteButton>
            </CardHeader>
            <Tasks cardId={card.id} />
          </Card>
        ))}

        <AddCardButton onClick={handleNewCard}>+ Novo Card</AddCardButton>
      </TasksContainer>

      {showConfirm && confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

const LoadingText = styled.div`
  padding: 20px;
  text-align: center;
  color: #f2f2f2;
`;

const TasksContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 20px;
  margin: 10px 0;
  overflow-x: auto;
  gap: 20px;
  background-color: #0f1116;
`;

const Card = styled.div`
  background-color: #1c2230;
  min-width: 280px;
  min-height: 100px;
  border: 1px solid #2a2f3f;
  padding: 20px;
  border-radius: 12px;
  flex-shrink: 0;
  color: #f2f2f2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff006c;
    transform: translateY(-3px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
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
  transition: 0.2s ease;

  &:hover {
    background-color: #ff006c;
    color: #fff;
  }
`;

const AddCardButton = styled.button`
  min-width: 280px;
  height: 120px;
  background-color: rgba(255, 0, 108, 0.1);
  border: 2px dashed #ff006c;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  color: #ff006c;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 0, 108, 0.2);
    border-color: #ff4f9a;
    color: #ff4f9a;
  }
`;