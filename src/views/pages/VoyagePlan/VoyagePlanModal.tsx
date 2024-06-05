import React, { useEffect, useRef, useState } from "react";
import "./VoyagePlanModal.css";
import VoyagePlanComponent from "./VoyagePlanComponent"
import { TypeVoyagePlan } from "../VoyagePlan/VoyagePlan";
import dayjs from "dayjs";
import Modal from "react-modal";
import {DeleteModal} from "./DeleteModal"

// 親コンポーネントから持ち回る値
export type Props = {
  closeModal: () => void;
  regist: (VoyagePlanList: TypeVoyagePlan[]) => void;
  voyagePlanListProp: TypeVoyagePlan[];
  closePlanNum: number;
  isBerthingTime: boolean;
};

// 航海計画画面-航海計画モーダル
export const VoyagePlanModal: React.FC<Props> = props => {

  // 航海計画リスト
  const [voyagePlanListModal, setVoyagePlanListModal] = React.useState<TypeVoyagePlan[]>([]);

  // エラー判定フラグ
  const [errorFlg, setErrorFlg = (flgValue: boolean) => {return flgValue}] = React.useState<boolean>(false);

  // スクロールref
  const scrollRef = useRef<HTMLDivElement>(null);

  // スクロールセット判定
  const onSetFlg = useRef<boolean>(false);

  // 削除モーダル表示制御
  const [deleteModal, setDeleteModal] = useState(false);
  // 削除モーダル用判定値
  const [isDelete, setIsDelete] = useState(false);

  // 航海計画タイトルリスト
  // const voyagePlanTitleList = [
  //   "航海計画 ➀"
  //   , "航海計画 ➁"
  //   , "航海計画 ➂"
  //   , "航海計画 ➃"
  //   , "航海計画 ➄"
  //   , "航海計画 ➅"
  //   , "航海計画 ➆"
  //   , "航海計画 ➇"
  //   , "航海計画 ➈"
  //   , "航海計画 ➉"
  // ]
     
  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 航海計画の取得
      getVoyagePlan();
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);

  // 報告書項目の取得
  const getVoyagePlan = () => {
    // 航海計画リストの複製
    let copyVoyagePlanList = [];

    if (props.voyagePlanListProp !== undefined
      && props.voyagePlanListProp !== null
      && props.voyagePlanListProp.length > 0) {
        for (let i in props.voyagePlanListProp) {
          const pushData: TypeVoyagePlan = (
            {
              key: props.voyagePlanListProp[i].key
              , startPoint: props.voyagePlanListProp[i].startPoint
              , startDate: props.voyagePlanListProp[i].startDate
              , startHour: props.voyagePlanListProp[i].startHour
              , startMinutes: props.voyagePlanListProp[i].startMinutes
              , goalPoint: props.voyagePlanListProp[i].goalPoint
              , goalDate: props.voyagePlanListProp[i].goalDate
              , goalHour: props.voyagePlanListProp[i].goalHour
              , goalMinutes: props.voyagePlanListProp[i].goalMinutes
              , sailingTime: props.voyagePlanListProp[i].sailingTime
              , berthingTime: props.voyagePlanListProp[i].berthingTime
              , componentErrorFlg: false
            }
          )
          // データをリストに追加
          copyVoyagePlanList.push(pushData);
        }
    }

    if (props.voyagePlanListProp.length === 0) {

      // 航海計画なしの場合は空データ1件追加
      const pushData: TypeVoyagePlan = (
        {
          key: 0 + dayjs().format('YYYYMMDDHHmmssSSS')
          , startPoint: ""
          , startDate: ""
          , startHour: ""
          , startMinutes: ""
          , goalPoint: ""
          , goalDate: ""
          , goalHour: ""
          , goalMinutes: ""
          , sailingTime: ""
          , berthingTime: ""
          , componentErrorFlg: false
        }
      )

      // 空データを追加
      copyVoyagePlanList.push(pushData);
    }

    // リストをセット
    setVoyagePlanListModal([]);
    setVoyagePlanListModal(copyVoyagePlanList);
  }

  // スクロール位置のセット
  const setScroll = () => {
    if (onSetFlg.current === false) {
      onSetFlg.current = true;
    } else {
      return;
    }

    // スクロール位置セットのための判定処理
    if (scrollRef.current !== null) {
      // スクロール位置のセット
      if (props.isBerthingTime) {
        scrollRef.current.scrollTop = (props.closePlanNum + 1) * 245;
      } else {
        scrollRef.current.scrollTop = props.closePlanNum * 245;
      }
    }
  }

  // 更新処理
  const registVoyagePlan = () => {

    // console.log(voyagePlanList)
    // berthingTimeやらの計算

    if (voyagePlanListModal !== undefined) {
      console.log(voyagePlanListModal)
      props.regist(voyagePlanListModal);
    }
  }

  // 全componentについてエラーフラグのチェック
  const checkAllComponentErrorFlg = () => {
    let error = false;
    for (let voyagePlan of voyagePlanListModal) {
      if (voyagePlan.componentErrorFlg === true) {
        error = true;
      }
    }
    setErrorFlg(error);
  }

  // 航海計画リストの指定位置に空航海計画を追加
  const addVoyagePlan = (idx: number) => {

    // 航海計画リストの複製
    let copyVoyagePlanListModal = voyagePlanListModal.concat();
    let pushDataList: TypeVoyagePlan[] = [];

    // 現在の航海計画リストを削除
    setVoyagePlanListModal([]);

    // 追加分の空データを作成
    const pushData: TypeVoyagePlan = (
      {
        key: idx + dayjs().format('YYYYMMDDHHmmssSSS')
        , startPoint: ""
        , startDate: ""
        , startHour: ""
        , startMinutes: ""
        , goalPoint: ""
        , goalDate: ""
        , goalHour: ""
        , goalMinutes: ""
        , sailingTime: ""
        , berthingTime: ""
        , componentErrorFlg: false
      }
    )

    // 空データ追加フラグ
    let addFlg = 0;

    // 航海計画リスト再作成処理
    for (let i = 0; i < copyVoyagePlanListModal.length; i++) {
      if (i === idx && addFlg === 0) {
        // 空データ追加
        pushDataList.push(pushData);
        addFlg = 1;
        i--;
        
      } else {
        // コピーしたデータを追加
        const copyData: TypeVoyagePlan = (
          {
            key: (i + addFlg) + dayjs().format('YYYYMMDDHHmmssSSS')
            , startPoint: copyVoyagePlanListModal[i].startPoint
            , startDate: copyVoyagePlanListModal[i].startDate
            , startHour: copyVoyagePlanListModal[i].startHour
            , startMinutes: copyVoyagePlanListModal[i].startMinutes
            , goalPoint: copyVoyagePlanListModal[i].goalPoint
            , goalDate: copyVoyagePlanListModal[i].goalDate
            , goalHour: copyVoyagePlanListModal[i].goalHour
            , goalMinutes: copyVoyagePlanListModal[i].goalMinutes
            , sailingTime: copyVoyagePlanListModal[i].sailingTime
            , berthingTime: copyVoyagePlanListModal[i].berthingTime
            , componentErrorFlg: copyVoyagePlanListModal[i].componentErrorFlg
          }
        )
        pushDataList.push(copyData);
      }
    }
    // 一番後ろに追加する場合
    if (idx === copyVoyagePlanListModal.length) {
      pushDataList.push(pushData);
    }

    // 作成した航海計画リストを追加
    setVoyagePlanListModal(pushDataList);
  }

  // 指定した航海計画を削除
  const deleteVoyagePlan = (idx: number) => {

    // 航海計画リストの複製
    let copyVoyagePlanListModal = voyagePlanListModal.concat();
    let pushDataList: TypeVoyagePlan[] = [];

    // 現在の航海計画リストを削除
    setVoyagePlanListModal([]);

    // 航海計画削除フラグ
    let deleteFlg = 0;

    // 航海計画リスト再作成処理
    for (let i = 0; i < copyVoyagePlanListModal.length; i++) {
      if (i === idx && deleteFlg === 0) {
        // データ追加なし
        deleteFlg = 1;
        
      } else {
        // コピーしたデータを追加
        const copyData: TypeVoyagePlan = (
          {
            key: (i - deleteFlg) + dayjs().format('YYYYMMDDHHmmssSSS')
            , startPoint: copyVoyagePlanListModal[i].startPoint
            , startDate: copyVoyagePlanListModal[i].startDate
            , startHour: copyVoyagePlanListModal[i].startHour
            , startMinutes: copyVoyagePlanListModal[i].startMinutes
            , goalPoint: copyVoyagePlanListModal[i].goalPoint
            , goalDate: copyVoyagePlanListModal[i].goalDate
            , goalHour: copyVoyagePlanListModal[i].goalHour
            , goalMinutes: copyVoyagePlanListModal[i].goalMinutes
            , sailingTime: copyVoyagePlanListModal[i].sailingTime
            , berthingTime: copyVoyagePlanListModal[i].berthingTime
            , componentErrorFlg: copyVoyagePlanListModal[i].componentErrorFlg
          }
        )
        pushDataList.push(copyData);
      }
    }

    // 0件になってしまう場合は空データ追加
    if (pushDataList.length === 0) {
      // 空データを作成
      const pushData: TypeVoyagePlan = (
        {
          key: idx + dayjs().format('YYYYMMDDHHmmssSSS')
          , startPoint: ""
          , startDate: ""
          , startHour: ""
          , startMinutes: ""
          , goalPoint: ""
          , goalDate: ""
          , goalHour: ""
          , goalMinutes: ""
          , sailingTime: ""
          , berthingTime: ""
          , componentErrorFlg: false
        }
      )
      pushDataList.push(pushData);
    }

    // 作成した航海計画リストを設定
    setVoyagePlanListModal(pushDataList);
  }

  // 削除モーダル表示
  const openDeleteModal = () => {
    setDeleteModal(true);
  };
  
  // 削除モーダル非表示
  const closeDeleteModal = () => {
    setIsDelete(false);
    setDeleteModal(false);
  };

  // 航海計画削除
  const deletePlan = () => {
    setIsDelete(true);
    setDeleteModal(false);
  };

  return (
    <div className="page05-voyage-plan-modal-area" onLoad={() => setScroll()}>
      <div className="page05-modal-header">
        <p>航海計画編集</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="page05-modal-contents" ref={scrollRef}>
        {/* {voyagePlanListModal.map((voyagePlanModal) => { */}
        {voyagePlanListModal.map((voyagePlanModal) => {
          return (
            <VoyagePlanComponent
              key={voyagePlanModal.key}
              keyVal={voyagePlanModal.key}
              startPoint={voyagePlanModal.startPoint}
              startDate={voyagePlanModal.startDate}
              startHour={voyagePlanModal.startHour}
              startMinutes={voyagePlanModal.startMinutes}
              goalPoint={voyagePlanModal.goalPoint}
              goalDate={voyagePlanModal.goalDate}
              goalHour={voyagePlanModal.goalHour}
              goalMinutes={voyagePlanModal.goalMinutes}
              componentErrorFlg={voyagePlanModal.componentErrorFlg}
              setStartPoint={(updateValue: string) => voyagePlanModal.startPoint = updateValue}
              setStartDate={(updateValue: string) => voyagePlanModal.startDate = updateValue}
              setStartHour={(updateValue: string) => voyagePlanModal.startHour = updateValue}
              setStartMinutes={(updateValue: string) => voyagePlanModal.startMinutes = updateValue}
              setGoalPoint={(updateValue: string) => voyagePlanModal.goalPoint = updateValue}
              setGoalDate={(updateValue: string) => voyagePlanModal.goalDate = updateValue}
              setGoalHour={(updateValue: string) => voyagePlanModal.goalHour = updateValue}
              setGoalMinutes={(updateValue: string) => voyagePlanModal.goalMinutes = updateValue}
              // setComponentErrorFlg={(flgValue:boolean) => setErrorFlg(flgValue)}
              setComponentErrorFlg={(flgValue:boolean) => voyagePlanModal.componentErrorFlg = flgValue}
              checkAllComponentErrorFlg={() => checkAllComponentErrorFlg()}
              addVoyagePlan={(index: number) => addVoyagePlan(index)}
              deleteVoyagePlan={(index: number) => deleteVoyagePlan(index)}
              openDeleteModal={openDeleteModal}
              isDelete={isDelete}
              setIsDelete={setIsDelete}
            />
          );
        })}
        
      </div>
      <div className="page05-modal-button">
        <div className="page05-file-info">
        </div>
        <button className="page05-close-button" onClick={props.closeModal}>キャンセル</button>
        <button
          disabled={errorFlg}
          className="page05-ok-button"
          onClick={registVoyagePlan}
        >
          保存
        </button>
      </div>

      <Modal isOpen={deleteModal} className="page05-delete-modal" overlayClassName="page05-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeDeleteModal}
          delete={deletePlan}
          modalText="削除しますか？"
        />
      </Modal>
    </div>
  );
};

export default VoyagePlanModal;
