import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { API_ENDPOINTS } from "../../configs/api";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <ImageContainer>
        <img src="src/assets/logo/hauzlogoredu.png" />
        <img src="src/assets/logo/hauzlogo.png" />
      </ImageContainer>

      <FormContainer onSubmit={handleSubmit}>
        <h2>Entrar</h2>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </FormContainer>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  min-height: 100vh;
  background-color: #0f1116;
  padding: 20px;
  color: #f2f2f2;
  font-family: "Nunito", sans-serif;

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
  gap: 20px;
  font-family: "Nunito", sans-serif;

  h2 {
    text-align: center;
    color: #ff006c;
    margin-bottom: 10px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 14px;
      font-weight: 600;
      color: #c9c9c9;
      margin-left: 2px;
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
      transition: border-color 0.3s ease;

      &:disabled {
        background-color: #2a2f3f;
        cursor: not-allowed;
      }

      &:focus {
        border-color: #ff006c;
      }

      &::placeholder {
        color: #8c8c8c;
      }
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
    font-family: "Nunito", sans-serif;

    &:hover:not(:disabled) {
      background-color: #ff4f9a;
    }

    &:disabled {
      background-color: #2a2f3f;
      cursor: not-allowed;
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #2a2f3f;
  color: #ff4f9a;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ff006c40;
  font-size: 14px;
  text-align: center;
  font-family: "Nunito", sans-serif;
`;
