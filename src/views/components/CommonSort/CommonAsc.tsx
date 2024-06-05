import React from "react";

// 親コンポーネントから持ち回る値
type Props = {
  fill: string;
  columnName: string;
  setSort: (sortKey: string, sortKind: string) => void;
};

// ソート昇順矢印
export const Asc: React.FC<Props> = props => {
  return (
    <svg
      onClick={() => props.setSort(props.columnName, "asc")}
      width="10"
      height="9"
      viewBox="0 0 10 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="none"
        d="M0 8.47L4.89 0L9.78 8.47H0Z"
        fill={props.fill || "rgba(255, 255, 255, 0.5)"}
      />
    </svg>
  )
};

export default Asc;
