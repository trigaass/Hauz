import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiUsers, FiEdit, FiTrash2, FiExternalLink } from "react-icons/fi";

interface User {
  id: number;
  email: string;
}

interface BoardCardProps {
  board: {
    id: number;
    name: string;
    description: string;
    company_name: string;
    creator_email: string;
    users: User[];
  };
  currentUser: {
    id: number;
    role: string;
    company_id: number;
  };
  onManageUsers: (boardId: number) => void;
  onDelete: (boardId: number) => void;
}

export const BoardCard = ({ board, currentUser, onManageUsers, onDelete }: BoardCardProps) => {
  const [showUsers, setShowUsers] = useState(false);
  const navigate = useNavigate();
  const isAdmin = currentUser.role === 'admin';

  const handleCardClick = (e: React.MouseEvent) => {
    // Não navegar se clicar em botões ou na seção de usuários
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-users-section]')) {
      return;
    }
    
    // Navegar para a página do board com o ID e nome
    navigate(`/boards/${board.id}`, { 
      state: { 
        boardName: board.name,
        boardId: board.id 
      } 
    });
  };

  return (
    <Card onClick={handleCardClick}>
      <CardHeader>
        <BoardNameWrapper>
          <BoardName>{board.name}</BoardName>
          <OpenIcon title="Abrir board">
            <FiExternalLink />
          </OpenIcon>
        </BoardNameWrapper>
        {isAdmin && (
          <Actions>
            <ActionButton 
              onClick={(e) => {
                e.stopPropagation();
                onManageUsers(board.id);
              }} 
              title="Gerenciar usuários"
            >
              <FiEdit />
            </ActionButton>
            <ActionButton 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(board.id);
              }} 
              title="Excluir board"
            >
              <FiTrash2 />
            </ActionButton>
          </Actions>
        )}
      </CardHeader>
      
      {board.description && <Description>{board.description}</Description>}
      
      <InfoRow>
        <Label>Empresa:</Label>
        <Value>{board.company_name}</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>Criado por:</Label>
        <Value>{board.creator_email}</Value>
      </InfoRow>
      
      <UsersSection data-users-section>
        <UsersHeader onClick={() => setShowUsers(!showUsers)}>
          <FiUsers />
          <span>{board.users?.length || 0} usuário(s) com acesso</span>
        </UsersHeader>
        
        {showUsers && board.users && board.users.length > 0 && (
          <UsersList>
            {board.users.map((user) => (
              <UserItem key={user.id}>{user.email}</UserItem>
            ))}
          </UsersList>
        )}
      </UsersSection>
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BoardNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const BoardName = styled.h3`
  margin: 0;
  font-size: 20px;
  color: #333;
`;

const OpenIcon = styled.span`
  color: #007bff;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;

  ${Card}:hover & {
    opacity: 1;
  }

  svg {
    font-size: 16px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }

  svg {
    font-size: 18px;
  }
`;

const Description = styled.p`
  color: #666;
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Label = styled.span`
  font-weight: 600;
  color: #555;
`;

const Value = styled.span`
  color: #666;
`;

const UsersSection = styled.div`
  margin-top: 16px;
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
`;

const UsersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #0066cc;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: #0052a3;
  }

  svg {
    font-size: 16px;
  }
`;

const UsersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
`;

const UserItem = styled.li`
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555;
`;