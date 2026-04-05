"use client";

import styled from "styled-components";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const StyledWrapper = styled.div`
  button {
    height: 40px; /* IMPORTANT: match h-10 */
    padding: 0 16px;
    font-size: 14px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.25s ease;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    /* LIGHT MODE */
    background: #f1f5f9;
    color: #0f172a;
    box-shadow: 4px 4px 10px #d1d5db, -4px -4px 10px #ffffff;
  }

  button.dark {
    /* DARK MODE */
    background: #0b1120;
    color: #e2e8f0;
    box-shadow: 4px 4px 12px #020617, -4px -4px 12px #1e293b;
    border: 1px solid #1e293b;
  }

  button:active {
    box-shadow: inset 3px 3px 8px rgba(0,0,0,0.2),
                inset -3px -3px 8px rgba(255,255,255,0.1);
  }
`;

const Button = ({ children, className, onClick, type = "button", disabled, circular }) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = mounted && currentTheme === "dark";

  return (
    <StyledWrapper className={className}>
      <button 
        type={type} 
        onClick={onClick} 
        disabled={disabled}
        className={isDark ? "dark" : ""} 
        style={{ 
          width: circular ? "48px" : "100%",
          height: circular ? "48px" : "40px",
          padding: circular ? "0" : "0 16px",
          borderRadius: circular ? "50%" : "10px",
          opacity: disabled ? 0.5 : 1, 
          cursor: disabled ? "not-allowed" : "pointer" 
        }}
      >
        {children}
      </button>
    </StyledWrapper>
  );
};

export default Button;
