import { NavLink } from "react-router-dom";
import styled from "styled-components";

const SideBarContainer = styled.div`
  width: 130px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 10px;
  font-family: "Inter", sans-serif;

  a {
    text-decoration: none;
  }

  img {
    max-width: 80px;
    margin-left: 20px;
  }
`;

const SideBarItems = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 20px;

  a {
    display: flex;
    align-items: center;
    padding: 10px 0;
    gap: 12px;
    font-size: 15px;
    font-weight: 500;
    color: #4b5563;
    border-radius: 8px;
    transition: background 0.2s ease;

    img {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: #f3f4f6;
    }

    &.active {
      background: #e5e7eb;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
    }
  }
`;

export const SideBar = () => {
    const items: Array<{
        id: number;
        name: string;
        icon: string;
        link?: string;
    }> = [
            { id: 1, name: "Item 1", icon: "src/assets/icons/DashBoardIcon.png", link: "/Boards" },
            { id: 2, name: "Item 2", icon: "src/assets/icons/kanban.png", link: "/s" },
            { id: 3, name: "Item 3", icon: "icon1.png", link: "/a" }
        ];

    return (
        <SideBarContainer>
            <a href="/"><img src="src/assets/logo/WorkFlowLogo.png" /></a>
            <SideBarItems>
                {items.map((item) => (
                    <NavLink
                        className={({ isActive }) => isActive ? "active" : ""}
                        key={item.id}
                        to={item.link || "#"}
                    >
                        <img src={item.icon} />
                        <label>{item.name}</label>
                    </NavLink>
                ))}
            </SideBarItems>
        </SideBarContainer>
    )
}