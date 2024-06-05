import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./FailureReport.css";
import {ReportModal, FailureReportData} from "./ReportModal"
import {CommonCalendar} from "../../components/CommonCalendar/CommonCalender"
import {DeleteModal} from "./DeleteModal"
import comSortAsc from "../../components/CommonSort/CommonSortAsc"
import comSortDesc from "../../components/CommonSort/CommonSortDesc"
import ComSortIcon from "../../components/CommonSort/CommonSortIcon";
import ComPlus from "../../components/CommonIcon/CommonPlus";
import ComDetail from "../../components/CommonIcon/CommonDetail";
import ComDelete from "../../components/CommonIcon/CommonDelete";
import dayjs from "dayjs";
import { fetchAuthSession } from 'aws-amplify/auth';
import { setMenu } from "../../components/CommonMenu/CommonMenu";
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { Loading } from "../../components/CommonLoading/CommonLoading";
import { FileManagement } from "../../hooks/FileManagement";
import { Sequence } from "../../hooks/Sequence";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 報告書一覧型
type FailureReportList = {
  imo: string;
  kind: string
  reportNo: string;
  reportName: string;
  group: string;
  accrualDate: string;
  version:number;
}

// 報告書型
export type FailureReportDetail = {
  kind: string
  reportNo: string;
  reportName: string;
  group: string;
  accrualDate: string;
  // fileUrls: string[];
  fileNames: string[];
  createUser: string;
  updateUser: string;
  version: number;
}
export type ListKey = {
  key: string;
  value: string
}

export type UpdateKey = {
  reportNo:string;
  version:number;
}
export const kindList:ListKey[] = [];
export const groupList:ListKey[] = [];

