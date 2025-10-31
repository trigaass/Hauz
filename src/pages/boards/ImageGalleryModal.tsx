import { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX, FiDownload, FiMaximize2 } from "react-icons/fi";
import { API_ENDPOINTS } from "../../configs/api";

interface Image {
  id: number;
  task_id: number;
  card_id: number;
  card_title: string;
  image_url: string;
  content: string;
  created_at: string;
}

interface ImageGalleryModalProps {
  boardId: number;
  boardName: string;
  onClose: () => void;
}

export const ImageGalleryModal = ({ boardId, boardName, onClose }: ImageGalleryModalProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBoardImages();
  }, [boardId]);

  const fetchBoardImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.BOARDS}/${boardId}/images`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar imagens");
      }
      
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      alert("Erro ao carregar galeria de imagens");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(`https://hauzserver.onrender.com${imageUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      alert("Erro ao baixar imagem");
    }
  };

  const getUniqueCards = () => {
    const cards = new Set(images.map(img => img.card_title));
    return Array.from(cards);
  };

  const filteredImages = filter === "all" 
    ? images 
    : images.filter(img => img.card_title === filter);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <h2>🖼️ Galeria de Imagens</h2>
            <BoardName>{boardName}</BoardName>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <FilterSection>
          <FilterLabel>Filtrar por card:</FilterLabel>
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos os cards ({images.length})</option>
            {getUniqueCards().map((cardTitle) => (
              <option key={cardTitle} value={cardTitle}>
                {cardTitle} ({images.filter(img => img.card_title === cardTitle).length})
              </option>
            ))}
          </FilterSelect>
        </FilterSection>

        <ModalContent>
          {loading ? (
            <LoadingText>Carregando imagens...</LoadingText>
          ) : filteredImages.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🖼️</EmptyIcon>
              <EmptyText>Nenhuma imagem encontrada neste board</EmptyText>
              <EmptySubtext>Adicione imagens às suas tasks para vê-las aqui</EmptySubtext>
            </EmptyState>
          ) : (
            <ImageGrid>
              {filteredImages.map((image) => (
                <ImageCard key={image.id}>
                  <ImageWrapper onClick={() => setSelectedImage(image)}>
                    <Image 
                      src={`https://hauzserver.onrender.com${image.image_url}`} 
                      alt={image.content}
                      loading="lazy"
                    />
                    <ImageOverlay>
                      <OverlayButton title="Ver em tela cheia">
                        <FiMaximize2 />
                      </OverlayButton>
                    </ImageOverlay>
                  </ImageWrapper>
                  
                  <ImageInfo>
                    <CardBadge>{image.card_title}</CardBadge>
                    {image.content && <ImageDescription>{image.content}</ImageDescription>}
                    <ImageActions>
                      <ActionButton
                        onClick={() => handleDownload(image.image_url, `${image.content || 'image'}.png`)}
                        title="Baixar imagem"
                      >
                        <FiDownload /> Download
                      </ActionButton>
                    </ImageActions>
                  </ImageInfo>
                </ImageCard>
              ))}
            </ImageGrid>
          )}
        </ModalContent>

        {/* Modal de visualização em tela cheia */}
        {selectedImage && (
          <FullscreenOverlay onClick={() => setSelectedImage(null)}>
            <FullscreenContent onClick={(e) => e.stopPropagation()}>
              <FullscreenHeader>
                <FullscreenInfo>
                  <h3>{selectedImage.content || "Imagem"}</h3>
                  <span>{selectedImage.card_title}</span>
                </FullscreenInfo>
                <FullscreenActions>
                  <ActionButton
                    onClick={() => handleDownload(selectedImage.image_url, `${selectedImage.content || 'image'}.png`)}
                  >
                    <FiDownload /> Download
                  </ActionButton>
                  <CloseButton onClick={() => setSelectedImage(null)}>
                    <FiX />
                  </CloseButton>
                </FullscreenActions>
              </FullscreenHeader>
              <FullscreenImageWrapper>
                <FullscreenImage 
                  src={`https://hauzserver.onrender.com${selectedImage.image_url}`}
                  alt={selectedImage.content}
                />
              </FullscreenImageWrapper>
            </FullscreenContent>
          </FullscreenOverlay>
        )}
      </Modal>
    </Overlay>
  );
};

// ==================== ESTILOS ====================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: #1c2230;
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #2a2f3f;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #2a2f3f;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #ff006c;
    font-weight: 700;
  }
`;

const BoardName = styled.span`
  font-size: 14px;
  color: #999;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #2a2f3f;
    color: #fff;
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-bottom: 1px solid #2a2f3f;
  background: #171b26;
`;

const FilterLabel = styled.label`
  color: #ccc;
  font-size: 14px;
  font-weight: 600;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  background: #1c2230;
  border: 1px solid #2a2f3f;
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #ff006c;
  }

  &:hover {
    border-color: #3a3f4f;
  }
`;

const ModalContent = styled.div`
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 60px 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 18px;
  color: #ccc;
  margin: 0 0 8px 0;
  font-weight: 600;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const ImageCard = styled.div`
  background: #0f1116;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2f3f;
  transition: all 0.3s;

  &:hover {
    border-color: #ff006c;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(255, 0, 108, 0.2);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;

  ${ImageWrapper}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;

  ${ImageWrapper}:hover & {
    opacity: 1;
  }
`;

const OverlayButton = styled.button`
  background: rgba(255, 0, 108, 0.9);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #ff006c;
    transform: scale(1.1);
  }

  svg {
    font-size: 20px;
  }
`;

const ImageInfo = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 0, 108, 0.1);
  color: #ff006c;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
`;

const ImageDescription = styled.p`
  color: #ccc;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
`;

const ImageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #2a2f3f;
  color: #f2f2f2;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff006c;
    color: white;
  }

  svg {
    font-size: 14px;
  }
`;

// Fullscreen Modal
const FullscreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
`;

const FullscreenContent = styled.div`
  width: 95%;
  height: 95%;
  display: flex;
  flex-direction: column;
  background: #1c2230;
  border-radius: 12px;
  overflow: hidden;
`;

const FullscreenHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #0f1116;
  border-bottom: 1px solid #2a2f3f;
`;

const FullscreenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    margin: 0;
    color: #f2f2f2;
    font-size: 18px;
  }

  span {
    color: #999;
    font-size: 14px;
  }
`;

const FullscreenActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FullscreenImageWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #000;
`;

const FullscreenImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;