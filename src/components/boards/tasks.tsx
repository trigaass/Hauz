import { useRef, useState, type ChangeEvent } from "react";
import styled from "styled-components"

const TasksContainer = styled.div`
`;

const TasksInput = styled.div`
`;

const InputImage = styled.div`
.file-label {
    cursor: pointer;
    background: transparent;
    border: none;
    font-size: 1.5rem; /* tamanho do ⋮ */
    padding: 0;
    margin: 0;
    color: inherit; /* mantém a cor do texto do container */
}
`;

export const Tasks = () => {
    const [tasks, setTasks] = useState<{ id: number; taskText: string; taskImage?: string }[]>([]);
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskImage, setNewTaskImage] = useState<string | undefined>(undefined);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleNewTask = () => {
        if (newTaskText.trim() === "" && !newTaskImage) return;

        const newTask = {
            id: tasks.length + 1,
            taskText: newTaskText,
            taskImage: newTaskImage
        };
        setTasks([...tasks, newTask]);
        setNewTaskText("");
        setNewTaskImage(undefined);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setNewTaskImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <TasksContainer>
            {tasks.map((task) => (
                <div key={task.id}>
                    <img src={task.taskImage} />
                    <p>{task.taskText}</p>
                </div>
            ))}
            <TasksInput>
                <div>
                    <p>Pré-visualização:</p>
                    <img src={newTaskImage} alt="preview" width={50} />
                </div>
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                />
                <button onClick={handleNewTask}>+</button>
                <InputImage>
                    <label htmlFor="imageInput" className="file-label">⋮</label>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </InputImage>
            </TasksInput>
        </TasksContainer>
    );
};
