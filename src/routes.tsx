import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashBoard } from "./pages/dashboard";
import { Boards } from "./pages/boards";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/Boards" element={<Boards />} />
      </Routes>
    </BrowserRouter>
  );
};
