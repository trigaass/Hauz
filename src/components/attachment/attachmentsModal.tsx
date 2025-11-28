import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { attachmentsAPI } from "../../configs/api";
import {
  FiFile,
  FiImage,
  FiFileText,
  FiDownload,
  FiTrash2,
  FiX,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiUsers,
} from "react-icons/fi";

interface Attachment {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_email: string;
  is_viewed: boolean;
  viewed_at: string | null;
}

interface AttachmentsModalProps {
  companyId: number;
  userId: number;
  isAdmin: boolean;
  onClose: () => void;
}

export const AttachmentsModal = ({
  companyId,
  userId,
  isAdmin,
  onClose,
}: AttachmentsModalProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [notViewedUsers, setNotViewedUsers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [companyId, userId]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const data = await attachmentsAPI.getAll(companyId, userId);
      setAttachments(data);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      alert("Erro ao carregar anexos.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Apenas arquivos PDF, JPEG e PNG são permitidos");
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("O arquivo deve ter no máximo 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      alert("Selecione um arquivo e preencha o título");
      return;
    }

    setUploading(true);
    try {
      await attachmentsAPI.create({
        file: selectedFile,
        company_id: companyId,
        uploaded_by: userId,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      alert("Anexo enviado com sucesso!");
      setShowUploadForm(false);
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      loadAttachments();
    } catch (error: any) {
      console.error("Erro ao enviar anexo:", error);
      alert(error.message || "Erro ao enviar anexo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente deletar este anexo?")) return;

    try {
      await attachmentsAPI.delete(id, userId);
      alert("Anexo deletado com sucesso!");
      loadAttachments();
    } catch (error: any) {
      console.error("Erro ao deletar anexo:", error);
      alert(error.message || "Erro ao deletar anexo");
    }
  };

  const handleView = async (attachment: Attachment) => {
    // Abrir arquivo em nova aba
    const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hauzserver.onrender.com";
    window.open(`${API_BASE_URL}${attachment.file_url}`, "_blank");

    // Marcar como visto se ainda não foi
    if (!attachment.is_viewed) {
      try {
        await attachmentsAPI.markAsViewed(attachment.id, userId);
        loadAttachments(); // Recarregar para atualizar o status
      } catch (error) {
        console.error("Erro ao marcar como visto:", error);
      }
    }
  };

  const handleViewStats = async (attachment: Attachment) => {
    try {
      const [statsData, notViewedData] = await Promise.all([
        attachmentsAPI.getStats(attachment.id, userId),
        attachmentsAPI.getNotViewed(attachment.id, userId),
      ]);
      setStats(statsData);
      setNotViewedUsers(notViewedData);
      setSelectedAttachment(attachment);
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);
      alert(error.message || "Erro ao buscar estatísticas");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FiImage />;
    if (fileType === "application/pdf") return <FiFileText />;
    return <FiFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <h2>📎 Anexos da Empresa</h2>
            <AttachmentCount>{attachments.length} arquivo(s)</AttachmentCount>
          </HeaderLeft>
          <HeaderRight>
            {isAdmin && (
              <UploadButton onClick={() => setShowUploadForm(!showUploadForm)}>
                <FiUpload />
                Enviar Anexo
              </UploadButton>
            )}
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </HeaderRight>
        </Header>

        {/* Formulário de Upload */}
        {showUploadForm && isAdmin && (
          <UploadForm>
            <FormTitle>📤 Enviar Novo Anexo</FormTitle>

            <FileInputWrapper>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <FileSelectButton onClick={() => fileInputRef.current?.click()}>
                <FiFile />
                {selectedFile ? selectedFile.name : "Selecionar arquivo"}
              </FileSelectButton>
              {selectedFile && (
                <FileInfo>
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </FileInfo>
              )}
            </FileInputWrapper>

            <Input
              type="text"
              placeholder="Título do anexo *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />

            <Textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <FormButtons>
              <CancelButton onClick={() => setShowUploadForm(false)}>
                Cancelar
              </CancelButton>
              <SubmitButton
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploading}
              >
                {uploading ? "Enviando..." : "Enviar"}
              </SubmitButton>
            </FormButtons>
          </UploadForm>
        )}

        {/* Lista de Anexos */}
        <Content>
          {loading ? (
            <LoadingState>Carregando anexos...</LoadingState>
          ) : attachments.length === 0 ? (
            <EmptyState>
              <FiFile size={48} />
              <p>Nenhum anexo enviado ainda</p>
              {isAdmin && <small>Clique em "Enviar Anexo" para começar</small>}
            </EmptyState>
          ) : (
            <AttachmentsList>
              {attachments.map((attachment) => (
                <AttachmentCard key={attachment.id}>
                  <CardLeft>
                    <FileIcon viewed={attachment.is_viewed}>
                      {getFileIcon(attachment.file_type)}
                    </FileIcon>
                    <AttachmentInfo>
                      <AttachmentTitle>
                        {attachment.title}
                        {!attachment.is_viewed && <NewBadge>NOVO</NewBadge>}
                      </AttachmentTitle>
                      {attachment.description && (
                        <AttachmentDescription>
                          {attachment.description}
                        </AttachmentDescription>
                      )}
                      <AttachmentMeta>
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>Enviado por {attachment.uploaded_by_email}</span>
                        <span>•</span>
                        <span>{formatDate(attachment.created_at)}</span>
                      </AttachmentMeta>
                      {attachment.is_viewed && attachment.viewed_at && (
                        <ViewedInfo>
                          <FiEye />
                          Visualizado em {formatDate(attachment.viewed_at)}
                        </ViewedInfo>
                      )}
                    </AttachmentInfo>
                  </CardLeft>

                  <CardActions>
                    <ActionButton
                      onClick={() => handleView(attachment)}
                      title="Visualizar arquivo"
                    >
                      <FiDownload />
                      Abrir
                    </ActionButton>

                    {isAdmin && (
                      <>
                        <ActionButton
                          onClick={() => handleViewStats(attachment)}
                          title="Ver estatísticas"
                        >
                          <FiUsers />
                          Estatísticas
                        </ActionButton>
                        <DeleteButton
                          onClick={() => handleDelete(attachment.id)}
                          title="Deletar anexo"
                        >
                          <FiTrash2 />
                        </DeleteButton>
                      </>
                    )}
                  </CardActions>
                </AttachmentCard>
              ))}
            </AttachmentsList>
          )}
        </Content>

        {/* Modal de Estatísticas */}
        {selectedAttachment && stats && (
          <StatsOverlay onClick={() => setSelectedAttachment(null)}>
            <StatsModal onClick={(e) => e.stopPropagation()}>
              <StatsHeader>
                <h3>📊 Estatísticas: {selectedAttachment.title}</h3>
                <CloseButton onClick={() => setSelectedAttachment(null)}>
                  <FiX />
                </CloseButton>
              </StatsHeader>

              <StatsContent>
                <StatCard>
                  <StatValue>{stats.total_users}</StatValue>
                  <StatLabel>Total de Usuários</StatLabel>
                </StatCard>

                <StatCard>
                  <StatValue>{stats.viewed_by_count}</StatValue>
                  <StatLabel>Visualizações</StatLabel>
                </StatCard>

                <StatCard>
                  <StatValue>{notViewedUsers.length}</StatValue>
                  <StatLabel>Não Visualizaram</StatLabel>
                </StatCard>
              </StatsContent>

              {notViewedUsers.length > 0 && (
                <NotViewedSection>
                  <h4>
                    <FiEyeOff /> Usuários que ainda não visualizaram:
                  </h4>
                  <UsersList>
                    {notViewedUsers.map((user) => (
                      <UserItem key={user.id}>
                        <span>{user.email}</span>
                        <RoleBadge role={user.role}>{user.role}</RoleBadge>
                      </UserItem>
                    ))}
                  </UsersList>
                </NotViewedSection>
              )}

              {stats.viewed_by && stats.viewed_by.length > 0 && (
                <ViewedSection>
                  <h4>
                    <FiEye /> Usuários que visualizaram:
                  </h4>
                  <UsersList>
                    {stats.viewed_by
                      .filter((v: any) => v.user_id)
                      .map((view: any) => (
                        <UserItem key={view.user_id}>
                          <span>{view.email}</span>
                          <ViewedDate>
                            {formatDate(view.viewed_at)}
                          </ViewedDate>
                        </UserItem>
                      ))}
                  </UsersList>
                </ViewedSection>
              )}
            </StatsModal>
          </StatsOverlay>
        )}
      </ModalContainer>
    </Overlay>
  );
};

// ==================== ESTILOS ====================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 16px;
  width: 90vw;
  max-width: 1000px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #2a2f3f;
  background: #181d2a;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
    color: #ff006c;
    font-size: 24px;
    font-weight: 800;
  }
