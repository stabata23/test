import React from "react";
import { Asc } from "./CommonAsc";
import { Desc } from "./CommonDesc";

// 親コンポーネントから持ち回る値
type Props = {
  preSortColumn: string;
  preSortKind: string;
  columnName: string;
  setSort: (columnName: string, sortKind: string) => void;
};

// ソート矢印アイコン
export const CommonSortIcon: React.FC<Props> = props => {
  return (
    <span>
      {props.preSortColumn === props.columnName
          && props.preSortKind === "asc" ? (
        <Asc
          fill="#FFFFFF"
          columnName={props.columnName}
          setSort={props.setSort}
        />
      ) : (
        <Asc
          fill="rgba(255, 255, 255, 0.5)"
          columnName={props.columnName}
          setSort={props.setSort}
        />
      )}
      
      {props.preSortColumn === props.columnName
          && props.preSortKind === "desc" ? (
        <Desc
          fill="#FFFFFF"
          columnName={props.columnName}
          setSort={props.setSort}
        />
      ) : (
        <Desc
          fill="rgba(255, 255, 255, 0.5)"
          columnName={props.columnName}
          setSort={props.setSort}
        />
      )}
    </span>
  )
};

export default CommonSortIcon;
