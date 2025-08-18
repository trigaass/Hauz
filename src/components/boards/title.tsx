import { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const TitleContainer = styled.div`
  display: flex;
  width: 88%;
  min-height: 40px;
  max-height: 80px;
  justify-content: center;

  textarea {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 20px;
    font-weight: 500;
    font-family: inherit;
    resize: none;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 40px;
    max-height: 80px;
  }

  h1 {
    width: 100%;
    font-size: 20px;
    font-weight: 500;
    font-family: inherit;
    user-select: none;
    word-break: break-word;
    white-space: normal;
  }
`;

export const Title = () => {
  const [title, setTitle] = useState("New Board");
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [title]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const len = e.target.value.length;
    e.target.setSelectionRange(len, len);
  };

  return (
    <TitleContainer>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          placeholder="Enter board title"
          onChange={e => setTitle(e.target.value)}
          onBlur={() => setIsEditing(false)}
          value={title}
          maxLength={20}
          autoFocus
          onFocus={handleFocus}
        />
      ) : (
        <h1 onClick={() => setIsEditing(true)}>{title}</h1>
      )}
    </TitleContainer>
  );
};
