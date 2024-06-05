import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  clickFilePicker: () => void;
};

// ファイル選択アイコン
export const FilePicker: React.FC<Props> = props => {
  return (
    <svg onClick={props.clickFilePicker} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.25" filter="url(#filter0_d_377_6539)">
        <path d="M20.5 36C29.0604 36 36 29.0604 36 20.5C36 11.9396 29.0604 5 20.5 5C11.9396 5 5 11.9396 5 20.5C5 29.0604 11.9396 36 20.5 36Z" fill="white"/>
      </g>
      <g opacity="0.7" filter="url(#filter1_d_377_6539)">
        <path d="M20.5 36C29.0604 36 36 29.0604 36 20.5C36 11.9396 29.0604 5 20.5 5C11.9396 5 5 11.9396 5 20.5C5 29.0604 11.9396 36 20.5 36Z" stroke="white" stroke-miterlimit="10"/>
      </g>
      <g clip-path="url(#clip0_377_6539)">
        <g filter="url(#filter2_d_377_6539)">
          <path d="M16.5 22V28.5H25.5V15.5H23" stroke="white" stroke-miterlimit="10"/>
        </g>
        <path d="M13 16H21" stroke="white" stroke-width="2" stroke-miterlimit="10"/>
        <path d="M17 12V20" stroke="white" stroke-width="2" stroke-miterlimit="10"/>
      </g>
      <defs>
        <filter id="filter0_d_377_6539" x="1" y="1" width="39" height="39" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.027451 0 0 0 0 0.00392157 0 0 0 0 0.00784314 0 0 0 0.5 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_377_6539"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_377_6539" result="shape"/>
        </filter>
        <filter id="filter1_d_377_6539" x="0.5" y="0.5" width="40" height="40" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.027451 0 0 0 0 0.00392157 0 0 0 0 0.00784314 0 0 0 0.5 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_377_6539"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_377_6539" result="shape"/>
        </filter>
        <filter id="filter2_d_377_6539" x="12" y="11" width="18" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.75 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_377_6539"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_377_6539" result="shape"/>
        </filter>
        <clipPath id="clip0_377_6539">
          <rect width="13" height="17" fill="white" transform="translate(13 12)"/>
        </clipPath>
      </defs>
    </svg>
  )
};

export default FilePicker;
