import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { CommonShipSelectModal } from "./CommonShipSelectModal"
import ComSetting from "../../components/CommonHeader/CommonSetting";
import "./CommonHeader.css";
import { useSessionData } from "../CommonSession/CommonSession";

// 親コンポーネントから持ち回る値
export type Props = {
  setImo: (value: string) => void;
};

const CommonHeader: React.FC<Props> = props => {

  // 船名
  // TODO 一旦べた
  // DBから取得した値を設定する、初期値は不要
  const [shipName, setShipName] = React.useState("すざく");

  // TODO 一旦べた
  // DBから取得した値を設定する、初期値は不要
  const [shipImo, setShipImo] = React.useState("imo01");

  // 船名モーダル表示制御
  const [modal, setModal] = useState(false);

  // セッションカスタムhook
  const { setImo } = useSessionData();

  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 初期表示の船名取得処理
      getShipName();
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);

  // 船名取得（初期表示）
  const getShipName = () => {
    // 共通エリアのimo等から取得
    // setShipName("すざく")
    // setShipImo("01")

    // セッションにセット
    setImo(shipImo);
    props.setImo(shipImo);
  }
  
  // 船名モーダル表示
  const openModal = () => {
    setModal(true);
  };

  // 船名モーダル非表示
  const closeModal = () => {
    setModal(false);
  };

  // 船設定
  const setShip = (selectShipImo: string, selectShipName: string) => {
    setShipImo(selectShipImo);
    setShipName(selectShipName);
    setModal(false);

    // セッションにセット
    setImo(selectShipImo);
    props.setImo(selectShipImo);
  }

  return (
    <header className="com02-header">
      <div className="com02-header-title">
        <div className="com02-system-name">
          <img src="/images/systemName.svg" alt="SVG" />
        </div>
        <div className="com02-separator">
          <img src="/images/headerSeparator.svg" alt="SVG" />
        </div>
        <div id="com02-ship-name" onClick={openModal}>
          <img src="/images/ship.svg" alt="SVG" />
          <p id="com02-ship">{shipName}</p>
        </div>
      </div>
      <div className="com02-header-settings">
        <ComSetting />
      </div>

      <Modal isOpen={modal} className="com02-ship-modal" overlayClassName="com02-ship-modal-overlay"  appElement={document.getElementById('root') || undefined}>
        <CommonShipSelectModal
          closeModal={closeModal}
          shipImo={shipImo}
          shipName={shipName}
          setShip={setShip}
        />
      </Modal>

    </header>
  );
};

export default CommonHeader;
