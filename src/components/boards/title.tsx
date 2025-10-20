import { useState } from "react";
import styled from "styled-components";

interface TitleProps {
  initialTitle: string;
  onSave: (title: string) => void;
}

export const Title = ({ initialTitle, onSave }: TitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(initialTitle);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <TitleInput
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        autoFocus
      />
    );
  }

  return (
    <TitleText onClick={() => setIsEditing(true)}>
      {title}
    </TitleText>
  );
};

const TitleText = styled.h3`
  margin: 10px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const TitleInput = styled.input`
  margin: 10px 0;
  font-size: 16px;
  font-weight: 600;
  padding: 5px 8px;
  border: 2px solid #007bff;
  border-radius: 4px;
  outline: none;
  width: 100%;
`;