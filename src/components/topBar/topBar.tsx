import { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface TopBarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  onAddUser?: () => void;
  onManageUsers?: () => void; // ✅ ADICIONADO
}

export const TopBar = ({
  isAdmin = false,
  onLogout,
  onAddUser,
  onManageUsers, // ✅ ADICIONADO
}: TopBarProps) => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <TopBarContainer>
        <LeftSection>
          <Hamburger onClick={() => setOpen(!open)}>
            <span></span>
            <span></span>
            <span></span>
          </Hamburger>
          <Logo src="/logo/hauzlogo.png" alt="Hauz" />
        </LeftSection>

        <RightSection ref={menuRef}>
          <ProfileIcon
            src="/icons/perfil-de-usuario.png"
            alt="Perfil"
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {menuOpen && (
            <DropdownMenu>
              {isAdmin && (
                <MenuItem onClick={onAddUser}>Adicionar Usuário</MenuItem>
              )}
              {isAdmin && (
                <MenuItem onClick={onManageUsers}>
                  Administrar Usuários
                </MenuItem>
              )}
              <MenuItem onClick={onLogout}>Sair</MenuItem>
            </DropdownMenu>
          )}
        </RightSection>
      </TopBarContainer>

      <Sidebar open={open}>
        <SidebarContent></SidebarContent>
      </Sidebar>

      {open && <Overlay onClick={() => setOpen(false)} />}
    </>
  );
};

// ================== Styled Components ==================

const TopBarContainer = styled.div`
  width: 100%;
  height: 60px;
  background-color: #0f0f0f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RightSection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 40px;
`;

const Hamburger = styled.div`
  width: 24px;
  height: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;

  span {
    display: block;
    height: 2px;
    width: 100%;
    background-color: #fff;
    border-radius: 2px;
  }
`;

const Logo = styled.img`
  height: 22px;
  cursor: pointer;
`;

const ProfileIcon = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #1c1c1c;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 500;
  animation: fadeIn 0.2s ease forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #eee;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2a2a2a;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

interface SidebarProps {
  open: boolean;
}

const Sidebar = styled.div<SidebarProps>`
  position: fixed;
  top: 0;
  left: ${({ open }) => (open ? "0" : "-260px")};
  width: 260px;
  height: 100vh;
  background-color: #181818;
  color: white;
  transition: left 0.3s ease;
  z-index: 300;
  padding-top: 60px;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.4);
`;

const SidebarContent = styled.div`
  padding: 20px;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
`;