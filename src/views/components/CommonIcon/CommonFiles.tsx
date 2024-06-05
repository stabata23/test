import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  opacity: string;
};

// ファイルアイコン
export const Files: React.FC<Props> = props => {
  return (
    <svg width="34" height="35" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_49_5618)" filter="url(#filter0_d_49_5618)">
        <g opacity={props.opacity}>
          <path d="M22.25 25.88H4V0H15.63V1.04H5.04V24.84H22.25V25.88Z" fill="white"/>
          <path d="M22.77 7.13086H21.73V10.9109H22.77V7.13086Z" fill="white"/>
          <path d="M22.25 7.65038L15.76 7.53038C15.48 7.53038 15.25 7.30038 15.25 7.02038L15.13 0.530378C15.13 0.320378 15.25 0.120378 15.45 0.0403783C15.65 -0.0396217 15.87 0.000378311 16.02 0.150378L22.63 6.76038C22.78 6.91038 22.82 7.14038 22.74 7.33038C22.66 7.52038 22.47 7.65038 22.26 7.65038H22.25ZM16.27 6.50038L20.97 6.58038L16.18 1.80038L16.26 6.50038H16.27Z" fill="white"/>
          <path d="M21.74 23.2905C18.71 23.2905 16.25 20.8305 16.25 17.8005C16.25 14.7705 18.71 12.3105 21.74 12.3105C24.77 12.3105 27.23 14.7705 27.23 17.8005C27.23 20.8305 24.77 23.2905 21.74 23.2905ZM21.74 13.3505C19.29 13.3505 17.29 15.3505 17.29 17.8005C17.29 20.2505 19.28 22.2505 21.74 22.2505C24.2 22.2505 26.19 20.2605 26.19 17.8005C26.19 15.3405 24.2 13.3505 21.74 13.3505Z" fill="white"/>
          <path d="M28.89 26.0307C28.75 26.0307 28.62 25.9807 28.52 25.8707L24.66 21.8907C24.46 21.6807 24.46 21.3507 24.67 21.1507C24.88 20.9507 25.21 20.9507 25.41 21.1607L29.27 25.1407C29.47 25.3507 29.47 25.6807 29.26 25.8807C29.16 25.9807 29.03 26.0307 28.9 26.0307H28.89Z" fill="white"/>
          <path d="M7.95 12.8102C8.47467 12.8102 8.9 12.3848 8.9 11.8602C8.9 11.3355 8.47467 10.9102 7.95 10.9102C7.42533 10.9102 7 11.3355 7 11.8602C7 12.3848 7.42533 12.8102 7.95 12.8102Z" fill="white"/>
          <path d="M7.95 16.941C8.47467 16.941 8.9 16.5157 8.9 15.991C8.9 15.4663 8.47467 15.041 7.95 15.041C7.42533 15.041 7 15.4663 7 15.991C7 16.5157 7.42533 16.941 7.95 16.941Z" fill="white"/>
          <path d="M7.95 21.5113C8.47467 21.5113 8.9 21.086 8.9 20.5613C8.9 20.0367 8.47467 19.6113 7.95 19.6113C7.42533 19.6113 7 20.0367 7 20.5613C7 21.086 7.42533 21.5113 7.95 21.5113Z" fill="white"/>
          <path d="M17.77 11.3613H10.66V12.3813H17.77V11.3613Z" fill="white"/>
          <path d="M14.98 15.4805H10.66V16.5005H14.98V15.4805Z" fill="white"/>
          <path d="M14.98 20.0605H10.66V21.0805H14.98V20.0605Z" fill="white"/>
        </g>
      </g>
      <defs>
        <filter id="filter0_d_49_5618" x="0" y="0" width="33.41" height="34.0293" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_49_5618"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_49_5618" result="shape"/>
        </filter>
        <clipPath id="clip0_49_5618">
          <rect width="25.41" height="26.03" fill="white" transform="translate(4)"/>
        </clipPath>
      </defs>
    </svg>
  )
};

export default Files;