`;

const AttachmentCount = styled.span`
  background: rgba(255, 0, 108, 0.1);
  color: #ff006c;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ff006c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff4f9a;
    transform: translateY(-1px);
  }

  svg {
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #2a2f3f;
    color: white;
  }

  svg {
    font-size: 24px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #181d2a;
  }

  &::-webkit-scrollbar-thumb {
    background: #2a2f3f;
    border-radius: 4px;

    &:hover {
      background: #3a3f4f;
    }
  }
`;

const UploadForm = styled.div`
  padding: 24px 30px;
  background: #181d2a;
  border-bottom: 1px solid #2a2f3f;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormTitle = styled.h3`
  margin: 0;
  color: #ff006c;
  font-size: 18px;
  font-weight: 700;
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileSelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #2a2f3f;
  color: white;
  border: 2px dashed #3a3f4f;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: #ff006c;
    background: rgba(255, 0, 108, 0.05);
  }

  svg {
    font-size: 20px;
  }
`;

const FileInfo = styled.span`
  font-size: 12px;
  color: #999;
  padding-left: 4px;
`;

const Input = styled.input`
  padding: 12px 16px;
  background: #2a2f3f;
  border: 1px solid #3a3f4f;
  border-radius: 8px;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #ff006c;
  }

  &::placeholder {
    color: #666;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  background: #2a2f3f;
  border: 1px solid #3a3f4f;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #ff006c;
  }

  &::placeholder {
    color: #666;
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #3a3f4f;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #2a2f3f;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 24px;
  background: #ff006c;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #ff4f9a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #666;

  svg {
    color: #444;
    margin-bottom: 16px;
  }

  p {
    font-size: 18px;
    margin: 8px 0;
  }

  small {
    font-size: 14px;
    color: #555;
  }
`;

const AttachmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AttachmentCard = styled.div`
  background: #181d2a;
  border: 1px solid #2a2f3f;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: #3a3f4f;
    transform: translateY(-2px);
  }
