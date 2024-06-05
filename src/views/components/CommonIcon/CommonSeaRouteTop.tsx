import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  opacity: string;
};

// 航路アイコン-上
export const SeaRouteTop: React.FC<Props> = props => {
  return (
    <svg width="8" height="78" viewBox="0 0 8 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 42L4 78" stroke="#D9D9D9" stroke-opacity="0.8" stroke-width="2" stroke-linejoin="round"/>
      <path d="M4 0L4 40" stroke="#D9D9D9" stroke-opacity="0.7" stroke-linejoin="round" stroke-dasharray="5 5"/>
      <circle cx="4" cy="41" r="4" fill="#6F6F6F"/>
    </svg>
  )
};

export default SeaRouteTop;
