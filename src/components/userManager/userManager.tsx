import { useState, useEffect } from "react";
import styled from "styled-components";
import { sessionsAPI } from "../../configs/api"; // ✅ IMPORT ADICIONADO

interface UserTimeData {
  id: number;
  email: string;
  role: "admin" | "user";
  today_seconds: number;
  week_seconds: number;
  is_online: boolean;
}

interface AdminUsersModalProps {
  companyId: number;
  onClose: () => void;
}

export const AdminUsersModal = ({ companyId, onClose }: AdminUsersModalProps) => {
  const [users, setUsers] = useState<UserTimeData[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const loadUsersTime = async () => {
    try {
      setLoading(true);
      const data = await sessionsAPI.getAllUsersTime(companyId);
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar tempo dos usuários:", error);
      alert("Erro ao carregar dados dos usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersTime();
    
    const interval = setInterval(loadUsersTime, 30000);
    return () => clearInterval(interval);
  }, [companyId]);

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Administrar Usuários</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Content>
          {loading ? (
            <LoadingState>Carregando...</LoadingState>
          ) : users.length === 0 ? (
            <EmptyState>Nenhum usuário cadastrado</EmptyState>
          ) : (
            <UsersList>
              {users.map((user) => (
                <UserCard key={user.id}>
                  <UserInfo>
                    <UserHeader>
                      <UserEmail>{user.email}</UserEmail>
                      <StatusIndicator $isOnline={user.is_online}>
                        <StatusDot $isOnline={user.is_online} />
                        {user.is_online ? "Online" : "Offline"}
                      </StatusIndicator>
                    </UserHeader>
                    <UserRole>{user.role === "admin" ? "Administrador" : "Usuário"}</UserRole>
                  </UserInfo>

                  <TimeInfo>
                    <TimeRow>
                      <TimeLabel>Tempo logado hoje:</TimeLabel>
                      <TimeValue>{formatTime(user.today_seconds)}</TimeValue>
                    </TimeRow>
                    <TimeRow>
                      <TimeLabel>Tempo logado na semana:</TimeLabel>
                      <TimeValue>{formatTime(user.week_seconds)}</TimeValue>
                    </TimeRow>
                  </TimeInfo>
                </UserCard>
              ))}
            </UsersList>
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );
};

// ==================== ESTILOS ====================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 17, 22, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background-color: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #2a2f3f;
`;

const Title = styled.h2`
  margin: 0;
  color: #ff006c;
  font-size: 24px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: #2a2f3f;
    color: #fff;
  }
`;

const Content = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #0f1116;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #2a2f3f;
    border-radius: 4px;

    &:hover {
      background: #3a3f4f;
    }
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 16px;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserCard = styled.div`
  background-color: #0f1116;
  border: 1px solid #2a2f3f;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: #ff006c;
    transform: translateX(4px);
  }
`;

const UserInfo = styled.div`
  margin-bottom: 16px;
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const UserEmail = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #f2f2f2;
`;

const StatusIndicator = styled.div<{ $isOnline: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isOnline }) => ($isOnline ? "#4ade80" : "#94a3b8")};
`;

const StatusDot = styled.div<{ $isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $isOnline }) => ($isOnline ? "#4ade80" : "#94a3b8")};
  ${({ $isOnline }) =>
    $isOnline &&
    `
    animation: pulse 2s infinite;
    box-shadow: 0 0 8px #4ade80;
  `}

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const UserRole = styled.div`
  font-size: 13px;
  color: #94a3b8;
`;

const TimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #2a2f3f;
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TimeLabel = styled.div`
  font-size: 14px;
  color: #94a3b8;
`;

const TimeValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ff006c;
  font-family: "Courier New", monospace;
`;