import React from 'react';
import './App.css';
import { Outlet } from "react-router-dom";

import CommonHeader from "./views/components/CommonHeader/CommonHeader";
import CommonMenu from "./views/components/CommonMenu/CommonMenu";

// 親コンポーネントから持ち回る値
export type Props = {
  setImo: (value: string) => void;
};

const App: React.FC<Props> = props => {
  return (
    <div>
      <CommonHeader setImo={props.setImo} />
      <div className="page">
        <CommonMenu />
        <Outlet /> 
      </div>
    </div>
  );
};

export default App;
