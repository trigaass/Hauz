import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/dashboard";
import { Boards } from "./pages/boards";
import { Login } from "./pages/login";
import { RegisterUser } from "./pages/register";
import { RegisterCompany } from "./pages/register/company";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Boards" element={<Boards boardId={0} />} />
      </Routes>
    </BrowserRouter>
  );
};
