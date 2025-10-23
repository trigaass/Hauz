import styled from "styled-components";
import { Cards } from "../../components/boards";
import { BoardUsersManager } from "./BoardUsersManager";

const BoardsContainer = styled.div`
  padding: 0 25px;
`;

const ContentWrapper = styled.div`
  color: #999;
  text-align: center;
`;

interface BoardsProps {
  boardId: number;
  userId?: number;
  isAdmin: boolean;
}

export const Boards = ({ boardId, isAdmin }: BoardsProps) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <BoardsContainer>
      <ContentWrapper>
        <Cards boardId={boardId} />
      </ContentWrapper>
      {user && (
        <BoardUsersManager
          boardId={boardId}
          adminId={user.id}
          companyId={user.company_id}
          isAdmin={isAdmin}
        />
      )}
    </BoardsContainer>
  );
};