import { useState, useEffect, useRef, type ChangeEvent } from "react";
import styled from "styled-components";
import { tasksAPI } from "../../configs/api";
import { ImageEditor } from "./canva";

interface Task {
  id: number;
  card_id: number;
  content: string;
  completed: boolean;
  position: number;
  image_url?: string; // 🆕 URL da imagem salva no servidor
}

interface TasksProps {
  cardId: number;
}

export const Tasks = ({ cardId }: TasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskImageFile, setNewTaskImageFile] = useState<File | null>(null);
  const [newTaskImagePreview, setNewTaskImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadTasks();
  }, [cardId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await tasksAPI.getAll(cardId);
      setTasks(data);
    } catch (error) {
      console.error("Erro ao carregar tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim() && !newTaskImageFile) {
      alert("Adicione um texto ou uma imagem");
      return;
    }

    try {
      const payload: any = {
        card_id: cardId,
        content: newTaskContent.trim() || "Imagem",
        position: tasks.length,
      };

      // 🆕 Se tiver imagem, adicionar ao payload
      if (newTaskImageFile) {
        payload.image = newTaskImageFile;
      }

      const result = await tasksAPI.create(payload);

      if (result.taskId) {
        setNewTaskContent("");
        setNewTaskImageFile(null);
        setNewTaskImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadTasks();
      }
    } catch (error) {
      console.error("Erro ao criar task:", error);
      alert("Erro ao criar task: " + (error as Error).message);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione apenas imagens!");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB!");
      return;
    }

    // Ler arquivo para preview
    const reader = new FileReader();
    reader.onload = () => {
      setNewTaskImagePreview(reader.result as string);
      setIsEditing(true); // Abrir editor
    };
    reader.readAsDataURL(file);

    // Salvar o arquivo original
    setNewTaskImageFile(file);
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      await tasksAPI.update(id, { completed: !completed });
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !completed } : task
      ));
    } catch (error) {
      console.error("Erro ao atualizar task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Deseja deletar esta task?")) return;

    try {
      await tasksAPI.delete(id);
      setTasks(tasks.filter(task => task.id !== id));
      alert("Task deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar task:", error);
      alert("Erro ao deletar task");
    }
  };

  const handleDeleteTaskImage = async (taskId: number) => {
    if (!confirm("Deseja remover apenas a imagem desta task?")) return;

    try {
      await tasksAPI.deleteImage(taskId);
      alert("Imagem removida com sucesso!");
      loadTasks();
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      alert("Erro ao deletar imagem");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  // 🆕 Salvar imagem editada
  const handleSaveEditedImage = (editedImageBase64: string) => {
    // Converter base64 para File
    fetch(editedImageBase64)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "edited-image.png", { type: "image/png" });
        setNewTaskImageFile(file);
        setNewTaskImagePreview(editedImageBase64);
        setIsEditing(false);
      });
  };

  if (loading) return <LoadingText>Carregando...</LoadingText>;

  return (
    <TasksContainer>
      <TasksList>
        {tasks.map((task) => (
          <TaskItem key={task.id}>
            {task.image_url && (
              <TaskImageContainer>
                <TaskImage 
                  src={`http://localhost:3000${task.image_url}`} 
                  alt="task" 
                />
                <DeleteImageButton 
                  onClick={() => handleDeleteTaskImage(task.id)}
                  title="Remover imagem"
                >
                  🗑️
                </DeleteImageButton>
              </TaskImageContainer>
            )}
            
            <TaskRow>
              <TaskCheckbox
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id, task.completed)}
              />
              <TaskContent completed={task.completed}>
                {task.content}
              </TaskContent>
              <DeleteTaskButton onClick={() => handleDeleteTask(task.id)}>
                ×
              </DeleteTaskButton>
            </TaskRow>
          </TaskItem>
        ))}
      </TasksList>

      <AddTaskContainer>
        {newTaskImagePreview && !isEditing && (
          <PreviewContainer>
            <img src={newTaskImagePreview} alt="preview" />
            <RemovePreviewButton onClick={() => {
              setNewTaskImageFile(null);
              setNewTaskImagePreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}>
              ×
            </RemovePreviewButton>
          </PreviewContainer>
        )}

        <InputRow>
          <TaskInput
            type="text"
            placeholder="+ Add a task"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <InputImage>
            <label htmlFor="imageInput" className="file-label" title="Adicionar imagem">
              📷
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </InputImage>
          {(newTaskContent || newTaskImageFile) && (
            <AddTaskButton onClick={handleAddTask}>Add</AddTaskButton>
          )}
        </InputRow>
      </AddTaskContainer>

      {/* Editor de imagem */}
      {isEditing && newTaskImagePreview && (
        <ImageEditor
          image={newTaskImagePreview}
          onSave={handleSaveEditedImage}
          onClose={() => {
            setIsEditing(false);
          }}
        />
      )}
    </TasksContainer>
  );
};

/* =================== ESTILOS =================== */

const LoadingText = styled.div`
  padding: 10px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

const TasksContainer = styled.div`
  padding: 10px 0;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
`;

const TaskItem = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2a2f3f;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid #3a3f4f;
`;

const TaskImageContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 8px;
`;

const TaskImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
`;

const DeleteImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 0, 0, 0.8);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;

  &:hover {
    background-color: rgba(255, 0, 0, 1);
  }
`;

const TaskRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskCheckbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
`;

const TaskContent = styled.span<{ completed: boolean }>`
  flex: 1;
  font-size: 14px;
  text-decoration: ${props => props.completed ? "line-through" : "none"};
  color: ${props => props.completed ? "#999" : "#f2f2f2"};
`;

const DeleteTaskButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #999;
  transition: 0.2s;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  &:hover {
    color: #ff4444;
  }
`;

const AddTaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px dashed #ff006c;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemovePreviewButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 0, 0, 0.8);
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 18px;
  color: white;
  transition: 0.2s;

  &:hover {
    background-color: rgba(255, 0, 0, 1);
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TaskInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #3a3f4f;
  background-color: #2a2f3f;
  color: #f2f2f2;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #ff006c;
  }

  &::placeholder {
    color: #666;
  }
`;

const InputImage = styled.div`
  label.file-label {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff006c;
    color: white;
    border-radius: 6px;
    width: 36px;
    height: 36px;
    font-size: 18px;
    cursor: pointer;
    transition: 0.2s;
  }

  label.file-label:hover {
    background-color: #ff4f9a;
  }
`;

const AddTaskButton = styled.button`
  padding: 8px 16px;
  background-color: #ff006c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    background-color: #ff4f9a;
  }
`;