`;

const CardLeft = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex: 1;
`;

interface FileIconProps {
  viewed: boolean;
}

const FileIcon = styled.div<FileIconProps>`
  width: 48px;
  height: 48px;
  background: ${(props) =>
    props.viewed ? "rgba(255, 0, 108, 0.1)" : "rgba(255, 0, 108, 0.2)"};
  border: 2px solid ${(props) => (props.viewed ? "#ff006c80" : "#ff006c")};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff006c;
  font-size: 22px;
  flex-shrink: 0;
`;

const AttachmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const AttachmentTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NewBadge = styled.span`
  background: #ff006c;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const AttachmentDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #999;
  line-height: 1.4;
`;

const AttachmentMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;

  span {
    white-space: nowrap;
  }
`;

const ViewedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4caf50;
  margin-top: 4px;

  svg {
    font-size: 14px;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 0, 108, 0.1);
  border: 1px solid #ff006c;
  color: #ff006c;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #ff006c;
    color: white;
  }

  svg {
    font-size: 16px;
  }
`;

const DeleteButton = styled.button`
  padding: 8px;
  background: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff4444;
    color: white;
  }

  svg {
    font-size: 18px;
  }
`;

// Estilos do Modal de Estatísticas
const StatsOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

const StatsModal = styled.div`
  background: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const StatsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #2a2f3f;

  h3 {
    margin: 0;
    color: #ff006c;
    font-size: 20px;
    font-weight: 700;
  }
`;

const StatsContent = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px;
`;

const StatCard = styled.div`
  background: #181d2a;
  border: 1px solid #2a2f3f;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #ff006c;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #999;
  font-weight: 600;
`;

const NotViewedSection = styled.div`
  padding: 0 24px 24px 24px;

  h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ff6b6b;
    font-size: 16px;
    margin: 0 0 16px 0;

    svg {
      font-size: 18px;
    }
  }
`;

const ViewedSection = styled.div`
  padding: 0 24px 24px 24px;

  h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4caf50;
    font-size: 16px;
    margin: 0 0 16px 0;

    svg {
      font-size: 18px;
    }
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  background: #181d2a;
  border: 1px solid #2a2f3f;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    color: white;
    font-size: 14px;
  }
`;

interface RoleBadgeProps {
  role: string;
}

const RoleBadge = styled.span<RoleBadgeProps>`
  background: ${(props) =>
    props.role === "admin"
      ? "rgba(255, 0, 108, 0.2)"
      : "rgba(100, 100, 100, 0.2)"};
  color: ${(props) => (props.role === "admin" ? "#ff006c" : "#999")};
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px !important;
  font-weight: 700;
  text-transform: uppercase;
`;

const ViewedDate = styled.span`
  font-size: 12px !important;
  color: #4caf50 !important;
`;