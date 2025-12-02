import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiMessageCircle, FiX, FiMinus, FiSend } from "react-icons/fi";
import { chatAPI } from "../../configs/api";
import { io, Socket } from "socket.io-client";

interface User {
  id: number;
  email: string;
  role: string;
  has_conversation?: boolean;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_email: string;
  sender_role: string;
  created_at: string;
  read: boolean;
}

interface OpenChat {
  conversationId: number;
  user: User;
  messages: Message[];
  isMinimized: boolean;
  unreadCount: number;
  isTyping: boolean;
}

interface FloatingChatProps {
  currentUser: {
    id: number;
    email: string;
    role: string;
    company_id: number;
    isAdmin: boolean;
  };
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://hauzserver.onrender.com";

export const FloatingChat = ({ currentUser }: FloatingChatProps) => {
  const [showUserList, setShowUserList] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // 🆕 Conectar ao Socket.IO
  useEffect(() => {
    socketRef.current = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Conectado ao WebSocket");
      socket.emit("user:online", currentUser.id);
    });

    // Receber mensagens em tempo real
    socket.on("message:received", ({ conversationId, message }) => {
      setOpenChats((prev) =>
        prev.map((chat) =>
          chat.conversationId === conversationId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                unreadCount: chat.isMinimized ? chat.unreadCount + 1 : 0,
              }
            : chat
        )
      );

      // Tocar som de notificação
      playNotificationSound();
    });

