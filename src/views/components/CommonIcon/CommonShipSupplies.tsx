import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  opacity: string;
};

// 船舶用品アイコン
export const ShipSupplies: React.FC<Props> = props => {
  return (
    <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_49_5612)">
        <g opacity={props.opacity}>
        <path d="M13.1 11.38L0 5.84L12.97 0L26.22 5.83L13.1 11.38ZM2.98 5.81L13.1 10.09L23.21 5.81L12.98 1.31L2.98 5.81Z" fill="white"/>
        <path d="M13.7 25.9906L0.0999756 20.8706V5.89062H1.28998V20.0406L12.51 24.2706V10.7406H13.7V25.9906Z" fill="white"/>
        <path d="M13.73 25.9006L13.3 24.7906L24.94 20.2206V5.89062H26.13V21.0306L13.73 25.9006Z" fill="white"/>
        <path d="M7.88003 12.0401L5.78003 11.3201V7.71008L16.97 1.83008L19.92 3.03008L7.87003 8.82008V12.0401H7.88003ZM6.38003 10.8901L7.29003 11.2001V8.44008L18.46 3.07008L17.01 2.48008L6.38003 8.06008V10.8801V10.8901Z" fill="white"/>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_49_5612">
          <rect width="26.22" height="25.99" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
};

export default ShipSupplies;
