import styled from "styled-components";
import { SideBar } from "../../components/sidebar";

const DashBoardContainer = styled.div`
`;

export const DashBoard = () => {
    return (
        <DashBoardContainer>
            <SideBar />
        </DashBoardContainer>
    );
}