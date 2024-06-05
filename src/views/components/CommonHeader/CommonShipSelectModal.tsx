import React, { useEffect, useRef } from "react";
import "./CommonShipSelectModal.css";
// import Radio from '@material-ui/core/Radio';
// import FormControlLabel from '@material-ui/core/FormControlLabel';

// 呼び出し元から持ち回るコンポーネント
export type ShipSelectProps = {
  closeModal: () => void;
  shipImo: string;
  shipName: string;
  setShip: (shipImo: string, shipName: string) => void;
};

// 船名型
export type ShipName = {
  imo: string;
  shipName: string;
}

export const CommonShipSelectModal: React.FC<ShipSelectProps> = props => {

  // 船名リスト
  const [shipNameList, setShipNameList] = React.useState<ShipName[]>([]);
  // 選択した船IMO、ラジオボタンのチェック判定にも使用
  const [selectShipImo, setSelectShipImo] = React.useState(props.shipImo);
  // 選択した船名
  const [selectShipName, setSelectShipName] = React.useState(props.shipName);


  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 船名リスト取得処理
      // TODO モーダル画面等では呼び出せないようにする必要がある？セッション情報のIMOが変わってしまうため
      getShipName();
    };

    return () => {
      ignore.current = true;
    };

    // eslint-disable-next-line
  }, []);

  // 船名リスト取得処理
  const getShipName = () => {
    // 船名の取得に必要な情報を
    // 共通エリアから取得

    // とりあえずベタ
    setShipNameList([
      {imo: "imo01", shipName: "すざく"},
      {imo: "imo02", shipName: "松栄丸"},
      {imo: "imo03", shipName: "うずしお丸"},
      {imo: "imo04", shipName: "こはく"},
      {imo: "imo05", shipName: "ビーマック丸"},
      {imo: "imo06", shipName: "全角３０文字７８９０１２３４５６７８９０１２３４５６７８９０"}
    ])
  }

  // 船名設定処理
  const setShipName = () => {
    // 呼び出し元の船名設定処理
    props.setShip(selectShipImo, selectShipName);
  }

  return (
    <div className="com02-ship-modal-area">
      <div className="com02-ship-modal-header">
        <p>船選択</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="com02-ship-modal-contents">
        <div>
        {shipNameList.map((ship) => {
          return(
            <div key={ship.imo}>
              {/* <FormControlLabel
                value={ship.imo}
                control={ship.imo === selectShipImo ? <Radio style={{color: "#E66300"}} /> : <Radio style={{color: "white"}} />}
                label={ship.shipName}
                labelPlacement="end"
                name="shipName"
                checked={ship.imo === selectShipImo}
                onChange={() => {setSelectShipImo(ship.imo); setSelectShipName(ship.shipName);}}
              /> */}
            </div>
          )
        })}
        </div>
      </div>
      <div className="com02-ship-modal-button">
        <button className="com02-ship-close-button" onClick={props.closeModal}>キャンセル</button>
        <button className="com02-ship-ok-button" onClick={setShipName}>OK</button>
      </div>
    </div>
  );
};

export default CommonShipSelectModal;
