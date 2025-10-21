import { useState } from "react";
import styled from "styled-components";

export const TopBar = () => {
  const [open, setOpen] = useState(false);

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
      </TopBarContainer>

      <Sidebar open={open}>
        <SidebarContent></SidebarContent>
      </Sidebar>

      {open && <Overlay onClick={() => setOpen(false)} />}
    </>
  );
};

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
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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
  z-index: 99;
  padding-top: 60px; /* pra não ficar atrás da topbar */
`;

const SidebarContent = styled.div`
  padding: 20px;

  h3 {
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 10px 0;
      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background: #222;
        border-radius: 6px;
        padding-left: 8px;
      }
    }
  }
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
