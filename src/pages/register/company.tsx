import { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { API_ENDPOINTS } from "../../configs/api";

// Aplica a fonte Nunito globalmente
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

  * {
    font-family: "Nunito", sans-serif;
    transition: all 0.2s ease-in-out;
  }
`;

export const RegisterCompany = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nome da empresa é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.COMPANIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Empresa cadastrada com sucesso!");
        setName("");
      } else {
        setError(data.error || "Erro ao cadastrar empresa");
      }
    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <RegisterContainer>
        <ImageContainer>
          <img src="/logo/hauzlogoredu.png" alt="Logo Hauz" />
          <img src="/logo/hauzlogo.png" alt="Hauz" />
        </ImageContainer>
        <FormContainer onSubmit={handleRegister}>
          <h2>Cadastrar Empresa</h2>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <Label htmlFor="companyName">Nome da empresa</Label>
          <input
            id="companyName"
            type="text"
            placeholder="nome da empresa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            maxLength={100}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Empresa"}
          </button>
        </FormContainer>
      </RegisterContainer>
    </>
  );
};

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  min-height: 100vh;
  background-color: #0f1116;
  padding: 20px;
  color: #f2f2f2;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 100%;
    max-width: 400px;
    height: auto;
    object-fit: contain;
  }

  img:first-child {
    width: 40%;
  }
`;

const FormContainer = styled.form`
  width: 90%;
  max-width: 450px;
  border: 1px solid #2a2f3f;
  border-radius: 20px;
  background-color: #1c2230;
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  h2 {
    text-align: center;
    color: #ff006c;
    margin-bottom: 10px;
    font-weight: 800;
  }

  input {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #2a2f3f;
    background-color: #0f1116;
    color: #f2f2f2;
    padding: 0 10px;
    outline: none;
    font-size: 14px;

    &:disabled {
      background-color: #2a2f3f;
      cursor: not-allowed;
    }

    &:focus {
      border-color: #ff006c;
    }
  }

  button {
    background-color: #ff006c;
    width: 100%;
    border-radius: 20px;
    height: 40px;
    border: none;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s ease;

    &:hover:not(:disabled) {
      background-color: #ff4f9a;
    }

    &:disabled {
      background-color: #2a2f3f;
      cursor: not-allowed;
    }
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: #f2f2f2;
  margin-left: 4px;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background-color: #2a2f3f;
  color: #ff4f9a;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ff006c40;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #2a2f3f;
  color: #5aff8b;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #5aff8b40;
  font-size: 14px;
  text-align: center;
`;
