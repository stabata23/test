import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./VoyagePlan.css";
import { VoyagePlanModal } from "./VoyagePlanModal"
import ComEdit from "../../components/CommonIcon/CommonEdit";
import ComSeaRouteTop from "../../components/CommonIcon/CommonSeaRouteTop";
import ComSeaRouteBottom from "../../components/CommonIcon/CommonSeaRouteBottom";
import dayjs from "dayjs";
import { setMenu } from "../../components/CommonMenu/CommonMenu";
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { Loading } from "../../components/CommonLoading/CommonLoading";
import { closestIndexTo, compareAsc } from 'date-fns';

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 航海計画型
export type TypeVoyagePlan = {
  key: string;
  startPoint: string;
  startDate: string;
  startHour: string;
  startMinutes: string;
  goalPoint: string;
  goalDate: string;
  goalHour: string;
  goalMinutes: string;
  sailingTime: string;
  berthingTime: string;
  componentErrorFlg: boolean;
}

// 親コンポーネントから持ち回る値
export type Props = {
  imo: string;
};

// 航海計画画面
export const VoyagePlan: React.FC<Props> = props => {

  // 航海計画型のリスト
  const [voyagePlanList, setVoyagePlanList] = React.useState<TypeVoyagePlan[]>([]);
  // 航海計画型のリスト(Props用)
  const [voyagePlanListProps, setVoyagePlanListProps] = React.useState<TypeVoyagePlan[]>([]);

  // モーダルで表示する日付、YYYY/MM/DD形式
  const [createDate] = useState(dayjs().format('YYYY/MM/DD'));

  // モーダル表示制御
  const [modal, setModal] = useState(false);
  // モーダルクラス制御
  const [modalClass, setModalClass] = useState("page05-voyage-plan-modal");
  // モーダルオーバーレイクラス制御
  const [modalOverlayClass, setModalOverlayClass] = useState("page05-voyage-plan-modal-overlay");

  // スクロールref
  const scrollRef = useRef<HTMLDivElement>(null);

  // props用最近航海計画番号
  const [propClosePlanNum, setPropClosePlanNum] = useState(0);
  // props用停泊時間フラグ
  const [propIsBerthingTime, setPropIsBerthingTime] = useState(false);

  // セッションカスタムhook
  const { getImo } = useSessionData();

  // ローディング判定
  const isLoading = useRef(false);

  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 航海計画の取得
      getVoyagePlanList();
      // メニューのセット
      setMenu("1");
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);

  // imo変更検知
  useEffect(() => {
    // 航海計画の取得
    getVoyagePlanList();
  }, [props.imo]);

  // 画面表示項目の取得
  const getVoyagePlanList = async() => {
    // 共通エリアからimo等取得

    // 一覧データを取得
    isLoading.current = true;
    const dispData: TypeVoyagePlan[] = [];
    // const res = await client.graphql({
    //   query: listVoyagePlans,
    //   variables: {
    //     imo: getImo(),
    //     sortDirection:ModelSortDirection.ASC
    //   }
    // }).finally(() => {
    //   isLoading.current = false;
    // });
    const res = await client.models.VoyagePlan.list(
      {
        imo:getImo(),
        sortDirection:"ASC"
      }
      ).finally(() => {
      isLoading.current = false;
    });
    if ("data" in res ) {
      for (let i=0;i < res.data.length; i++) {
        const item = res.data[i];
        dispData.push({
          key: i + dayjs().format('YYYYMMDDHHmmssSSS'),
          startPoint: item.startPoint,
          startDate: item.startDate,
          startHour: item.startHour,
          startMinutes: item.startMinutes,
          goalPoint: item.goalPoint,
          goalDate: item.goalDate,
          goalHour: item.goalHour,
          goalMinutes: item.goalMinutes,
          sailingTime: item.sailingTime,
          berthingTime: getBerthingTime(res.data , i , getDateTime(item.goalDate,item.goalHour,item.goalMinutes)),
          componentErrorFlg: false
        })
      }
    }

    // 一覧データのクリア
    setVoyagePlanList([]);
    setVoyagePlanListProps([]);

    // 取得したデータを画面項目に設定
    setVoyagePlanList(dispData);
    setVoyagePlanListProps(dispData);
  }

  // スクロール位置のセット
  let onSetFlg = false;
  const setScroll = () => {
    if (onSetFlg === false) {
      onSetFlg = true;
    } else {
      return;
    }

    // 現在時刻を取得
    const nowDate = new Date();

    // 航海計画リストから出港時間を抽出
    const startDateArray: Date[] = [];

    voyagePlanList.filter(data => [
      startDateArray.push(new Date(
        Number(data.startDate.substring(0, 4))
        , Number(data.startDate.substring(5, 7)) -1
        , Number(data.startDate.substring(8, 10))
        , Number(data.startHour)
        , Number(data.startMinutes)
      ))
    ]);

    // 現在時刻に一番近い航海計画のindexを取得
    let closePlanNum = closestIndexTo(nowDate, startDateArray);

    // スクロール位置セットのための判定処理
    if (scrollRef.current !== null
      && closePlanNum !== undefined) {
      // 一番近い航海計画の出港時間を取得
      const closePlan = voyagePlanList[closePlanNum];
      const closeStartDate = new Date(
        Number(closePlan.startDate.substring(0, 4))
        , Number(closePlan.startDate.substring(5, 7)) -1
        , Number(closePlan.startDate.substring(8, 10))
        , Number(closePlan.startHour)
        , Number(closePlan.startMinutes)
      );

      // 停泊時間フラグ
      let isBerthingTime = false;
      // 一番近い航海計画の出港時間が現在時間より未来の場合、以下判定処理
      if (compareAsc(closeStartDate, nowDate) === 1) {
        
        // 対象航海計画のindexが0ではない
        if (closePlanNum !== 0) {

          // 1つ前の航海計画入港時間を取得
          const prePlan = voyagePlanList[closePlanNum - 1];
          const preGoalDate = new Date(
            Number(prePlan.goalDate.substring(0, 4))
            , Number(prePlan.goalDate.substring(5, 7)) -1
            , Number(prePlan.goalDate.substring(8, 10))
            , Number(prePlan.goalHour)
            , Number(prePlan.goalMinutes)
          );

          // 現在時刻が1つ前の航海計画入港時間より後
          if (compareAsc(nowDate, preGoalDate) === 1) {
            // 停泊時間フラグオン
            isBerthingTime = true;
          }
          // 一番近い航海計画の出港時間が現在時間より未来のため、
          // 1つ前の航海計画をスクロール位置の対象とする
          closePlanNum = closePlanNum - 1;
        }
        
      } else {
        // 一番近い航海計画の出港時間が現在時間より過去の場合、以下判定処理

        // 一番近い航海計画の入港時間を取得
        const closeGoalDate = new Date(
          Number(closePlan.goalDate.substring(0, 4))
          , Number(closePlan.goalDate.substring(5, 7)) -1
          , Number(closePlan.goalDate.substring(8, 10))
          , Number(closePlan.goalHour)
          , Number(closePlan.goalMinutes)
        );

        // 対象航海計画のindexが最後のindexではない
        if (closePlanNum + 1 !== startDateArray.length) {

          // 現在時刻が一番近い航海計画の入港時間より後
          if (compareAsc(nowDate, closeGoalDate) === 1) {
            // 停泊時間フラグオン
            isBerthingTime = true;
          }
        }
      }

      // スクロール位置のセット
      if (isBerthingTime) {
        scrollRef.current.scrollTop = (240 * closePlanNum) + 170;
      } else {
        scrollRef.current.scrollTop = 240 * closePlanNum;
      }

      // 対象航海計画にClassをセット
      if (isBerthingTime) {
        const targetPlanCssTop = document.getElementsByClassName("page05-voyage-plan-grid")[closePlanNum];
        targetPlanCssTop.classList.add("page05-target-voyage-plan-top");
        const targetPlanCssBottom = document.getElementsByClassName("page05-voyage-plan-grid")[closePlanNum + 1];
        targetPlanCssBottom.classList.add("page05-target-voyage-plan-bottom");
      } else {
        const targetPlanCss = document.getElementsByClassName("page05-voyage-plan-grid")[closePlanNum];
        targetPlanCss.classList.add("page05-target-voyage-plan");
      }
      // props用値セット
      setPropClosePlanNum(closePlanNum);
      setPropIsBerthingTime(isBerthingTime);
    }
  }

  // 航海計画モーダル表示
  const openModal = () => {
    setModal(true);
  };
  
  // 航海計画モーダル非表示
  const closeModal = () => {
    setModal(false);
  };

  // 報告書モーダルから渡ってきた報告書型オブジェクトを登録する
  const regist = async(updateVoyagePlanList: TypeVoyagePlan[]) => {
    setVoyagePlanList([]);
    setVoyagePlanListProps([]);
    let refreshList:TypeVoyagePlan[] = [];
    // 登録処理
    try {
      console.log(updateVoyagePlanList);
      for (let i = 0; i < updateVoyagePlanList.length; i++) {
        let item = updateVoyagePlanList[i];
        // 出発時間
        const startDateTime = getDateTime(item.startDate,item.startHour,item.startMinutes);
        // 到着時間
        const goalDateTime = getDateTime(item.goalDate,item.goalHour,item.goalMinutes);
        // await client.graphql({
        //   query: getVoyagePlan,
        //   variables: {
        //     imo: getImo(),
        //     goalDateTime: String(goalDateTime)
        //   }
        await client.models.VoyagePlan.get({
          imo: getImo(),
          goalDateTime: String(goalDateTime)
        }).then(apiData => {
          if ("data" in apiData && apiData.data) {
            if (item.startHour !== "") {
            // if (item.voyagePlanTitle) {
              // 航行時間
              item.sailingTime = String(goalDateTime.diff(startDateTime,'hour'));
              // 停泊時間
              item.berthingTime = getBerthingTime(updateVoyagePlanList , i , goalDateTime);
              // レコードが存在かつ入力ありの場合Update
              const data = {
                imo: getImo(),
                goalDateTime: String(goalDateTime),
                startPoint: item.startPoint,
                startDate: item.startDate,
                startHour: item.startHour,
                startMinutes: item.startMinutes,
                goalPoint: item.goalPoint,
                goalDate: item.goalDate,
                goalHour: item.goalHour,
                goalMinutes: item.goalMinutes,
                sailingTime: item.sailingTime,
              };
              client.models.VoyagePlan.update(data);
              // client.graphql({query: updateVoyagePlan,
              //   variables: {
              //   input: data
              //   }
              // });
              refreshList.push(item);
            } else {
              //レコードが存在かつ入力なしの場合delete
              const data = {
                imo: getImo(),
                goalDateTime: String(goalDateTime)
              };
              client.models.VoyagePlan.delete(data);
              // client.graphql({query: deleteVoyagePlan,
              //   variables: {
              //   input: data
              //   }
              // });
            }
          } else if (item.startHour !== "") {
          // } else if (item.voyagePlanTitle) {
            // 航行時間
            item.sailingTime = String(goalDateTime.diff(startDateTime,'hour'));
            // 停泊時間
            item.berthingTime = getBerthingTime(updateVoyagePlanList , i , goalDateTime);
            // レコードが存在しないかつ入力ありCreate
            const data = {
              imo: getImo(),
              goalDateTime: String(goalDateTime),
              startPoint: item.startPoint,
              startDate: item.startDate,
              startHour: item.startHour,
              startMinutes: item.startMinutes,
              goalPoint: item.goalPoint,
              goalDate: item.goalDate,
              goalHour: item.goalHour,
              goalMinutes: item.goalMinutes,
              sailingTime: item.sailingTime ,
            };
            client.models.VoyagePlan.create(data);
            // client.graphql({query: createVoyagePlan,
            //   variables: {
            //     input: data
            //   }
            // });
            refreshList.push(item);
          }
        });
      }
      setVoyagePlanListProps(refreshList);
      setVoyagePlanList(refreshList);
      // 報告書モーダルを閉じる
      closeModal();
    } catch (error) {
      console.error(error);
      return;
   }
  }

  // 時間型作成
  const getDateTime = (startDate:string, startHour:string, startMinutes:string,) => {
    return dayjs(startDate).hour(Number(startHour)).minute(Number(startMinutes));
  };

  // 停泊時間取得
  const getBerthingTime = (list:any[],i:number,goalDateTime:dayjs.Dayjs) => {
    // 次の航行予定が入っている場合に停泊時間を取得
    if (list[i + 1] && list[i + 1].startHour) {
      const nextStartDateTime = getDateTime(list[i + 1].startDate,list[i + 1].startHour,list[i + 1].startMinutes);
      return String(nextStartDateTime.diff(goalDateTime,'hour'));
    }
    return "";
  }

  return (
    <div className="page05-contents" onLoad={() => setScroll()}>
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page05-page-title">航海計画</p>

      <div className="page05-voyage-plan-area" ref={scrollRef}>
        {voyagePlanList.length > 0 ? (
          <div>
            {voyagePlanList.map((voyagePlan) => {
              return (
                <div key={voyagePlan.key} className="page05-voyage-plan-grid">
                  <div className="page05-sailing-time-area">
                    <div className="page05-sea-route-grid">
                      <div>
                        <img src="/images/seaRoute.svg" alt="SVG"/>
                      </div>
                      <div>
                        <img src="/images/port.svg" alt="SVG"/>
                      </div>
                    </div>
                    <div className="page05-sailing-time-grid">
                      <div>
                        <div>
                          <ComSeaRouteTop 
                            opacity=""
                          />
                        </div>
                      </div>
                      <div>
                        <div>
                          {voyagePlan.sailingTime}時間
                        </div>
                      </div>
                      <div>
                        <div>
                          <ComSeaRouteBottom
                            opacity=""
                          />
                        </div>
                      </div>
                      <div>
                        <div>
                          {voyagePlan.berthingTime}時間
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="page05-location-area">
                    <div className="page05-voyage-plan-title-area">
                      {/* <p className="page05-voyage-plan-title"> */}
                        {/* {voyagePlan.voyagePlanTitle} */}
                      {/* </p> */}
                    </div>
                    <div>
                      <div>
                        <img src="/images/startPoint.svg" alt="SVG"/>
                      </div>
                      <div>
                        <span>{voyagePlan.startPoint}</span>
                        <span>
                          <div>{voyagePlan.startPoint}</div>
                        </span>
                      </div>
                      <div>
                        <div>
                          {voyagePlan.startDate}
                        </div>
                        <div>
                          {voyagePlan.startHour}:
                          {voyagePlan.startMinutes}
                        </div>
                        <div>
                          発
                        </div>
                      </div>
                    </div>
                    <div>
                      <div>
                        <img src="/images/goalPoint.svg" alt="SVG"/>
                      </div>
                      <div>
                        <span>{voyagePlan.goalPoint}</span>
                        <span>
                          <div>{voyagePlan.goalPoint}</div>
                        </span>
                      </div>
                      <div>
                        <div>
                          {voyagePlan.goalDate}
                        </div>
                        <div>
                          {voyagePlan.goalHour}:
                          {voyagePlan.goalMinutes}
                        </div>
                        <div>
                          着
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // <div className="page05-voyage-plan-title-area">
          //   <p className="page05-voyage-plan-title">
          //     航海計画 ➀
          //   </p>
          // </div>
          <></>
        )}
      </div>

      <div className="page05-button-area">
        <button onClick={openModal}>
          <div>
            <ComEdit/>
          </div>
          <div>
            計画編集
          </div>
        </button>
      </div>

      <Modal isOpen={modal} className={modalClass} overlayClassName={modalOverlayClass} appElement={document.getElementById('root') || undefined}>
        <VoyagePlanModal
          closeModal={closeModal}
          regist={regist}
          voyagePlanListProp={voyagePlanListProps}
          closePlanNum={propClosePlanNum}
          isBerthingTime={propIsBerthingTime}
        />
      </Modal>
    </div>
  );
};

export default VoyagePlan;