// 報告書画面
const FailureReport: React.FC = () => {

  // 報告書一覧型
  const [failureReportList, setFailureReportList] = useState<FailureReportList[]>([]);
  
  // 報告書一覧型（元データ保持用）
  const [failureReportListDefault, setFailureReportListDefault] = useState<FailureReportList[]>([]);

  // データを一意に特定するキー
  const [updateKey, setUpdateKey] = useState<UpdateKey>({reportNo:"",version:0});
  
  // 報告書モーダルで表示する日付、YYYY/MM/DD形式
  const [accrualDate, setAccrualDate] = useState(dayjs().format('YYYY/MM/DD'));

  // 報告書モーダル表示制御
  const [modal, setModal] = useState(false);
  // カレンダーモーダル表示制御
  const [calendar, setCalendar] = useState(false);
  // 削除モーダル表示制御
  const [deleteModal, setDeleteModal] = useState(false);
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
  
  // 報告書モーダルクラス制御
  const [modalClass, setModalClass] = useState("page03-report-modal");
  // 報告書モーダルオーバーレイクラス制御
  const [modalOverlayClass, setModalOverlayClass] = useState("page03-report-modal-overlay");

  // 前回ソート項目
  const [preSortColumn, setPreSortColumn] = useState("");
  // 前回ソート種別
  const [preSortKind, setPreSortKind] = useState("");

  // 種類セレクトボックス
  const kindRef = useRef<HTMLInputElement>(null);
  // グループセレクトボックス
  const groupRef = useRef<HTMLInputElement>(null);
  // 報告書名インプットボックス
  const reportNameRef = useRef<HTMLInputElement>(null);

  // 種類セレクトボックスClassName
  const [kindListClassName, setKindListClassName] = React.useState("page03-filter-kind-list-area-none");
  // グループセレクトボックスClassName
  const [groupListClassName, setGroupListClassName] = React.useState("page03-filter-group-list-area-none");

  // リスト後続取得用のトークン
  const [nextToken, setNextToken] = useState("");
  // リスト後続取得用のソート順
  const [sortDirection, setSortDirection] = useState("");
  // リスト後続取得用のソート項目
  const [sortItem, setSortItem] = useState("");
  // 2重初期処理防止
  const ignore = useRef(false);

  const FILE_TYPE = "03" //報告書
  const LIMIT = 12 // 1度の検索で取得するリスト数
  
  // セッションカスタムhook
  const { getImo } = useSessionData();
  const { uploadFile,deleteFile } = FileManagement();
  const { updateNextSequence } = Sequence();

  // ローディング判定
  const isLoading = useRef(false);

  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      getSession();
      getSelectionList();
      // 画面表示項目の取得
      getReportList();
      // メニューのセット
      setMenu("3");
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);

  // データ更新時に再フィルター
  useEffect(() => {
    // setFilter();
  // eslint-disable-next-line
  }, [failureReportListDefault]);

  // セッション情報取得
  const getSession = async () => {
    const {
      identityId,
    } = await fetchAuthSession();
  };

  //選択リスト取得
  const getSelectionList = async () => {
    // 一覧データを取得
    if (kindList.length < 1 && groupList.length < 1) {
      // await client.graphql({query: queryGet2CodeList,
      //   variables: {
      //     codeName1: "kindList", // kindList TODO 仮
      //     codeName2: "groupList", // groupList　TODO 仮
      // }})
      await client.models.CodeMaster.list({
        codeName:"kindList", // kindList TODO 仮
      })
      .then(apiData=>{
        if("data" in apiData && apiData.data){
          for (const item of apiData.data) {
            kindList.push({
                key: item.value
              , value: item.valueName
            });
          }
        }
      });
      await client.models.CodeMaster.list({
        codeName:"groupList", // kindList TODO 仮
      }).then(apiData=>{
        if("data" in apiData && apiData.data){
          for (const item of apiData.data) {
            groupList.push({
                key: item.value
              , value: item.valueName
            });
          }
        }
      });
    }
  };
  // データ取得・更新用のkeyをセット
  const setKeyVal = (reportNo: string, version:number, accrualDate:string) => {
    // keyをセット
    setUpdateKey({
      reportNo: reportNo,
      version: version
    });
    setAccrualDate(accrualDate);

    // 報告書モーダルオープン
    openModal();
  }

  // 報告書モーダル表示
  const openModal = () => {
    setModal(true);
  };
  
  // 報告書モーダル非表示
  const closeModal = () => {
    setModal(false);
    setAccrualDate(dayjs().format('YYYY/MM/DD'));
  };

  // 削除モーダル表示
  const openDeleteModal = (reportNo: string, version:number) => {
    // 削除用のキー値セット
    setUpdateKey({
      reportNo:reportNo,
      version:version
    });

    // 削除モーダルオープン
    setDeleteModal(true);
  }

  // 削除モーダル非表示
  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  // カレンダーモーダル表示
  const openCalendar = () => {
    setCalendar(true);
  };
  
  // カレンダーモーダル非表示
  const closeCalendar = () => {
    setCalendar(false);
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

  // 画面表示項目の取得
  const getReportList = async() => {
    // 共通エリアからimo等取得

    // 一覧データのクリア
    let reportDefaultList = [...failureReportListDefault];
    reportDefaultList.splice(0);
    let reportList = [...failureReportList];
    reportList.splice(0);

    // 一覧データを取得（発生日の降順）
    getSortList("","","","accrualDate","DESC");
   

  }

  // 検索条件作成用
  interface FilterType {
    [index: string]: {[index:string]:{}};
  }
  // リストの取得
  const getSortList = async(kind:string,group:string,reportName:string,sortItem:string,sortDirection:string) => {
  
    isLoading.current = true;
    // 一覧データのクリア
    let reportDefaultList = [...failureReportListDefault];
    reportDefaultList.splice(0);
    let reportList = [...failureReportList];
    reportList.splice(0);
    // 後続取得用の項目をクリア
    setNextToken("");
    setSortDirection("");
    setSortItem("");
    // 検索処理 
    const input ={
      imo:getImo(),
      sortItem: sortItem,
      sortDirection: sortDirection,
      kind:kind,
      group: group,
      reportName: reportName,
      nextToken: "",
      limit:LIMIT
    }
    // TODO コメントアウト
    // const res = await client.graphql({query: querySortFailureReportList,
    //   variables: {
    //     msg:input
    //   }
    // });
    // console.log(res);
    // if ("data" in res && res.data ) {
      // const data = JSON.parse(res.data.querySortFailureReportList!);
      // reportList = data.items;
      // if(data.lastEvaluatedKey !== null){
      //   // 後続取得用の項目を設定
      //   setNextToken(data.nextToken);
      //   setSortDirection(sortDirection);
      //   setSortItem(sortItem);
      // }
    // }
    // TODO 取り合ず全検索↓
    const res = await client.models.FailureReport.list({
      imo: getImo()
    })
    if ("data" in res && res.data ) {
      for (const item of res.data) {
        reportList.push({
          imo: item.imo,
          kind: item.kind,
          reportNo: item.reportNo,
          reportName: item.reportName!,
          group: item.group,
          accrualDate: item.accrualDate,
          version:item.version!
        })
      }
    }
// TODO 取り合ず全検索↑

    reportDefaultList = reportList.concat();

    setFailureReportList([]);
    setFailureReportList(reportList);

    // 元データ表示用オブジェクトにもセット
    setFailureReportListDefault([]);
    setFailureReportListDefault(reportDefaultList);
    isLoading.current = false;
    
  }

  // リストの追加取得
  const getAdditionalSortList = async(kind:string,group:string,reportName:string) => {
    // TODO ソート検索機能ができるまで何もしない
    isLoading.current = true;
    // // 検索処理 
    // const input ={
    //   imo:getImo(),
    //   sortItem: sortItem,
    //   sortDirection: sortDirection,
    //   kind:kind,
    //   group: group,
    //   reportName: reportName,
    //   nextToken:nextToken,
    //   limit:LIMIT
    // }
    // console.log(input);
    // const res = await client.graphql({query: querySortFailureReportList,
    //   variables: {
    //     msg:input
    //   }
    // });
    // let reportList = failureReportList;
    // if ("data" in res && "querySortFailureReportList" in res.data ) {
    //   const data = JSON.parse(res.data.querySortFailureReportList!);
    //   for (const item of  data.items) {
    //     reportList.push(item);
    //   }
    //   if(data.nextToken !== null){
    //     // 後続取得用の項目を設定
    //     setNextToken(data.nextToken);
    //   } else {
    //     setNextToken("");
    //   }
    // }

    // const reportDefaultList = reportList.concat();

    // setFailureReportList([]);
    // setFailureReportList(reportList);

    // // 元データ表示用オブジェクトにもセット
    // setFailureReportListDefault([]);
    // setFailureReportListDefault(reportDefaultList);
    isLoading.current = false;
  }

  // 報告書モーダルから渡ってきた報告書型オブジェクトを登録する
  const registReport = async(report: FailureReportData) => {
    try {
      let errFlg = false;
        // const apiData = await client.graphql({query: getFailureReport,
        //   variables: {
        //     imo: getImo(),
        //     reportNo: report.failureReportDetail.reportNo,
        //   }
        // });
        const apiData = await client.models.FailureReport.get({
          imo: getImo(),
          reportNo: report.failureReportDetail.reportNo,
        });
        if ("data" in apiData && apiData.data ) {
          if (apiData.data.version !== report.failureReportDetail.version) {
            console.error("排他エラー");
            errFlg = true;
          } else {
            const data = {
              imo: getImo(),
              reportNo: report.failureReportDetail.reportNo,
              group: report.failureReportDetail.group,
              kind:report.failureReportDetail.kind,
              reportName: report.failureReportDetail.reportName,
              accrualDate: report.failureReportDetail.accrualDate,
              fileName: report.failureReportDetail.fileNames.join(','),
              compleateStatus:"Incomplete", //TODO　入力値
              version:report.failureReportDetail.version + 1,
              updateUser:"updateUser",//TODO ログインユーザー
            };
            await client.models.FailureReport.update(data);
          }
      } else {
        // 登録処理
        const data = {
          imo: getImo(),
          reportNo: report.failureReportDetail.reportNo,
          group: report.failureReportDetail.group,
          kind:report.failureReportDetail.kind,
          reportName: report.failureReportDetail.reportName,
          accrualDate: report.failureReportDetail.accrualDate,
          fileName: report.failureReportDetail.fileNames.join(','),
          compleateStatus:"Incomplete", //TODO　入力値
          version:1,
          createUser:"createUser",//TODO ログインユーザー
          updateUser:"updateUser"//TODO ログインユーザー
        };
        await client.models.FailureReport.create(data);
        // 次回登録用採番
        await updateNextSequence("FailureReport");
      }

      if (!errFlg) {
        // ファイルアップロード
        await uploadFile(report.failureReportDetail.fileNames, report.file, report.failureReportDetail.reportNo ,FILE_TYPE);
        
        // 報告書モーダルを閉じる
        closeModal();
        setAccrualDate(dayjs().format('YYYY/MM/DD'));
        // 再取得処理
        getReportList();
      }
    } catch (error) {
      console.error(error);
      return;
    }
  }

  // カレンダーモーダルで選択した日付セット
  const setDate = (selectDate: string) => {
    // 選択日付をセット
    setAccrualDate(selectDate);

    // カレンダーモーダルを閉じる
    closeCalendar();
  }

  // 報告書削除
  const deleteReport = async() => {
    const imo = getImo();
    try {
      // const res = await client.graphql({
      //   query: getFailureReport,
      //   variables: {
      //     imo: imo,
      //     reportNo: updateKey.reportNo,
      //   }
      // });
      const res = await client.models.FailureReport.get({
        imo: getImo(),
        reportNo: updateKey.reportNo,
      });
      if ("data" in res && res.data ) {
        // 該当のレコードを削除テーブルに登録
        const input ={
            tableName: "FailureReport",
            imo:imo,
            deleteData:JSON.stringify(res.data),
            id:"",
        };
        await client.models.DeleteData.create(input);
        if (res.data.fileName) {
          deleteFile(res.data.fileName.split(","), updateKey.reportNo, FILE_TYPE);
        }

        // 削除処理
        const data= {
           imo: imo,
           reportNo: updateKey.reportNo,
        };
        client.models.FailureReport.delete(data);
      }
    } catch (error) {
      console.error(error);
      return;
   }

    // 削除モーダルを閉じる
    closeDeleteModal();

    // 再取得処理
    getReportList();
  };

  // ファイル削除
  const FileDelete = () => {
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
    // 一覧の初期化
    setFailureReportList([]);
    // 種類フィルタ値
    let filterValKind = String(kindRef.current?.getAttribute("data-key"));
    // グループフィルタ値
    let filterValGroup = String(groupRef.current?.getAttribute("data-key"));
    // 報告書名フィルタ値
    let filterValReportName = String(reportNameRef.current?.value);
    
    // 再押下の場合はソート解除
    if ((columnName === preSortColumn
      && "desc" === preSortKind
      && "desc" === sortKind)
      || (columnName === preSortColumn
          && "asc" === preSortKind
          && "asc" === sortKind)) {
      // 前回ソート項目の初期化
      setPreSortColumn("");
      // 前回ソート種別の初期化
      setPreSortKind("");
      // フィルタ処理
      // setFilter(failureReportListDefault);
      // 一覧データを取得（発生日の降順）
      getSortList(filterValKind,filterValGroup,filterValReportName,"accrualDate","DESC");
    } else {
      // 昇降順判定
      let sortTable: FailureReportList[];
      if (sortKind === "asc") {
        // 昇順ソート
        // sortTable = sortAsc(failureReportListDefault.concat(), columnName);
        // 一覧データを取得
        getSortList(filterValKind,filterValGroup,filterValReportName,columnName,"ASC");
      } else {
        // 降順ソート
        // sortTable = sortDesc(failureReportListDefault.concat(), columnName);
        // 一覧データを取得
        getSortList(filterValKind,filterValGroup,filterValReportName,columnName,"DESC");
      }

      // ソート項目の保持
      setPreSortColumn(columnName);
      // ソート項目の保持
      setPreSortKind(sortKind);

      // フィルタ処理
      // setFilter(sortTable, columnName, sortKind);
    }
  }

  // 昇順ソート
  const sortAsc = (sortTable: FailureReportList[], columnName: string) => {
    return sortTable.sort((a, b) => comSortAsc(columnName as keyof FailureReportList, a, b));
  }

  // 降順ソート
  const sortDesc = (sortTable: FailureReportList[], columnName: string) => {
    return sortTable.sort((a, b) => comSortDesc(columnName as keyof FailureReportList, a, b));
  }

  // 種類リスト表示
  const dispKindList = () => {
    setKindListClassName("page03-filter-kind-list-area");
    window.addEventListener("mouseup", hiddenKindList, {once: true});
  };
  // 種類リスト非表示
  const hiddenKindList = () => {
    setKindListClassName("page03-filter-kind-list-area-none");
  }
  // グループリスト表示
  const dispGroupList = () => {
    setGroupListClassName("page03-filter-group-list-area");
    window.addEventListener("mouseup", hiddenGroupList, {once: true});
  };
  // グループリスト非表示
  const hiddenGroupList = () => {
    setGroupListClassName("page03-filter-group-list-area-none");
  }

  // 種類のセット
  const clickKind = (e: React.MouseEvent<HTMLElement>) => {
    if (kindRef.current !== null) {
      kindRef.current.textContent = (String(e.currentTarget.getAttribute("data-value")));
      kindRef.current.setAttribute("data-key", String(e.currentTarget.getAttribute("data-key")));
      setFilter();
    }
  }
  // グループのセット
  const clickGroup = (e: React.MouseEvent<HTMLElement>) => {
    if (groupRef.current !== null) {
      groupRef.current.textContent = (String(e.currentTarget.getAttribute("data-value")));
      groupRef.current.setAttribute("data-key", String(e.currentTarget.getAttribute("data-key")));
      setFilter();
    }
  }

  // フィルタ処理
  const setFilter = (reportList?: FailureReportList[], sortColmn?: string, sortKind?: string) => {
    // 種類フィルタ値
    let filterValKind = String(kindRef.current?.getAttribute("data-key"));
    // グループフィルタ値
    let filterValGroup = String(groupRef.current?.getAttribute("data-key"));
    // 報告書名フィルタ値
    let filterValReportName = String(reportNameRef.current?.value);

    // 一覧、ソート項目、ソート種別を取得
    let tableData;
    let colmn = "";
    let kind = "";
    
    // ソート
    if (typeof reportList !== "undefined"
        && typeof sortColmn !== "undefined"
        && typeof sortKind !== "undefined") {
      tableData = reportList;
      colmn = sortColmn;
      kind = sortKind;

    // ソート解除
    } else if (typeof reportList !== "undefined"
        && typeof sortColmn === "undefined"
        && typeof sortKind === "undefined") {
      tableData = reportList;
    
    // 通常フィルタ
    } else {
      tableData = failureReportListDefault.concat();
      colmn = preSortColumn;
      kind = preSortKind;
    }
    if (!colmn) {
      //　ソートカラムが指定されていなければデフォルトのカラム（発生日）を設定
      colmn = "accrualDate";
    }
    if (kind === "asc") {
      getSortList(filterValKind,filterValGroup,filterValReportName,colmn,"ASC");
    } else {
      getSortList(filterValKind,filterValGroup,filterValReportName,colmn,"DESC");
    }
  }

  // スクロール-一覧
  const scrollList = useRef<HTMLDivElement>(null);

  // 一覧を最下部までスクロールで追加データ読み込み
  const scrollBottom = async() => {

    if (scrollList.current !== null) {
      // 一覧のスクロール分含めた全体の高さ
      const scrollAllHeight = scrollList.current.scrollHeight;
      // 一覧のスクロール分を含まない固定の高さ
      const scrollElemHeight = scrollList.current.scrollTop;
      // 一覧のスクロール値
      const scrollVal = scrollList.current.clientHeight;
      
      if (scrollVal >= (scrollAllHeight - scrollElemHeight)) {
        // 追加取得処理
        if(nextToken !== null && nextToken !== ""){
          // 種類フィルタ値
          const filterValKind = String(kindRef.current?.getAttribute("data-key"));
          // グループフィルタ値
          const filterValGroup = String(groupRef.current?.getAttribute("data-key"));
          // 報告書名フィルタ値
          const filterValReportName = String(reportNameRef.current?.value);
          getAdditionalSortList(filterValKind, filterValGroup,filterValReportName);
        }
      }
    } 
  }

  return (
    <div className="page03-contents">
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page03-page-title">報告書</p>

      <div className="page03-report-area">
        <div className="page03-filter-area">

          <div>
            <label>種類</label>
            <div
              onClick={dispKindList}
              ref={kindRef}
              data-key="00"
              id="page03-filter-kind"
            >
              すべて
            </div>
            
            <div className={kindListClassName}>
              <div className="page03-filter-kind-list">
                {kindList.map((kind) => {
                  return (
                    <div
                      className="page03-filter-kind"
                      onClick={clickKind}
                      data-key={kind.key}
                      data-value={kind.value}
                      key={kind.key}
                    >
                      <div>
                        {kind.value}
                      </div>
                    </div>
                  ) 
                })}    
              </div>
            </div>
          </div>

          <div>
            <label>グループ</label>
            <div
              onClick={dispGroupList}
              ref={groupRef}
              data-key="00"
              id="page03-filter-group"
            >
              すべて
            </div>

            <div className={groupListClassName}>
              <div className="page03-filter-group-list">
                {groupList.map((group) => {
                  return (
                    <div
                      className="page03-filter-group"
                      onClick={clickGroup}
                      data-key={group.key}
                      data-value={group.value}
                      key={group.key}
                    >
                      <div>
                        {group.value}
                      </div>
                    </div>
                  ) 
                })}    
              </div>
            </div>

          </div>
          <div>
            <img src="/images/magnifyingGlass.svg" alt="SVG" />
            <div>
              <input
                type="text"
                placeholder="報告書名"
                ref={reportNameRef}
                onChange={() => setFilter()}
              />
              <div className="page03-underline-filter"></div>
            </div>
          </div>
        </div>

        <table className="page03-report-table-header-area">
          <tr className="page03-report-table-header">
            <td>詳細</td>
            <td>
              種類
              <ComSortIcon
                preSortColumn={preSortColumn}
                preSortKind={preSortKind}
                columnName="kind"
                setSort={setSort}
              />
            </td>
            <td>番号</td>
            <td>報告書名</td>
            <td>
              グループ
              <ComSortIcon
                preSortColumn={preSortColumn}
                preSortKind={preSortKind}
                columnName="group"
                setSort={setSort}
              />
            </td>
            <td>
              発生日
              <ComSortIcon
                preSortColumn={preSortColumn}
                preSortKind={preSortKind}
                columnName="accrualDate"
                setSort={setSort}
              />
            </td>
          </tr>
        </table>

        <div className="page03-report-table-scroll" ref={scrollList} onScroll={() => scrollBottom()}>
          <table className="page03-report-table">
            {failureReportList.map((report) => {
              return (
                <tr className="page03-report-table-body" key={report.reportNo}>
                  <td>
                    <div  onClick={() => setKeyVal(report.reportNo,report.version,report.accrualDate)} data-key={report.reportNo}>
                      <ComDetail />
                    </div>
                  </td>
                  <td>{(kindList.find((kind) => kind.key === report.kind))?.value}</td>
                  <td>{report.reportNo}</td>
                  <td>
                    <span>
                      {report.reportName}
                    </span>
                    <span>
                      {report.reportName}
                    </span>
                  </td>
                  <td>{(groupList.find((group) => group.key === report.group))?.value}</td>
                  <td>
                    <div>
                      {report.accrualDate}
                    </div>
                    <div onClick={() => openDeleteModal(report.reportNo,report.version)}>
                      <ComDelete />
                    </div>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
      <div className="page03-button-area">
        <button onClick={() => setKeyVal("", 0, dayjs().format('YYYY/MM/DD'))} data-key={""}>
          <ComPlus/>
          新規作成
        </button>
      </div>

      <Modal isOpen={modal} className={modalClass} overlayClassName={modalOverlayClass} appElement={document.getElementById('root') || undefined}>
        <ReportModal
          updateKey={updateKey}
          accrualDate={accrualDate}
          setAccrualDate={setAccrualDate}
          closeModal={closeModal}
          openCalendar={openCalendar}
          registReport={registReport}
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

      <Modal isOpen={deleteModal} className="page03-delete-modal" overlayClassName="page03-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeDeleteModal}
          delete={deleteReport}
          modalText="消去しますか？"
        />
      </Modal>

      <Modal isOpen={calendar} className="com01-calendar-modal" overlayClassName="com01-calendar-overlay" appElement={document.getElementById('root') || undefined}>
        <CommonCalendar
          selectDate={accrualDate}
          closeCalendar={closeCalendar}
          setDate={setDate}
          isMentenanceReport={false}
        />
      </Modal>

      <Modal isOpen={fileDeleteModal} className="page03-delete-modal" overlayClassName="page03-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDeleteModal}
          delete={FileDelete}
          modalText="削除しますか？"
        />
      </Modal>

      <Modal isOpen={fileDuplicateModal} className="page03-delete-modal" overlayClassName="page03-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDuplicateModal}
          delete={deleteDuplicateFile}
          modalText="同名ファイルが選択されました。上書きしますか？"
        />
      </Modal>
    </div>
  );
};

export default FailureReport;
