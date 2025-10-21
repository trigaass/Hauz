import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { Boards } from "./pages/boards";
import { RegisterUser } from "./pages/register";
import { RegisterCompany } from "./pages/register/company";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register-user" element={<RegisterUser />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      
      {/* ✅ CORRIGIR: Adicionar userId e isAdmin */}
      <Route 
        path="/boards/:id" 
        element={
          <BoardsRoute />
        } 
      />
    </Routes>
  );
};

// ✅ Componente auxiliar para pegar dados do usuário
const BoardsRoute = () => {
  const { id } = useParams<{ id: string }>();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const boardId = parseInt(id || "0");
  const isAdmin = user.role === "admin" || user.isAdmin;

  return (
    <Boards 
      boardId={boardId} 
      userId={user.id}
      isAdmin={isAdmin}
    />
  );
};