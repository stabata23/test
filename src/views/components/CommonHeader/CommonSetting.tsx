import React from "react";

import { Link } from "react-router-dom";
// 歯車アイコン
export const Setting: React.FC = () => {
  return (
    // todo とりあえずマスター取込用(仮作成)
    <Link to="/MasterRegist" >
    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_217_2959)">
        <g opacity="0.25" filter="url(#filter0_d_217_2959)">
          <path d="M16.5 32C25.0604 32 32 25.0604 32 16.5C32 7.93959 25.0604 1 16.5 1C7.93959 1 1 7.93959 1 16.5C1 25.0604 7.93959 32 16.5 32Z" fill="white"/>
        </g>
        <g opacity="0.7" filter="url(#filter1_d_217_2959)">
          <path d="M16.5 32C25.0604 32 32 25.0604 32 16.5C32 7.93959 25.0604 1 16.5 1C7.93959 1 1 7.93959 1 16.5C1 25.0604 7.93959 32 16.5 32Z" stroke="white" stroke-miterlimit="10"/>
        </g>
        <g filter="url(#filter2_d_217_2959)">
          <path d="M24.5 17.4502V15.1602L22 14.7402C21.88 14.3102 21.71 13.9002 21.49 13.5202L22.97 11.4502L21.35 9.83023L19.28 11.3102C18.9 11.1002 18.49 11.0202 18.06 10.9002L17.64 8.49023H15.36L14.94 10.9002C14.51 11.0202 14.1 11.1502 13.72 11.3602L11.65 9.86023L10.03 11.4602L11.51 13.5202C11.3 13.9002 11.12 14.3102 11 14.7402L8.5 15.1502V17.4402L11 17.8602C11.12 18.2902 11.29 18.7002 11.51 19.0802L10.03 21.1502L11.65 22.7702L13.72 21.2902C14.1 21.5002 14.51 21.7702 14.94 21.8902L15.36 24.4902H17.64L18.06 21.8902C18.49 21.7702 18.9 21.5502 19.28 21.3302L21.35 22.7802L22.97 21.1502L21.49 19.0802C21.7 18.7002 21.88 18.2802 22 17.8502L24.5 17.4302V17.4502ZM16.97 18.9802C15.46 18.9802 14.23 17.7502 14.23 16.2402C14.23 14.7302 15.46 13.5002 16.97 13.5002C18.48 13.5002 19.71 14.7302 19.71 16.2402C19.71 17.7502 18.48 18.9802 16.97 18.9802Z" fill="white"/>
        </g>
      </g>
      <defs>
        <filter id="filter0_d_217_2959" x="-3" y="-3" width="39" height="39" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.027451 0 0 0 0 0.00392157 0 0 0 0 0.00784314 0 0 0 0.5 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_217_2959"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_217_2959" result="shape"/>
        </filter>
        <filter id="filter1_d_217_2959" x="-3.5" y="-3.5" width="40" height="40" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.027451 0 0 0 0 0.00392157 0 0 0 0 0.00784314 0 0 0 0.5 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_217_2959"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_217_2959" result="shape"/>
        </filter>
        <filter id="filter2_d_217_2959" x="3.16" y="3.15023" width="26.68" height="26.68" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2.67"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.0235294 0 0 0 0 0 0 0 0 0 0.00392157 0 0 0 0.5 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_217_2959"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_217_2959" result="shape"/>
        </filter>
        <clipPath id="clip0_217_2959">
          <rect width="33" height="33" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    </Link>
  )
};

export default Setting;
