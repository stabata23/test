import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  opacity: string;
};

// 航海計画アイコン
export const VoyagePlan: React.FC<Props> = props => {
  return (
    <svg width="27" height="25" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity={props.opacity} clip-path="url(#clip0_1820_3942)">
        <path d="M26.6467 0H20.7802C20.7802 0 20.4268 0.136986 20.4268 0.342466V7.60274C20.4268 7.60274 20.5681 7.94521 20.7802 7.94521H21.4163C21.4163 7.94521 21.7697 7.80822 21.7697 7.60274V4.79452H26.6467C26.6467 4.79452 27.0001 4.65753 27.0001 4.45205V0.342466C27.0001 0.342466 26.8587 0 26.6467 0Z" fill="white"/>
        <path d="M15.055 23.9731C12.3691 23.9731 8.62307 23.9731 3.88746 23.8361C3.60474 23.8361 3.3927 23.5621 3.3927 23.2882C3.3927 23.0142 3.60474 22.8087 3.95815 22.8087C9.68328 22.9457 19.1545 23.0142 19.932 22.8087C20.2854 22.6032 21.3456 22.0553 21.2749 20.1375C21.2749 18.5621 19.5786 18.0142 19.2252 17.8772C18.589 17.8772 14.4189 18.0827 13.0053 17.8772C11.2383 17.6032 10.3194 15.0005 10.3194 13.9731C10.3194 12.5347 12.0864 10.7539 13.4293 10.7539H20.144C20.144 10.7539 20.7095 10.9594 20.7095 11.3019C20.7095 11.6443 20.4974 11.8498 20.144 11.8498H13.4293C12.7225 11.8498 11.3796 13.1512 11.3796 14.0416C11.3796 14.8635 12.1571 16.7813 13.2173 16.9868C14.7016 17.1923 19.2958 16.9868 19.2958 16.9868H19.4372C20.4267 17.1923 22.2644 18.2197 22.3351 20.206C22.3351 21.9183 21.7697 23.0827 20.3561 23.8361C20.0733 23.9731 18.3063 24.0416 15.055 24.0416V23.9731Z" fill="white"/>
        <path d="M3.81681 25C4.6756 25 5.37179 24.3254 5.37179 23.4932C5.37179 22.661 4.6756 21.9863 3.81681 21.9863C2.95803 21.9863 2.26184 22.661 2.26184 23.4932C2.26184 24.3254 2.95803 25 3.81681 25Z" fill="white"/>
        <path d="M21.1335 12.7403C21.9923 12.7403 22.6884 12.0656 22.6884 11.2334C22.6884 10.4012 21.9923 9.72656 21.1335 9.72656C20.2747 9.72656 19.5785 10.4012 19.5785 11.2334C19.5785 12.0656 20.2747 12.7403 21.1335 12.7403Z" fill="white"/>
        <path d="M3.60471 11.2331C5.15969 11.2331 6.14922 12.3975 6.14922 13.4934C6.14922 14.3838 4.94765 16.1646 4.0288 17.0551C4.0288 17.0551 3.88744 17.192 3.74608 17.3975L3.46335 17.0551C2.61519 16.0277 1.34293 14.4523 1.34293 13.5619C1.34293 12.74 2.12042 11.2331 3.53403 11.2331M3.53403 9.86328C1.20157 9.86328 -0.0706787 12.1236 -0.0706787 13.5619C-0.0706787 15.0003 1.4843 16.7811 2.61519 18.2194C3.74608 19.6578 3.74608 20.8907 3.74608 20.8907C3.74608 19.4523 5.08901 18.014 5.08901 18.014C5.08901 18.014 7.56283 15.4112 7.56283 13.4934C7.56283 11.6441 5.93718 9.86328 3.60471 9.86328H3.53403Z" fill="white"/>
        <path d="M3.81681 13.1517C3.81681 13.1517 4.38225 13.3572 4.38225 13.6997C4.38225 14.0421 4.17021 14.2476 3.81681 14.2476C3.4634 14.2476 3.25136 14.0421 3.25136 13.6997C3.25136 13.3572 3.4634 13.1517 3.81681 13.1517ZM3.81681 12.4668C3.11 12.4668 2.54456 13.0147 2.54456 13.6997C2.54456 14.3846 3.11 14.9325 3.81681 14.9325C4.52361 14.9325 5.08906 14.3846 5.08906 13.6997C5.08906 13.0147 4.52361 12.4668 3.81681 12.4668Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0_1820_3942">
          <rect width="27" height="25" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
};

export default VoyagePlan;
