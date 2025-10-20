import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { API_ENDPOINTS } from "../../configs/api";

interface Company {
  id: number;
  name: string;
}

// Fonte global Nunito
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

  * {
    font-family: "Nunito", sans-serif;
    transition: all 0.2s ease-in-out;
  }
`;

export const RegisterUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(API_ENDPOINTS.COMPANIES);
        if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) setCompanies(data);
        else throw new Error("Formato de dados inválido");
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
        setCompanies([]);
        setError(err instanceof Error ? err.message : "Erro ao carregar empresas");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !companyId) {
      setError("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          company_id: parseInt(companyId),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Usuário cadastrado com sucesso!");
        setEmail("");
        setPassword("");
        setRole("user");
        setCompanyId("");
      } else {
        setError(data.error || "Erro ao cadastrar usuário");
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <RegisterContainer>
        <ImageContainer>
          <img src="src/assets/logo/hauzlogoredu.png" />
          <img src="src/assets/logo/hauzlogo.png" />
        </ImageContainer>

        <FormContainer onSubmit={handleRegister}>
          <h2>Cadastrar Usuário</h2>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            type="email"
            placeholder="Digite o email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />

          <Label htmlFor="password">Senha</Label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            minLength={6}
          />

          <Label htmlFor="role">Função</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={submitting}
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>

          <Label htmlFor="company">Empresa</Label>
          <select
            id="company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            disabled={loading || submitting}
          >
            <option value="">
              {loading ? "Carregando empresas..." : "Selecione a empresa"}
            </option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading || submitting || companies.length === 0}
          >
            {submitting ? "Cadastrando..." : "Cadastrar Usuário"}
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

  input,
  select {
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