    // Indicador de digitação
    socket.on("typing:indicator", ({ conversationId, isTyping }) => {
      setOpenChats((prev) =>
        prev.map((chat) =>
          chat.conversationId === conversationId ? { ...chat, isTyping } : chat
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (showUserList) {
      loadAvailableUsers();
    }
  }, [showUserList]);

  // Calcular total de mensagens não lidas
  useEffect(() => {
    const total = openChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setTotalUnread(total);
  }, [openChats]);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3"); // Adicione um arquivo de som
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignorar erro se não tiver permissão
  };

  const loadAvailableUsers = async () => {
    setLoading(true);
    try {
      const users = await chatAPI.getAvailableUsers(
        currentUser.id,
        currentUser.company_id
      );

      // Filtrar: se for user, só mostrar admins; se for admin, mostrar todos
      const filteredUsers = currentUser.isAdmin
        ? users
        : users.filter((u: User) => u.role === "admin");

      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (user: User) => {
    try {
      const existingChat = openChats.find((chat) => chat.user.id === user.id);
      if (existingChat) {
        setOpenChats((prev) =>
          prev.map((chat) =>
            chat.user.id === user.id ? { ...chat, isMinimized: false } : chat
          )
        );
        setShowUserList(false);
        return;
      }

      const conversation = await chatAPI.getOrCreateConversation(
        currentUser.id,
        user.id
      );

      const messages = await chatAPI.getMessages(
        conversation.id,
        currentUser.id
      );

      const newChat: OpenChat = {
        conversationId: conversation.id,
        user,
        messages,
        isMinimized: false,
        unreadCount: 0,
        isTyping: false,
      };

      setOpenChats((prev) => [...prev, newChat]);
      setShowUserList(false);
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      alert("Erro ao iniciar conversa");
    }
  };

  const sendMessage = async (chatIndex: number, content: string) => {
    if (!content.trim()) return;

    const chat = openChats[chatIndex];
    try {
      await chatAPI.sendMessage(chat.conversationId, currentUser.id, content);

      // Emitir via WebSocket para o destinatário
      socketRef.current?.emit("message:send", {
        conversationId: chat.conversationId,
        receiverId: chat.user.id,
        message: {
          id: Date.now(),
          content,
          sender_id: currentUser.id,
          sender_email: currentUser.email,
          created_at: new Date().toISOString(),
          read: false,
        },
      });

      // Atualizar mensagens localmente
      await refreshMessages(chat.conversationId);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem");
    }
  };

  const refreshMessages = async (conversationId: number) => {
    try {
      const messages = await chatAPI.getMessages(
        conversationId,
        currentUser.id
      );

      setOpenChats((prev) =>
        prev.map((chat) =>
          chat.conversationId === conversationId ? { ...chat, messages } : chat
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar mensagens:", error);
    }
  };

  const closeChat = (chatIndex: number) => {
    setOpenChats((prev) => prev.filter((_, i) => i !== chatIndex));
  };

  const toggleMinimize = (chatIndex: number) => {
    setOpenChats((prev) =>
      prev.map((chat, i) =>
        i === chatIndex
          ? { ...chat, isMinimized: !chat.isMinimized, unreadCount: 0 }
          : chat
      )
    );
  };

  const markAsRead = async (conversationId: number) => {
    try {
      await chatAPI.markAsRead(conversationId, currentUser.id);
      setOpenChats((prev) =>
        prev.map((chat) =>
          chat.conversationId === conversationId
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  const handleTyping = (chatIndex: number, isTyping: boolean) => {
    const chat = openChats[chatIndex];
    socketRef.current?.emit(isTyping ? "typing:start" : "typing:stop", {
      conversationId: chat.conversationId,
      receiverId: chat.user.id,
    });
  };

  return (
    <>
      <FloatingButton
        onClick={() => setShowUserList(!showUserList)}
        $isActive={showUserList}
      >
        {showUserList ? <FiX /> : <FiMessageCircle />}
        {totalUnread > 0 && <UnreadBadge>{totalUnread}</UnreadBadge>}
      </FloatingButton>

      {showUserList && (
        <UserListModal>
          <ModalHeader>
            <h3>💬 Iniciar Conversa</h3>
            <CloseButton onClick={() => setShowUserList(false)}>
              <FiX />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <LoadingText>Carregando...</LoadingText>
            ) : availableUsers.length === 0 ? (
              <EmptyText>Nenhum usuário disponível</EmptyText>
            ) : (
              <UserList>
                {availableUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    onClick={() => startConversation(user)}
                  >
                    <UserAvatar>
                      {user.email.charAt(0).toUpperCase()}
                    </UserAvatar>
                    <UserInfo>
                      <UserName>{user.email}</UserName>
                      <UserRole>
                        {user.role === "admin" ? "👑 Admin" : "👤 Usuário"}
                      </UserRole>
                    </UserInfo>
                  </UserItem>
                ))}
              </UserList>
            )}
          </ModalBody>
        </UserListModal>
      )}

      <ChatWindowsContainer>
        {openChats.map((chat, index) => (
          <ChatWindow
            key={chat.conversationId}
            chat={chat}
            index={index}
            currentUserId={currentUser.id}
            onClose={() => closeChat(index)}
            onMinimize={() => toggleMinimize(index)}
            onSendMessage={(content) => sendMessage(index, content)}
            onMarkAsRead={() => markAsRead(chat.conversationId)}
            onTyping={(isTyping) => handleTyping(index, isTyping)}
          />
        ))}
      </ChatWindowsContainer>
    </>
  );
};

// ==================== COMPONENTE DE JANELA DE CHAT ====================

interface ChatWindowProps {
  chat: OpenChat;
  index: number;
  currentUserId: number;
  onClose: () => void;
  onMinimize: () => void;
  onSendMessage: (content: string) => void;
  onMarkAsRead: () => void;
  onTyping: (isTyping: boolean) => void;
}

const ChatWindow = ({
  chat,
  index,
  currentUserId,
  onClose,
  onMinimize,
  onSendMessage,
  onMarkAsRead,
  onTyping,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    scrollToBottom();
    if (!chat.isMinimized) {
      onMarkAsRead();
    }
  }, [chat.messages, chat.isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);

    // Notificar que está digitando
    onTyping(true);

    // Parar de notificar após 2 segundos sem digitar
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
      onTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatBox $index={index} $isMinimized={chat.isMinimized}>
      <ChatHeader>
        <ChatHeaderInfo>
          <ChatAvatar>{chat.user.email.charAt(0).toUpperCase()}</ChatAvatar>
          <ChatHeaderText>
            <ChatUserName>{chat.user.email}</ChatUserName>
            <ChatUserStatus>
              {chat.user.role === "admin" ? "Admin" : "Usuário"}
            </ChatUserStatus>
          </ChatHeaderText>
        </ChatHeaderInfo>
        <ChatHeaderActions>
          {chat.unreadCount > 0 && !chat.isMinimized && (
            <UnreadBadgeSmall>{chat.unreadCount}</UnreadBadgeSmall>
          )}
          <HeaderButton onClick={onMinimize} title="Minimizar">
            <FiMinus />
          </HeaderButton>
          <HeaderButton onClick={onClose} title="Fechar">
            <FiX />
          </HeaderButton>
        </ChatHeaderActions>
      </ChatHeader>

      {!chat.isMinimized && (
        <>
          <ChatBody>
            {chat.messages.length === 0 ? (
              <EmptyChat>
                <p>👋 Comece a conversa!</p>
                <span>Envie a primeira mensagem</span>
              </EmptyChat>
            ) : (
              chat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  $isOwn={message.sender_id === currentUserId}
                >
                  <MessageContent $isOwn={message.sender_id === currentUserId}>
                    {message.content}
                  </MessageContent>
                  <MessageTime>
                    {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </MessageTime>
                </MessageBubble>
              ))
            )}
            {chat.isTyping && (
              <TypingIndicator>
                <TypingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingDots>
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </ChatBody>

          <ChatFooter>
            <MessageInput
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
            />
            <SendButton onClick={handleSend} disabled={!inputValue.trim()}>
              <FiSend />
            </SendButton>
          </ChatFooter>
        </>
      )}
    </ChatBox>
  );
};

// ==================== ESTILOS ====================

const FloatingButton = styled.button<{ $isActive: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props) => (props.$isActive ? "#ff4f9a" : "#ff006c")};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(255, 0, 108, 0.4);
  transition: all 0.3s;
  z-index: 1000;

  &:hover {
    background: #ff4f9a;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 0, 108, 0.6);
  }
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff0000;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid #0f1116;
`;

const UnreadBadgeSmall = styled.span`
  background: #ff0000;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 700;
`;

const UserListModal = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 320px;
  max-height: 450px;
  background: #1c2230;
  border-radius: 12px;
  border: 1px solid #2a2f3f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 999;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid #2a2f3f;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #ff006c;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #2a2f3f;
    color: #fff;
  }
`;

const ModalBody = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0f1116;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #2a2f3f;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff006c, #ff4f9a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const UserName = styled.span`
  color: #f2f2f2;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  color: #999;
  font-size: 12px;
`;

const ChatWindowsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 100px;
  display: flex;
  gap: 10px;
  z-index: 998;
`;

const ChatBox = styled.div<{ $index: number; $isMinimized: boolean }>`
  width: 320px;
  height: ${(props) => (props.$isMinimized ? "auto" : "450px")};
  background: #1c2230;
  border-radius: 12px;
  border: 1px solid #2a2f3f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #0f1116;
  border-bottom: 1px solid #2a2f3f;
`;

const ChatHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const ChatAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff006c, #ff4f9a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
`;

const ChatHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const ChatUserName = styled.span`
  color: #f2f2f2;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatUserStatus = styled.span`
  color: #999;
  font-size: 11px;
`;

const ChatHeaderActions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #2a2f3f;
    color: #fff;
  }
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #0f1116;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #2a2f3f;
    border-radius: 3px;
  }
`;

const EmptyChat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: #999;
  text-align: center;

  p {
    margin: 0;
    font-size: 16px;
  }

  span {
    font-size: 13px;
  }
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isOwn ? "flex-end" : "flex-start")};
  max-width: 75%;
  align-self: ${(props) => (props.$isOwn ? "flex-end" : "flex-start")};
`;

const MessageContent = styled.div<{ $isOwn: boolean }>`
  background: ${(props) => (props.$isOwn ? "#ff006c" : "#1c2230")};
  color: #f2f2f2;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  border: 1px solid ${(props) => (props.$isOwn ? "#ff006c" : "#2a2f3f")};
`;

const MessageTime = styled.span`
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  padding: 0 8px;
`;

const TypingIndicator = styled.div`
  align-self: flex-start;
  background: #1c2230;
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid #2a2f3f;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #999;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typing {
    0%,
    60%,
    100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
`;

const ChatFooter = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #0f1116;
  border-top: 1px solid #2a2f3f;
`;

const MessageInput = styled.input`
  flex: 1;
  background: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 20px;
  padding: 10px 16px;
  color: #f2f2f2;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #ff006c;
  }

  &::placeholder {
    color: #666;
  }
`;

const SendButton = styled.button`
  background: #ff006c;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #ff4f9a;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
