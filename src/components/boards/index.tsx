import { useState } from "react";
import styled from "styled-components";
import { Title } from "./title";
import { Tasks } from "./tasks";

const TasksContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px;
`;

const Card = styled.div`
  background-color: #fff;
  width: 250px;
  min-height: 40px;
  border: 1px solid #ccc;
  padding: 10px;
  margin-right: 10px;
  border-radius: 6px;
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;

  button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
`;

export const Cards = () => {
    const [cards, setCards] = useState<{ id: number }[]>([]);

    const handleNewCard = () => {
        const newCard = { id: cards.length + 1 };
        setCards([...cards, newCard]);
    }

    const removeCard = (id: number) => {
        setCards(cards.filter(card => card.id !== id));
    }

    return (
        <TasksContainer>
            {cards.map((card) => (
                <Card key={card.id}>
                    <CardHeader>
                        <Title />
                        <button onClick={() => removeCard(card.id)}>x</button>
                    </CardHeader>
                    <Tasks />
                </Card>
            ))}
            <button onClick={handleNewCard}>
                + Add new card
            </button>
        </TasksContainer>
    )
};