import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  opacity: string;
};

// エクスポートアイコン
export const Export: React.FC<Props> = props => {
  return (
    <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_49_5632)">
        <g opacity={props.opacity}>
          <path d="M22.5866 12.0659V20.5707H1.41345V11.9707" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.8622 2.55221C12.8622 2.07357 12.4783 1.68555 12.0047 1.68555C11.5311 1.68555 11.1472 2.07357 11.1472 2.55221V14.3903C11.1472 14.869 11.5311 15.257 12.0047 15.257C12.4783 15.257 12.8622 14.869 12.8622 14.3903V2.55221Z" fill="white"/>
          <path d="M5.9458 7.02773L8.97054 4.22773L12.0047 1.42773L15.0294 4.22773L18.0542 7.02773" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_49_5632">
          <rect width="24" height="22" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
};

export default Export;
