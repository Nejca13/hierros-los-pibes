import React from "react";

const PanelAdmin = ({
  width = "20",
  height = "20",
  color = "var(--green)",
}) => {
  return (
    <svg
      stroke={color}
      fill="none"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height={height}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={18} height={18} x={3} y={3} rx={2} />
      <path d="M3 15h12" />
      <path d="M15 3v18" />
    </svg>
  );
};

export default PanelAdmin;
