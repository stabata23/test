import React from "react";

// 在庫プラスアイコン
export const StockPlus: React.FC = () => {
  return (
    <svg className="svg-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1820_3866)">
        <path d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z" fill="rgba(255, 255, 255, 0.5)"/>
        <path d="M14 8H4V10H14V8Z" fill="#01103B"/>
        <path d="M10 4H8V14H10V4Z" fill="#01103B"/>
      </g>
      <defs>
        <clipPath id="clip0_1820_3866">
          <rect width="18" height="18" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
};

export default StockPlus;
