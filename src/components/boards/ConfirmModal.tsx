import { useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal = ({ title, message, onConfirm, onCancel }: ConfirmModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Se o documento ainda não está disponível (ex: SSR)
  if (typeof document === "undefined") return null;

  const handleConfirm = async () => {
    if (isConfirming) return; // evita múltiplos cliques
    setIsConfirming(true);

    try {
      await onConfirm();
    } finally {
      setIsConfirming(false); // caso queira reabilitar depois
    }
  };

  return ReactDOM.createPortal(
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <IconContainer>
          <FiAlertTriangle size={48} color="#ff9800" />
        </IconContainer>

        <Title>{title}</Title>
        <Message>{message}</Message>

        <ButtonGroup>
          <CancelButton onClick={onCancel} disabled={isConfirming}>
            Cancelar
          </CancelButton>
          <ConfirmButton
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Confirmando..." : "Confirmar"}
          </ConfirmButton>
        </ButtonGroup>
      </Modal>
    </Overlay>,
    document.body
  );
};

// ------------------- STYLES -------------------

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #333;
  font-weight: 600;
`;

const Message = styled.p`
  margin: 0 0 28px 0;
  color: #666;
  font-size: 15px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const CancelButton = styled.button<{ disabled?: boolean }>`
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  min-width: 120px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    background: ${({ disabled }) => (disabled ? "#f5f5f5" : "#e0e0e0")};
  }
`;

const ConfirmButton = styled.button<{ disabled?: boolean }>`
  padding: 12px 24px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  min-width: 120px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    background: ${({ disabled }) => (disabled ? "#dc3545" : "#c82333")};
  }
`;
