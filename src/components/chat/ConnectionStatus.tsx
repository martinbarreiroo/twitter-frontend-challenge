import React from "react";
import styled from "styled-components";

const StyledConnectionStatus = styled.div<{ status: string }>`
  padding: 8px 16px;
  background: ${(props) => {
    switch (props.status) {
      case "connected":
        return "#10b981";
      case "connecting":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  }};
  color: white;
  font-size: 12px;
  text-align: center;

  &.disconnected {
    background: #fef3f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
`;

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected";
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  if (status === "connected") {
    return null; // Don't show anything when connected
  }

  return (
    <StyledConnectionStatus
      status={status}
      className={status === "disconnected" ? "disconnected" : ""}
    >
      {status === "connecting"
        ? "Connecting to chat server..."
        : "Chat service unavailable"}
    </StyledConnectionStatus>
  );
};

export default ConnectionStatus;
