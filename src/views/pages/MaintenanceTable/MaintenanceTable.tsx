import React, { useState, useEffect, useRef } from "react";
import "./MaintenanceTable.css";
import dayjs from "dayjs";
import Modal from "react-modal";
import {PlanModal} from "./PlanModal"
import {DeleteModal} from "./DeleteModal"
import {MaintenanceReportModal, MaintenanceReport} from "./MaintenanceReportModal"
import {CommonCalendar} from "../../components/CommonCalendar/CommonCalender"
import { fetchAuthSession } from 'aws-amplify/auth';
import { setMenu } from "../../components/CommonMenu/CommonMenu";
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { Loading } from "../../components/CommonLoading/CommonLoading";
import comSortAsc from "../../components/CommonSort/CommonSortAsc";
import comSortDesc from "../../components/CommonSort/CommonSortDesc";
import ComSortIcon from "../../components/CommonSort/CommonSortIcon";
import { FileManagement } from "../../hooks/FileManagement";
import { Sequence } from "../../hooks/Sequence";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// プラン登録用
export type PlanInput = {
  maintenanceItem: string;
  date: string;
  status: string;
}

// 保守整備表画面
const MaintenanceTable: React.FC = () => {

  // 点検箇所型
  type MaintenancePoint = {
    key: string;
    value: string;
    alertFlg: boolean;
  }

  // 点検項目型
  type MaintenanceItem = {
    topItem: string; // 点検箇所
    maintenanceItem: string; // 点検項目
    item: string;
    preDay: string;
    interval: number;
    intervalUnit: string;
    dueDate: string;
    nextDay: string;
    nextPlanDateAlertFlg: boolean;
    incompleteAlertFlg: boolean;
    dayList: DayStatus[];
  }

  // 日付毎の計画プランのステータス
  type DayStatus = {
    date: string;
    status: string;
  }

  // ヘッダカレンダー型
  type HeaderCalendar = {
    day: string;
    yyyymmdd: string;
  }

  // 選択した機関・甲板部（初期表示では機関部）
  const [selectedMaintenancePosition, setSelectedMaintenancePosition] = useState("01");
  
  // 選択した点検箇所（初期表示では機関部の一番上に表示されているもの）
  const [selectedMaintenancePoint, setSelectedMaintenancePoint] = useState("point00001");
  
  // 表示開始日YYYY/DD/MM形式（初期表示では現在日付）
  const [displayStartDate, setDisplayStartDate] = useState(dayjs().format('YYYY/MM/DD'));
  // 本日日付
  const nowDate = dayjs().format('YYYY/MM/DD');

  // 保守整備表モーダルで使用する実施日YYYY/DD/MM形式（初期表示では現在日付）
  const [implementationDate, setImplementationDate] = useState(dayjs().format('YYYY/MM/DD'));

  // 点検箇所型の空配列
  const [maintenancePointList, setMaintenancePointList] = useState<MaintenancePoint[]>([]);
  
  // 点検項目型の空配列
  const [maintenanceItemList, setMaintenanceItemList] = useState<MaintenanceItem[]>([]);
  
  // 保守整備点検表のヘッダカレンダー
  const [headerCalendar, setHeaderCalendar] = useState<HeaderCalendar[]>([]);

  // 整備計画モーダル表示制御
  const [planModal, setPlanModal] = useState(false);
  
  // 整備計画モーダルクラス
  const planModalClass = "page01-plan-modal";
  const planModalOverlayClass = "page01-plan-modal-overlay";

  // 保守整備表モーダル表示制御
  const [maintenanceReportModal, setMaintenanceReportModal] = useState(false);
  
  // 保守整備表モーダルクラスセット用useState
  const [maintenanceReportModalClass, setMaintenanceReportModalClass] = useState("page01-maintenance-report-modal");
  const [maintenanceReportModalOverlayClass, setMaintenanceReportModalOverlayClass] = useState("page01-maintenance-report-modal-overlay");

  // 計画削除モーダル表示制御
  const [deleteModal, setDeleteModal] = useState(false);
  
  // 計画削除モーダルクラス
  const deleteModalClass = "page01-delete-modal";
  const deleteModalOverlayClass = "page01-delete-modal-overlay";

  // カレンダーモーダル表示制御
  const [calendar, setCalendar] = useState(false);
  // カレンダーモーダル表示制御（保守整備点検表から開く場合）
  const [calendarForRepotModal, setCalendarForRepotModal] = useState(false);

  // ファイル削除モーダル表示制御
  const [fileDeleteModal, setFileDeleteModal] = useState(false);
  // ファイル削除モーダル用判定値
  const [isFileDelete, setIsFileDelete] = useState(false);

  // ファイル重複モーダル表示制御
  const [fileDuplicateModal, setFileDuplicateModal] = useState(false);
  // ファイル重複モーダル用判定値
  const [isDuplicateFile, setIsDuplicateFile] = useState(false);
  // ファイル重複モーダル用判定値（重複削除）
  const [isDuplicateFileDelete, setIsDuplicateFileDelete] = useState(false);

  // 計画登録・更新に使用するキー（TODO IMO+●●？）
  const [key, setKey] = useState("");

  // 整備計画サブメニュー（整備記録作成・削除）を表示するための制御値
  const [dispSubmenuKey, setDispSubmenuKey] = useState("");
  // 整備計画サブメニュー表示位置
  const [top, setTop] = useState("");
  const [left, setLeft] = useState("");

  // 前回ソート項目
  const [preSortColumn, setPreSortColumn] = useState("");
  // 前回ソート種別
  const [preSortKind, setPreSortKind] = useState("");

  // 2重初期処理防止
  const ignore = useRef(false);

  // カレンダーに表示するステータスのフォーマット
  const [dayStatus, setDayStatus] = useState<DayStatus[]>([]);
  let displayDayStatus: any[] = [];
  
  // 計画登録・更新用
  const [planInput, setPlanInput] = useState<PlanInput>();
  const [payload, setPayload] = useState<any>();
  const [identityId, setIdentityId] = useState<any>();
  // ファイルタイプ
  const FILE_TYPE = "01" //保守整備表

  // セッションカスタムhook
  const { getImo } = useSessionData();
  const { uploadFile } = FileManagement();
  const { updateNextSequence } = Sequence();

  // ローディング判定
  const isLoading = useRef(false);

  // 初期処理
  useEffect(() => {
    
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      getSession();
      // 画面表示項目の作成
      createDisplay(displayStartDate);
      // メニューのセット
      setMenu("2");
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, [displayStartDate]);

  // 画面表示項目の作成
  const createDisplay = (startDate: string) => {
    // 点検箇所リスト取得
    getPointList(selectedMaintenancePosition);

    // 保守整備計画表データ作成
    getMaintenanceItem(selectedMaintenancePoint, startDate);
          
    // 保守整備計画表カレンダー部作成
    createCalendarTableHeader(startDate);
  };

  // 点検箇所リストの設定を行い、点検箇所リストの先頭の最初の項目を返す
  const getPointList = async (maintenancePosition:string) => {
    // 各リストのクリア
    let pointList = [...maintenancePointList];
    pointList.splice(0);
    setMaintenancePointList(pointList);
    let itemList = [...maintenanceItemList];
    itemList.splice(0);
    setMaintenanceItemList(itemList);

    // 点検箇所リストの取得
    isLoading.current = true;
    // const apiData = await client.graphql({
    //   query: queryGetInitialDisplay,
    //   variables: {
    //     topItem: getImo()
    //   }
    // }).finally(() => {
    //   isLoading.current = false;
    // });
    
    const apiData = await client.queries.queryGetInitialDisplay(
      {
        topItem:getImo(),
      }
      );
    if ("data" in apiData && apiData.data) {
      for (const item of apiData.data) {
        let alertFlg = true;
        if (item!.incompleteAlertFlg==="0" && item!.nextPlanDateAlertFlg === "0") {
          alertFlg = false;
        }

        if (maintenancePosition === item!.maintenancePosition) {
          pointList.push({
            key: item!.bottomItem
            , value: item!.name
            ,  alertFlg:alertFlg
          })
        }
      }
      
      setMaintenancePointList(pointList);
      isLoading.current = false;
      // 初期表示・点検場所切り替え時用にリスト一番上の点検箇所をreturn
      return pointList[0].key;
    }
  };

  // 点検項目の取得
  const getMaintenanceItem = async(point: string, startDate?: string) => {

    // const itemdata = await client.graphql({
    //   query: listMaintenanceTables,
    //   variables: {
    //     topItem: getImo() + "#" + point
    //   }
    // });
    const itemdata = await client.models.MaintenanceTable.list({
        topItem: getImo() + "#" + point
      });
    if ("data" in itemdata && itemdata.data ) {
      let start = dayjs(displayStartDate).format("YYYY/MM/DD");
      if (startDate !== undefined) {
        start = startDate;
      }
      const end = dayjs(dayjs(start).add(1, 'M')).add(1, 'd').format("YYYY/MM/DD");
      // const plandata = await client.graphql({
      //   query: listMaintenanceInspectionDates,
      //   variables: {
      //     imoMaintenancePoint: getImo() + "#" + point,
      //     inspectionDateMaintenanceItem:{between: [{inspectionDate:start},{inspectionDate:end}]},
      //     sortDirection:ModelSortDirection.ASC
      //   }
      // });
      const plandata = await client.models.MaintenanceInspectionDate.list({
        imoMaintenancePoint: getImo() + "#" + point,
        inspectionDateMaintenanceItem:{between: [start, end]},
      });

      // リスト内容のクリア
      let itemList = [...maintenanceItemList];
      itemList.splice(0);
      
      for (const item of itemdata.data) {

        const planList = plandata.data.filter(planDateItem => planDateItem.maintenanceItem!.indexOf(item.bottomItem) !== -1);            
        
        // カレンダー表示用のステータスリスト
        let statusList = structuredClone(displayDayStatus);
        
        if (statusList.length === 0) {
          statusList = structuredClone(dayStatus);
        }
        
        for (const planItem of planList) {
          // 計画日が設定されているカレンダー日付のステータスを設定する
          const dateItemIdx = statusList.findIndex(item => item.date === planItem.inspectionDate);
          if (dateItemIdx > -1) {
            statusList[dateItemIdx].status = planItem.status!;
          }
        }

        let data: MaintenanceItem = {
          topItem: item.topItem,
          maintenanceItem: item.bottomItem,
          item: item.name!,
          preDay: item.lastPlanDate!,
          interval: item.interval!,
          intervalUnit: item.intervalUnit!,
          dueDate: item.dueDate!,
          nextDay: item.nextPlanDate!,
          dayList: statusList,
          nextPlanDateAlertFlg: item.nextPlanDateAlertFlg === "0" ? false : true,
          incompleteAlertFlg: item.incompleteAlertFlg === "0" ? false : true
        }
        itemList.push(data);
      }
      setMaintenanceItemList(itemList);
    }
  };

  // テーブルのカレンダー日付を作成する
  const createCalendarTableHeader = (startDate: string) => {
    // ヘッダカレンダーのクリア
    setHeaderCalendar([]);

    // 日付毎のステータスのクリア
    let dayStatusList = [...dayStatus];
    dayStatusList.splice(0);
    setDayStatus(dayStatusList);

    // ヘッダカレンダ型配列
    let headerCalendarArray: HeaderCalendar[] = [];
    let dayStatusArray: DayStatus[] = [];
    // 31日分回す
    for (let i = 0; i < 31; i++) {
      
      // ヘッダカレンダ型
      let headerCalendar: HeaderCalendar = {
        day: ""
        , yyyymmdd: ""
      };

      headerCalendar.day = dayjs(startDate).add(i, 'd').format("D");
      headerCalendar.yyyymmdd = dayjs(startDate).add(i, 'd').format("YYYY/MM/DD");
      
      // ヘッダカレンダ型配列にpush
      headerCalendarArray.push(headerCalendar);

      // 日付毎のステータスに初期値を設定
      let dayStatus: DayStatus = {
        date: headerCalendar.yyyymmdd ,
        status: "0" //仮
      };

      dayStatusArray.push(dayStatus);

      setDayStatus((datas) => {
        return [...datas, dayStatus];
      });
    }

    // ヘッダカレンダーに配列をセット
    setHeaderCalendar(headerCalendarArray);
    displayDayStatus = dayStatusArray;
  };

  // セッション情報取得
  const getSession = async () => {
    const {
      tokens,
      identityId,
    } = await fetchAuthSession();
    console.log(identityId);
    setPayload(tokens?.idToken?.payload);
    setIdentityId(identityId);
  };

  // スクロール-右下日付テーブルbody
  const scrollRightBody = useRef<HTMLDivElement>(null);
  // スクロール-右上日付テーブルheader
  const scrollRightHeader = useRef<HTMLDivElement>(null);
  // スクロール-左下サマリテーブルbody
  const scrollLeftBody = useRef<HTMLDivElement>(null);

  // スクロールの同期
  const handleScrollRight = () => {
    if (scrollRightBody.current != null
        && scrollRightHeader.current != null
        && scrollLeftBody.current != null) {
      scrollRightHeader.current.scrollLeft = scrollRightBody.current.scrollLeft;
      scrollLeftBody.current.scrollTop = scrollRightBody.current.scrollTop;
    }
  }
  // スクロールの同期
  const handleScrollLeft = () => {
    if (scrollRightBody.current != null
        && scrollLeftBody.current != null) {
      scrollRightBody.current.scrollTop = scrollLeftBody.current.scrollTop;
    }
  };

  // 点検場所（機関部・甲板部）押下
  const selectMaintenancePosition = async(selectPosition: string) => {
    // 選択した点検場所のセット
    setSelectedMaintenancePosition(selectPosition);

    await getPointList(selectPosition).then(res => {
      // 点検箇所のデフォ値をセット
      setSelectedMaintenancePoint(res!);
      // 保守整備点検表の作成
      getMaintenanceItem(res!);
    });
  };

  // 点検箇所押下
  const selectMaintenancePoint = (selectPoint: string) => {
    // 選択した点検箇所のセット
    setSelectedMaintenancePoint(selectPoint)
    getPointList(selectedMaintenancePosition);
    // 保守整備点検表の作成
    getMaintenanceItem(selectPoint);
  }

  // 計画モーダル表示前処理
  const displayPlanModal = (key: DayStatus, item:string ) => {
    // キー情報の作成
    let data:PlanInput = {
      maintenanceItem:item,
      date: key.date,
      status: key.status
    };
    
    // 計画登録用のキーセット
    setPlanInput(data);

    // 計画登録モーダルオープン
    openPlanModal();
  }

  // 整備計画登録
  const makePlan = async() => {
    // 登録処理
    const input = {
      imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
      inspectionDateMaintenanceItem: planInput!.date + "#" + planInput!.maintenanceItem,
      maintenancePoint: selectedMaintenancePoint,
      maintenanceItem:planInput!.maintenanceItem,
      inspectionDate: planInput!.date,
      imo: getImo(),
      status: "1", // ステータス：計画
      createUser: "createUser", // todo ログインユーザーを設定
      updateUser: "createUser", // todo ログインユーザーを設定
      version: 0
    }
    try {     
      await client.models.MaintenanceInspectionDate.create(input);
      // 次回計画日更新 
      return updateMaintenance("","").then(res => {
          // 計画登録モーダルクローズ
          closePlanModal();
          // 再取得処理
          getPointList(selectedMaintenancePosition);
          getMaintenanceItem(selectedMaintenancePoint);
      });
    } catch (error) {
      console.error(error);
      return;
    }
  }

  // 保守整備計画を削除する
  const deletePlan = async() => {
    // 削除処理
    try {
      // 削除対象データを削除テーブルに登録
      // const res = await client.graphql({
      //   query: getMaintenanceInspectionDate,
      //   variables: {
      //     imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
      //     inspectionDate: planInput!.date,
      //     maintenanceItem: planInput!.maintenanceItem
      //   }});
      const res = await client.models.MaintenanceInspectionDate.get({
        imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
        inspectionDateMaintenanceItem: planInput!.date + "#" + planInput!.maintenanceItem,
      });
      if ("data" in res && res.data ) {
        const input ={
          tableName: "MaintenanceInspectionDate",
          imo:getImo(),
          deleteData:JSON.stringify(res.data),
          id:"",
        };
        // await client.graphql({
        //   query: createDeleteData,
        //   variables: {
        //     input: input
        //   }
        // });
        await client.models.DeleteData.create(input);
      }

      // データ削除
      const input ={
        imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
        inspectionDateMaintenanceItem:planInput!.date + "#" + planInput!.maintenanceItem,
      };
      await client.models.MaintenanceInspectionDate.delete(input);
      // 次回計画日更新 
      return updateMaintenance("","").then(res => {
        // 計画登録モーダルクローズ
        closeDeleteModal();
        // 再取得処理
        getPointList(selectedMaintenancePosition);
        getMaintenanceItem(selectedMaintenancePoint);
      });
    } catch (error) {
       console.error(error);
       return;
    }
  } 

  // 一番早い計画日を取得する
  const getPlanDate = async() => {
    let planDate = "";

    // 計画を取得
    return await client.models.MaintenanceInspectionDate.listMaintenanceInspectionDateByMaintenanceItemAndStatus({
      maintenanceItem: planInput!.maintenanceItem,
      status:{eq: "1"},
    }).then(result => {
      if ("data" in result &&  result.data.length > 0) {
        // 計画日の昇順でソート
        const planList = result.data.sort((a, b) => a.inspectionDate > b.inspectionDate ? 1 : -1);          
        if (planList.length > 0) {
          planDate = planList[0].inspectionDate;
        }
      }
      return planDate;
    });  
  }
  
  // メンテナンステーブル更新
  const updateMaintenance = async(lastPlanDate:string,nextDueDate:string) => {
    try {
      console.log("selectedMaintenancePoint:"+selectedMaintenancePoint);
      // const result = await client.graphql({query: getMaintenanceTable,
      //   variables: {
      //     topItem: getImo() + "#" + selectedMaintenancePoint,
      //     bottomItem:planInput!.maintenanceItem
      // }});
      const result = await client.models.MaintenanceTable.get({
        topItem: getImo() + "#" + selectedMaintenancePoint,
        bottomItem:planInput!.maintenanceItem
      });
      if ("data" in result && result.data) {
        const dueDdate = nextDueDate? nextDueDate:result.data.dueDate!;
        const today = dayjs().format('YYYY/MM/DD');
        // 過去日付未実施チェック
        const incompleteAlertFlg = await pastUnfinishedCheck(dueDdate);
        // 計画日の一番早い日付を取得
        const planDate = await getPlanDate();
        let nextPlanDateAlertFlg = "0";
        if (!planDate) {
          // 計画日がなければエラー
          nextPlanDateAlertFlg = "1"
        } else if (planDate > dueDdate) {
          // 計画日がデューデートより後に日付ならエラー
          nextPlanDateAlertFlg = "1"
        } else if (planDate < today) {
          // 計画日が過去日付ならエラー
          nextPlanDateAlertFlg = "1"
        }
        // 前回実施日
        if (lastPlanDate) {
          if(result.data.lastPlanDate 
            && lastPlanDate < result.data.lastPlanDate) { 
            // 入力の前回実施日が登録されている前回実施日よりも前の場合は変更しない
            lastPlanDate = result.data.lastPlanDate;
          }
        }
        // デューデート
        if (nextDueDate) {
          if(result.data.dueDate 
            && nextDueDate < result.data.dueDate) { 
            // 入力のデューデートが登録されているデューデートよりも前の場合は変更しない
            nextDueDate = result.data.dueDate;
          }
        }
        //　更新処理
        const updateData = {
                topItem: result.data.topItem,
                bottomItem: result.data.bottomItem,
                lastPlanDate: lastPlanDate?lastPlanDate:result.data.lastPlanDate,
                dueDate: nextDueDate?nextDueDate:result.data.dueDate,
                nextPlanDate:planDate,
                incompleteAlertFlg: incompleteAlertFlg!,
                nextPlanDateAlertFlg: nextPlanDateAlertFlg,
                user: "user"//TODO ログインユーザーを設定する
        };
        await client.models.MaintenanceTable.update(updateData);
        // const res = await client.graphql({query: updateMaintenanceTable,
        //               variables: {
        //                 input: updateData
        //               }
        //             });
        // 該当箇所のエラーフラグを更新
        const point = await client.models.MaintenanceTable.get({
          topItem: getImo(),
          bottomItem:selectedMaintenancePoint
        });
        // const point = await client.graphql({query: getMaintenanceTable,
        //   variables: {
        //     topItem: getImo(),
        //     bottomItem:selectedMaintenancePoint
        //   }
        // });
        if ("data" in point && point.data) {
          const data = {
            topItem:point.data.topItem,
            bottomItem:point.data.bottomItem,
            incompleteAlertFlg: point.data.incompleteAlertFlg===incompleteAlertFlg!?
                  point.data.incompleteAlertFlg:incompleteAlertFlg!,
            nextPlanDateAlertFlg:point.data.nextPlanDateAlertFlg===nextPlanDateAlertFlg?
                  point.data.nextPlanDateAlertFlg:nextPlanDateAlertFlg,
            updateUser:point.data.updateUser,
          };
          await client.models.MaintenanceTable.update(data);
        }
      }

    } catch (error) {
      console.error(error);
      return;
    }
  }

  // 過去日付未実施チェック
  const pastUnfinishedCheck = async(dueDate:string) => {
    const start = dayjs(dueDate).format("YYYY/MM/DD"); //デューデート
    let returnVal = "0";
    await client.models.MaintenanceInspectionDate.listMaintenanceInspectionDateByMaintenanceItemAndStatus({
        maintenanceItem: planInput!.maintenanceItem,
        status:{between: ["2", "3"]},
    }).then(result => {
      if ("data" in result &&  result.data.length > 0 ) {
        returnVal = "1";
      } else {
        returnVal = "0";
      }
    });
    return(returnVal);
  }

  // 計画モーダル表示
  const openPlanModal = () => {
    setPlanModal(true);
  };
  
  // 計画モーダル非表示
  const closePlanModal = () => {
    setPlanModal(false);
  };

  // 保守整備表モーダル表示
  const openMaintenanceReportModal = (key: DayStatus, item:string) => {
    let data:PlanInput = {
      maintenanceItem:item,
      date: key.date,
      status: key.status
    };
    setImplementationDate(dayjs(key.date).format('YYYY/MM/DD'));
    // キー値セット
    setPlanInput(data);

    // 保守整備表モーダルオープン
    setMaintenanceReportModal(true);
  };
  
  // 保守整備表モーダル非表示
  const closeMaintenanceReportModal = () => {
    setMaintenanceReportModal(false);
    setImplementationDate(dayjs().format('YYYY/MM/DD'));
  };

  // 削除モーダル表示
  const openDeleteModal = (key: DayStatus, item:string ) => {
    let data:PlanInput = {
      maintenanceItem:item,
      date: key.date,
      status: key.status
    };

    // 計画削除用のキー値セット
    setPlanInput(data);
    // 削除モーダルオープン
    setDeleteModal(true);
  }
  
  // 削除モーダル非表示
  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  // ファイル重複モーダル表示
  const openFileDuplicateModal = () => {
    setFileDuplicateModal(true);
  };
  
  // ファイル重複モーダル非表示
  const closeFileDuplicateModal = () => {
    setIsDuplicateFile(true);
    setIsDuplicateFileDelete(false);
    setFileDuplicateModal(false);
  };

  // 整備計画サブメニュー表示
  const dispSubmenu = (key: string, e: React.MouseEvent<HTMLElement>) => {      
    window.addEventListener("click", () => setHiddenSubmenu(), {once: true});
    setDispSubmenuKey(key);

    setTop(String(e.currentTarget.getBoundingClientRect().top + 75) + "px");
    setLeft(String(e.currentTarget.getBoundingClientRect().left) + "px");
  }

  // 整備計画サブメニュー非表示セット処理
  const setHiddenSubmenu = () => {
    if ("" === dispSubmenuKey) {
      window.addEventListener("click", hiddenSubmenu, {once: true});
    }
  }

  // 整備計画サブメニュー非表示
  const hiddenSubmenu = () => {
    setDispSubmenuKey("");
  }

  // 保守整備表モーダルから渡ってきた保守整備表型オブジェクトを更新する
  const registMaintenanceReport = async(menteReport: MaintenanceReport) => {
    // 更新処理
    try {
      let errFlg = false;
      // 排他制御
      await client.models.MaintenanceInspectionDate.get({
        imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
        inspectionDateMaintenanceItem: planInput!.date + "#" + planInput!.maintenanceItem,
      }).then(apiData => {
        if("data" in apiData && apiData.data) {
          if (apiData.data.version !== menteReport.updateData.version) {
            console.error("排他エラー");
            errFlg = true;
            return;
          } else {
            menteReport.updateData.version =  menteReport.updateData.version! + 1;
          }

          if (errFlg) {
            return;
          }

          // 計画日と実施日の変更を確認する
          if(apiData.data.inspectionDate === menteReport.updateData.inspectionDate){
            // 変更されていなければそのまま更新
            client.models.MaintenanceInspectionDate.update(menteReport.updateData);
          } else {
            // 変更されている場合は元のレコードを削除して新規登録(SKが変わるため)
            const delInput ={
              imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
              inspectionDateMaintenanceItem:planInput!.date + "#" + planInput!.maintenanceItem,
            };
            client.models.MaintenanceInspectionDate.delete(delInput);
            const creInput = {
              imoMaintenancePoint: getImo() + "#" + selectedMaintenancePoint,
              inspectionDateMaintenanceItem:planInput!.date + "#" + planInput!.maintenanceItem,
              maintenancePoint: selectedMaintenancePoint,
              maintenanceItem:planInput!.maintenanceItem,
              inspectionDate: menteReport.updateData.inspectionDate!,
              imo: menteReport.updateData.imo!,
              reportNo: menteReport.updateData.reportNo,
              status: menteReport.updateData.status!,
              note: menteReport.updateData.note,
              fileName: menteReport.updateData.fileName ,
              createUser: menteReport.updateData.createUser,
              updateUser: menteReport.updateData.updateUser ,
              version: menteReport.updateData.version
            }
            client.models.MaintenanceInspectionDate.create(creInput);

          }
          // 次回登録用採番
          if(!apiData.data.reportNo){
            // 取得したレコードのレポートNoが空であれば採番する
            updateNextSequence("MaintenanceReport");
          }
          // ファイルアップロード
          const fileNames = menteReport.updateData.fileName?menteReport.updateData.fileName.split(","):null;
          uploadFile(fileNames, menteReport.file , menteReport.updateData.reportNo! ,FILE_TYPE);

          return updateRportAfterMaintenanceInfo(menteReport).then(res => {
              // 保守整備表モーダルを閉じる
              closeMaintenanceReportModal();
              setImplementationDate(dayjs().format('YYYY/MM/DD'));
              // 再取得処理
              getPointList(selectedMaintenancePosition);
              getMaintenanceItem(selectedMaintenancePoint);
            });
        }
      });
    } catch (error) {
       console.error(error);
       return;
    }
  };

  // 保守整備表更新後にメンテナンステーブル情報を更新する
  const updateRportAfterMaintenanceInfo = async(menteReport: MaintenanceReport) => {
    if (menteReport.updateData.status === "2" || menteReport.updateData.status === "3" || menteReport.updateData.status === "4") {
      // ステータスが完了の場合
      await client.models.MaintenanceTable.get({
        topItem: getImo() + "#" + menteReport.updateData.maintenancePoint!,
        bottomItem:menteReport.updateData.maintenanceItem!
      }).then(apiData => {
          if ("data" in apiData && apiData.data ) {
            let nextDueDate = "";
            if (apiData.data.intervalUnit === "0") {
              nextDueDate =  dayjs(menteReport.updateData.inspectionDate).add(apiData.data.interval!, 'd').format("YYYY/MM/DD");
            } else if (apiData.data.intervalUnit === "1") {
              nextDueDate =  dayjs(menteReport.updateData.inspectionDate).add(apiData.data.interval!, 'w').format("YYYY/MM/DD");
            } else if (apiData.data.intervalUnit === "2") {
              nextDueDate =  dayjs(menteReport.updateData.inspectionDate).add(apiData.data.interval!, 'M').format("YYYY/MM/DD");
            } else {
              nextDueDate =  dayjs(menteReport.updateData.inspectionDate).add(apiData.data.interval!, 'y').format("YYYY/MM/DD");
            }
            // 次回計画日更新
            // TODO 前回実施日として保守整備記録表の日付を渡しているが
            // TODO 遡って過去データを完了等にした場合は、その過去日付が前回実施日になってしまう？
            return updateMaintenance(menteReport.updateData.inspectionDate!,nextDueDate).then(res=>{
              // 計画登録モーダルクローズ
              closePlanModal();
              // 再取得処理
              getPointList(selectedMaintenancePosition);
              getMaintenanceItem(selectedMaintenancePoint);
            });
          }
      });
    }
  };
  
  // カレンダーモーダル表示
  const openCalendar = () => {
    setCalendar(true);
  };

  // カレンダーモーダル表示（保守整備表モーダルから開く場合）
  const openCalendarForReportModal = () => {
    setCalendarForRepotModal(true);
  };
  
  // カレンダーモーダル非表示
  const closeCalendar = () => {
    setCalendar(false);
    setCalendarForRepotModal(false);
  };

  // カレンダー日付の更新（カレンダーモーダルから呼ばれる）
  const changeCalendar = (selectDate: string, isMentenanceReport: boolean) => {
    // 保守整備表モーダルから呼ばれた場合は処理内容が変わる
    if (isMentenanceReport) {
      // カレンダーモダールから渡ってくる日付を選択日付にセット
      setImplementationDate(selectDate);
    } else {
      // カレンダーモダールから渡ってくる日付を選択日付にセット
      setDisplayStartDate(selectDate);
      // 画面表示項目の作成
      createDisplay(selectDate);
    }
  };

  // 本日スタートのカレンダー表示
  const dispToday = () => {
    // 本日を取得(YYYY/MM/DD形式)
    const today = dayjs().format('YYYY/MM/DD');
    // 選択日付にセット
    setDisplayStartDate(today);
    // 画面表示項目の生成
    createDisplay(today);
  };

  // 先週のカレンダー表示
  const dispLastWeek = () => {
    // 表示中カレンダーの先週を取得
    const lastWeek = dayjs(displayStartDate).subtract(1, 'week').format("YYYY/MM/DD");
    // 選択日付にセット
    setDisplayStartDate(lastWeek);
    // 画面表示項目の生成
    createDisplay(lastWeek);
  };

  // 来週のカレンダー表示
  const dispNextWeek = () => {
    // 表示中カレンダーの来週を取得
    const nextWeek = dayjs(displayStartDate).add(1, 'week').format("YYYY/MM/DD");
    // 選択日付にセット
    setDisplayStartDate(nextWeek);
    // 画面表示項目の生成
    createDisplay(nextWeek);
  };

  // 前日のカレンダー表示
  const dispYesterday = () => {
    // 表示中カレンダーの前日を取得
    const yesterday = dayjs(displayStartDate).subtract(1, 'd').format("YYYY/MM/DD");
    // 選択日付にセット
    setDisplayStartDate(yesterday);
    // 画面表示項目の生成
    createDisplay(yesterday);
  };

  // 翌日のカレンダー表示
  const dispTomorrow = () => {
    // 表示中カレンダーの翌日を取得
    const tomorrow = dayjs(displayStartDate).add(1, 'd').format("YYYY/MM/DD");
    // 選択日付にセット
    setDisplayStartDate(tomorrow);
    // 画面表示項目の生成
    createDisplay(tomorrow);
  };

  // ファイル削除モーダル表示
  const openFileDeleteModal = () => {
    setFileDeleteModal(true);
  };
  
  // ファイル削除モーダル非表示
  const closeFileDeleteModal = () => {
    setIsFileDelete(false);
    setFileDeleteModal(false);
  };

  // ファイル削除
  const deleteFile = () => {
    setIsFileDelete(true);
    setFileDeleteModal(false);
  };

  // 重複ファイル削除
  const deleteDuplicateFile = () => {
    setIsDuplicateFile(true);
    setIsDuplicateFileDelete(true);
    setFileDuplicateModal(false);
  };

  // ソート処理
  const setSort = (columnName: string, sortKind: string) => {

    // DB取得処理
    // TODO バックエンド連携後に記載
    // TODO 他画面についても修正
    // TODO ローディングオンオフ

    // ソート項目の保持
    setPreSortColumn(columnName);
    // ソート項目の保持
    setPreSortKind(sortKind);
  }

  return (
    <div className="page01-contents">
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page01-page-title">保守整備表</p>

      <div className="page01-table-area">
        <div className="page01-usage-guide">
          <img src="/images/incomplete.svg" alt="SVG" />
          <span>：未完了</span>
          <img src="/images/completeWithMessage.svg" alt="SVG" />
          <span>：完了(コメントあり)</span>
          <img src="/images/complete.svg" alt="SVG" />
          <span>：完了</span>
        </div>
        <div className="page01-position-area">
          {selectedMaintenancePosition === "01" ? (
            <div className="page01-selected-position" onClick={() => selectMaintenancePosition("01")}>機関部</div>
          ) : (
            <div className="page01-not-selected-position" onClick={() => selectMaintenancePosition("01")}>機関部</div>
          )}
          {selectedMaintenancePosition === "02" ? (
            <div className="page01-selected-position" onClick={() => selectMaintenancePosition("02")}>甲板部</div>
          ) : (
            <div className="page01-not-selected-position" onClick={() => selectMaintenancePosition("02")}>甲板部</div>
          )}
        </div>
        <div className="page01-date-operation">
          <div className="page01-date-operation-icon">
            <img src="/images/leftDoubleArrow.svg" alt="SVG" onClick={dispLastWeek} />
          </div>
          <div className="page01-date-operation-icon">
            <img src="/images/leftArrow.svg" alt="SVG" onClick={dispYesterday} />
          </div>
          <div className="page01-start-date-area">
            <p className="page01-start-date">表示開始日：</p>
            <p className="page01-start-date-bold">{displayStartDate}</p>
          </div>
          <div className="page01-date-operation-icon">
            <img src="/images/calendar.svg" alt="SVG" onClick={openCalendar} />
          </div>
          <div className="page01-date-operation-icon">
            <img src="/images/rightArrow.svg" alt="SVG" onClick={dispTomorrow} />
          </div>
          <div className="page01-date-operation-icon">
            <img src="/images/rightDoubleArrow.svg" alt="SVG" onClick={dispNextWeek} />
          </div>
          <div className="page01-date-operation-separator">
            <img src="/images/dateSeparator.svg" alt="SVG" />
          </div>
          <button onClick={dispToday}>今日</button>
        </div>
        <div className="page01-maintenance-table-area">
          <div className="page01-maintenance-point">
            <div className="page01-maintenance-point-title">点検箇所</div>
            <div className="page01-maintenance-point-list">
              {maintenancePointList.map((maintenancePoint) => {
                return (
                  <div
                    data-key={maintenancePoint.key}
                    onClick={() => selectMaintenancePoint(maintenancePoint.key)}
                    className={selectedMaintenancePoint === maintenancePoint.key ? "page01-selected-point" : ""}
                    key={maintenancePoint.key}
                  >
                    {maintenancePoint.alertFlg === true ? (
                      <span>
                        <span>
                          {maintenancePoint.value}
                        </span>
                        <img src="/images/alert.svg" alt="SVG" className="page01-alert"/>
                        <span>
                          <div>
                            {maintenancePoint.value}
                          </div>
                        </span>
                      </span>
                    ) : (
                      <span>
                        <span>
                          {maintenancePoint.value}
                        </span>
                        <span>
                          <div>
                            {maintenancePoint.value}
                          </div>
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="page01-maintenance-table">
            <div className="page01-table-header-flex">
            <div className="page01-table-header">
              <tr className="page01-maintenance-table-header">
                <td>点検項目</td>
                <td>
                  前回実施日
                  <ComSortIcon
                    preSortColumn={preSortColumn}
                    preSortKind={preSortKind}
                    columnName="lastPlanDate"
                    setSort={setSort}
                  />
                </td>
                <td>間隔</td>
                <td>デューデート</td>
                <td>
                  次回計画日
                  <ComSortIcon
                    preSortColumn={preSortColumn}
                    preSortKind={preSortKind}
                    columnName="nextPlanDate"
                    setSort={setSort}
                  />
                </td>
              </tr>
            </div>
            <div 
              className="page01-table-header-day"
              ref={scrollRightHeader}
            >
              <table className="page01-header-day-table">
              <tr className="page01-maintenance-table-header">
                {headerCalendar.map((dayList) => {
                  return (
                    <td data-date={dayList.yyyymmdd} key={dayList.yyyymmdd}>
                      {dayList.yyyymmdd === nowDate ? (
                        <div>
                          <div className="page01-display-start-date">{dayList.day}</div>
                        </div>
                      ) : (
                        dayList.day
                      )}
                    </td>
                  );
                })}
              </tr>
              </table>
            </div>
            </div>

            <div className="page01-table-body-flex">
            <div
              className="page01-summary-table-area"
              ref={scrollLeftBody}
              onScroll={handleScrollLeft}
            >
              <table className="page01-summary-table">
                {maintenanceItemList.map((maintenanceItem) => {
                  return (
                    <tr className="page01-maintenance-table-body" key={maintenanceItem.maintenanceItem}>
                      {maintenanceItem.incompleteAlertFlg === true ? (
                        <td>
                          <span>
                            {maintenanceItem.item}
                            <img src="/images/alert.svg" alt="SVG" className="page01-alert"/>
                          </span>
                          <span>
                            {maintenanceItem.item}
                          </span>
                        </td>
                      ) : (
                        <td>
                          <span>
                            {maintenanceItem.item}
                          </span>
                          <span>
                            {maintenanceItem.item}
                          </span>
                        </td>
                      )}
                      <td>{maintenanceItem.preDay}</td>
                      <td>
                        {maintenanceItem.intervalUnit === "0" ? (
                          <span>{maintenanceItem.interval}日</span>
                        ) : maintenanceItem.intervalUnit === "1" ? (
                          <span>{maintenanceItem.interval}週</span>
                        ) : maintenanceItem.intervalUnit === "2" ? (
                          <span>{maintenanceItem.interval}月</span>
                        ) : maintenanceItem.intervalUnit === "3" ? (
                          <span>{maintenanceItem.interval}年</span>
                        ) : (
                          <span>{maintenanceItem.interval}</span>
                        )}
                        
                      </td>
                      <td>{maintenanceItem.dueDate}</td>
                      {maintenanceItem.nextPlanDateAlertFlg === true && maintenanceItem.nextDay === "" ? (
                        <td>
                          未計画
                          {maintenanceItem.nextDay}
                          <img src="/images/alert.svg" alt="SVG" className="page01-alert"/>
                        </td>
                      ) : maintenanceItem.nextPlanDateAlertFlg === true ? (
                        <td>
                          {maintenanceItem.nextDay}
                          <img src="/images/alert.svg" alt="SVG" className="page01-alert"/>
                        </td>
                      ) : (
                        <td>{maintenanceItem.nextDay}</td>
                      )}
                    </tr>
                  );
                })}
              </table>
            </div>

            <div
              className="page01-day-table-area"
              ref={scrollRightBody}
              onScroll={handleScrollRight}
            >
              <table className="page01-day-table">
                {/* {itemList.map((item) => { */}
                {maintenanceItemList.map((maintenanceItem) => {
                  return (
                    <tr className="page01-maintenance-table-body" key={maintenanceItem.maintenanceItem}>
                      {maintenanceItem.dayList.map((dayStatus) => {
                        return (
                          // data-keyに検索に使用できる値をセットする
                          // とりあえずは全てstatusで表示の確認★後で直す
                          <td data-key={dayStatus.status} key={dayStatus.date}>
                            {dayStatus.status === "0" ? (
                              <div onClick={() => displayPlanModal(dayStatus,maintenanceItem.maintenanceItem)} data-key={dayStatus.status} className="page01-click-td-area">
                                <img src="/images/statusUnplanned.svg" alt="SVG" />
                              </div>
                            ) : dayStatus.status === "1" ? (
                              // ★dispSubmenuにはkeyを渡す、「dispSubmenuKey == status」も「dispSubmenuKey == key」とする
                              // TODO 確認後消す <div onClick={() => dispSubmenu(dayStatus.date + dayStatus.status)} className="page01-planned-relative page01-click-td-area">
                              <div onClick={(event) => dispSubmenu(maintenanceItem.topItem + maintenanceItem.maintenanceItem + dayStatus.date, event)} className="page01-planned-relative page01-click-td-area">
                                <p>計画</p>
                                <img src="/images/statusPlanned.svg" alt="SVG" className="page01-planned" />
                                {/* TODO 確認後消す <div className={dispSubmenuKey === dayStatus.date + dayStatus.status ? "page01-planned-submenu" : "page01-planned-submenu-none"}> */}
                                <div style={{position: "absolute", top: top.toString(), left: left}} className={dispSubmenuKey === maintenanceItem.topItem + maintenanceItem.maintenanceItem + dayStatus.date ? "page01-planned-submenu" : "page01-planned-submenu-none"}>
                                  <div onClick={() => openMaintenanceReportModal(dayStatus,maintenanceItem.maintenanceItem)}>
                                    <img src="/images/maintenanceReport.svg" alt="SVG" />
                                    <p>保守整備記録作成</p>
                                  </div>
                                  <div onClick={() => openDeleteModal(dayStatus,maintenanceItem.maintenanceItem)}>
                                    <img src="/images/dustbox.svg" alt="SVG" />
                                    <p>計画削除</p>
                                  </div>
                                </div>
                              </div>
                          ) : dayStatus.status === "2" ? (
                            <div onClick={() => openMaintenanceReportModal(dayStatus,maintenanceItem.maintenanceItem)} className="page01-click-td-area">
                              <img src="/images/statusUncomplete.svg" alt="SVG" />
                            </div>
                          ) : dayStatus.status === "3" ? (
                            <div onClick={() => openMaintenanceReportModal(dayStatus,maintenanceItem.maintenanceItem)} className="page01-click-td-area">
                              <img src="/images/statusCompleteWithComment.svg" alt="SVG" />
                            </div>
                          ) : dayStatus.status === "4" ? (
                            <div onClick={() => openMaintenanceReportModal(dayStatus,maintenanceItem.maintenanceItem)} className="page01-click-td-area">
                              <img src="/images/statusComplete.svg" alt="SVG" />
                            </div>
                          ) : (
                            <div onClick={() => displayPlanModal(dayStatus,maintenanceItem.maintenanceItem)} data-key={dayStatus.status} className="page01-click-td-area">
                              <img src="/images/statusUnplanned.svg" alt="SVG" />
                            </div>
                          )}
                        </td>
                        
                      )
                    })}
                  </tr>
                );
              })}
            </table>
            </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={planModal} className={planModalClass} overlayClassName={planModalOverlayClass} appElement={document.getElementById('root') || undefined}>
        <PlanModal
          description={''}
          closeModal={closePlanModal}
          makePlan={makePlan}
        />
      </Modal>

      <Modal isOpen={maintenanceReportModal} className={maintenanceReportModalClass} overlayClassName={maintenanceReportModalOverlayClass} appElement={document.getElementById('root') || undefined}>
        <MaintenanceReportModal
          key={key}
          regist={registMaintenanceReport}
          closeModal={closeMaintenanceReportModal}
          openCalendar={openCalendarForReportModal}
          implementationDate={implementationDate}
          setImplementationDate={setImplementationDate}
          planInput={planInput!}
          maintenancePoint={selectedMaintenancePoint}
          openFileDeleteModal={openFileDeleteModal}
          isFileDelete={isFileDelete}
          setIsFileDelete={setIsFileDelete}
          openFileDuplicateModal={openFileDuplicateModal}
          isDuplicateFile={isDuplicateFile}
          setIsDuplicateFile={setIsDuplicateFile}
          isDuplicateFileDelete={isDuplicateFileDelete}
          setIsDuplicateFileDelete={setIsDuplicateFileDelete}
        />
      </Modal>

      <Modal isOpen={deleteModal} className={deleteModalClass} overlayClassName={deleteModalOverlayClass} appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeDeleteModal}
          delete={deletePlan}
          modalText="消去しますか？"
        />
      </Modal>

      <Modal isOpen={calendar} className="com01-calendar-modal" overlayClassName="com01-calendar-overlay" appElement={document.getElementById('root') || undefined}>
        <CommonCalendar
          selectDate={displayStartDate}
          closeCalendar={closeCalendar}
          setDate={changeCalendar}
          isMentenanceReport={false}
        />
      </Modal>

      <Modal isOpen={calendarForRepotModal} className="com01-calendar-modal" overlayClassName="com01-calendar-overlay" appElement={document.getElementById('root') || undefined}>
        <CommonCalendar
          selectDate={implementationDate}
          closeCalendar={closeCalendar}
          setDate={changeCalendar}
          isMentenanceReport={true}
        />
      </Modal>

      <Modal isOpen={fileDeleteModal} className="page01-delete-modal" overlayClassName="page01-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDeleteModal}
          delete={deleteFile}
          modalText="削除しますか？"
        />
      </Modal>

      <Modal isOpen={fileDuplicateModal} className="page01-delete-modal" overlayClassName="page01-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDuplicateModal}
          delete={deleteDuplicateFile}
          modalText="同名ファイルが選択されました。上書きしますか？"
        />
      </Modal>
    </div>
  );
};

export default MaintenanceTable;
