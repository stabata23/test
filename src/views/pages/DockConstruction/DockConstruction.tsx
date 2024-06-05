import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./DockConstruction.css";
import {ReportModal,DockConstructionReportData} from "./ReportModal"
import {DeleteModal} from "./DeleteModal"
import {CommonCalendar} from "../../components/CommonCalendar/CommonCalender"
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
import { assert } from "console";
import { FileManagement } from "../../hooks/FileManagement";
import { Sequence } from "../../hooks/Sequence";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 入渠工事仕様書一覧型
type DockConstructionReportList = {
  imo:string;
  seqNo: number;
  kind: string;
  createDate: string;
  reportName: string;
  version:number;
}

// 入渠工事仕様書型
export type DockConstructionReportDetail = {
  seqNo: number;
  kind: string;
  createDate: string;
  reportName: string;
  fileNames: string[];
  createUser: string;
  updateUser: string;
  version:number;
}

export type ListKey = {
  key: string;
  value: string
}
export type UpdateKey = {
  seqNo:number;
  version:number;
}
export const kindList:ListKey[] = [];

// 入渠工事画面
const DockConstruction: React.FC = () => {

  // DBから取ってくる？
  // const kindList = ["すべて", "種類01", "種類02"];

  // 入渠工事仕様書一覧型
  const [dockConstructionReportList, setDockConstructionReportList] = useState<DockConstructionReportList[]>([]);

  // 入渠工事仕様書一覧型（元データ保持用）
  const [dockConstructionReportListDefault, setDockConstructionReportListDefault] = useState<DockConstructionReportList[]>([]);

  // データを一意に特定するキー
  const [updateKey, setUpdateKey] = useState<UpdateKey>({seqNo:0,version:0});
  
  // 入渠工事仕様書モーダルで表示する日付、YYYY/MM/DD形式
  const [createDate, setCreateDate] = useState(dayjs().format('YYYY/MM/DD'));

  // 入渠工事仕様書モーダル表示制御
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
  
  // 入渠工事仕様書モーダルクラス制御
  const [modalClass, setModalClass] = useState("page04-report-modal");
  // 入渠工事仕様書モーダルオーバーレイクラス制御
  const [modalOverlayClass, setModalOverlayClass] = useState("page04-report-modal-overlay");

  // 前回ソート項目
  const [preSortColumn, setPreSortColumn] = useState("");
  // 前回ソート種別
  const [preSortKind, setPreSortKind] = useState("");

  // 種類セレクトボックス
  const kindRef = useRef<HTMLInputElement>(null);
  // 報告書名インプットボックス
  const reportNameRef = useRef<HTMLInputElement>(null);

  // 種類セレクトボックスClassName
  const [kindListClassName, setKindListClassName] = React.useState("page04-filter-kind-list-area-none");

  // 2重初期処理防止
  const ignore = useRef(false);

  const [identityId, setIdentityId] = useState<any>();
  
  const FILE_TYPE = "04" //入渠工事仕様書

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
      getSelectionList();
      // 画面表示項目の取得
      getReportList();
      // メニューのセット
      setMenu("4");
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);

  // データ更新時に再フィルター
  useEffect(() => {
    setFilter();
  // eslint-disable-next-line
  }, [dockConstructionReportListDefault]);

  // セッション情報取得
  const getSession = async () => {
    const {
      identityId,
    } = await fetchAuthSession();
    setIdentityId(identityId);
  };

  //選択リスト取得
  const getSelectionList = async () => {
    // 一覧データを取得
    if (kindList.length < 1 ) {
      // await client.graphql({query: listCodeMasters,
      //   variables: {
      //     codeName: "DockConstructionKindList", // kindList TODO 仮
      // }})
      await client.models.CodeMaster.list({
        codeName: "DockConstructionKindList", // kindList TODO 仮
      }).then(apiData=>{
        console.log(apiData);
        if("data" in apiData &&  apiData.data ){
          for (const item of apiData.data) {
            kindList.push({
                key: item.value
              , value: item.valueName
            });
          }
        }
      });
    }
  }

  // データ取得・更新用のkeyをセット
  const setKeyVal = (seqNo: number, version:number, createDate:string) => {
    // keyをセット
    setUpdateKey({
      seqNo:seqNo,
      version:version
    });
    setCreateDate(createDate);
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
    setCreateDate(dayjs().format('YYYY/MM/DD'));
  };

  // 削除モーダル表示
  const openDeleteModal = (seqNo: number, version:number) => {
    // 削除用のキー値セット
    setUpdateKey({
      seqNo:seqNo,
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
    setDockConstructionReportList([]);

    // 一覧データのクリア
    let reportDefaultList = [...dockConstructionReportListDefault];
    reportDefaultList.splice(0);
    let reportList = [...dockConstructionReportList];
    reportList.splice(0);

    // 一覧データを取得
    isLoading.current = true;
    // await client.graphql({query: listDockConstructionReports,
    //   variables: {
    //     imo: getImo(),
    //   }
    // })
    await client.models.DockConstructionReport.list({
      imo: getImo()
    }).then(apiData => {
      if ("data" in apiData && apiData.data ) {
        for (const item of apiData.data) {
          reportList.push({
             imo: item.imo
            , seqNo: item.seqNo
            , kind: item.kind
            , reportName: item.reportName!
            , createDate: item.createDate
            , version:item.version!
          });
        }
      }
    });
    reportDefaultList = reportList.concat();

    setDockConstructionReportList([]);
    setDockConstructionReportList(reportList);

    setDockConstructionReportListDefault([]);
    setDockConstructionReportListDefault(reportDefaultList);
    isLoading.current = false;
  }

  // 入渠工事仕様書モーダルから渡ってきた入渠工事仕様書型オブジェクトを登録する
  const registReport = async(report: DockConstructionReportData) => {
    try{
      let errFlg = false;
      // const apiData = await client.graphql({query: getDockConstructionReport,
      //   variables: {
      //     imo: getImo(),
      //     seqNo: Number(report.dockConstructionReportDetail.seqNo)
      //   }
      // });
      const apiData = await client.models.DockConstructionReport.get({
        imo: getImo(),
        seqNo: Number(report.dockConstructionReportDetail.seqNo)
      })
      if ("data" in apiData && apiData.data ) {
        if (apiData.data.version !== report.dockConstructionReportDetail.version) {
          console.error("排他エラー");
          errFlg = true;
        } else {
          const data = {
            imo: getImo(),
            seqNo: Number(report.dockConstructionReportDetail.seqNo),
            kind:report.dockConstructionReportDetail.kind,
            reportName: report.dockConstructionReportDetail.reportName,
            createDate: report.dockConstructionReportDetail.createDate,
            fileName: report.dockConstructionReportDetail.fileNames.join(','),
            updateUser:"UpdateUser", //TODO ログインユーザーを設定する
            version:report.dockConstructionReportDetail.version + 1
          };
          await client.models.DockConstructionReport.update(data);
        }
      } else {
          // 登録処理
          const data = {
            imo: getImo(),
            seqNo: Number(report.dockConstructionReportDetail.seqNo),
            kind:report.dockConstructionReportDetail.kind,
            reportName: report.dockConstructionReportDetail.reportName,
            createDate: report.dockConstructionReportDetail.createDate,
            fileName: report.dockConstructionReportDetail.fileNames.join(','),
            createUser:"CreateUser", //TODO ログインユーザーを設定する
            updateUser:"CreateUser", //TODO ログインユーザーを設定する
            version:1
          };
          await client.models.DockConstructionReport.create(data);
          // 採番する
          updateNextSequence("DockConstructionReport");
      }
      if (!errFlg) {
        // ファイルアップロード
        uploadFile(report.dockConstructionReportDetail.fileNames, report.file , 
          String(report.dockConstructionReportDetail.seqNo) ,FILE_TYPE);
        // fileUpload(
        //   report.dockConstructionReportDetail.fileNames
        //   , report.file
        //   , getImo()
        //   , String(report.dockConstructionReportDetail.seqNo)
        // );

        // 入渠工事仕様書モーダルを閉じる
        closeModal();
        setCreateDate(dayjs().format('YYYY/MM/DD'));
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
    setCreateDate(selectDate);

    // カレンダーモーダルを閉じる
    closeCalendar();
  }

  // 入渠工事仕様書削除
  const deleteReport = async() => {
    // 削除処理
    try {
      const data = {
        imo: getImo(),
        seqNo: Number(updateKey.seqNo)
      };
      client.models.DockConstructionReport.delete(data);
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
    // 一覧の初期化
    setDockConstructionReportList([]);

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
      setFilter(dockConstructionReportListDefault);
    } else {
      // 昇降順判定
      let sortTable: DockConstructionReportList[];
      if (sortKind === "asc") {
        // 昇順ソート
        sortTable = sortAsc(dockConstructionReportListDefault.concat(), columnName);
      } else {
        // 降順ソート
        sortTable = sortDesc(dockConstructionReportListDefault.concat(), columnName);
      }

      // ソート項目の保持
      setPreSortColumn(columnName);
      // ソート項目の保持
      setPreSortKind(sortKind);

      // フィルタ処理
      setFilter(sortTable, columnName, sortKind);
    }
  }

  // 昇順ソート
  const sortAsc = (sortTable: DockConstructionReportList[], columnName: string) => {
    return sortTable.sort((a, b) => comSortAsc(columnName as keyof DockConstructionReportList, a, b));
  }

  // 降順ソート
  const sortDesc = (sortTable: DockConstructionReportList[], columnName: string) => {
    return sortTable.sort((a, b) => comSortDesc(columnName as keyof DockConstructionReportList, a, b));
  }

  // 種類リスト表示
  const dispKindList = () => {
    setKindListClassName("page04-filter-kind-list-area");
    window.addEventListener("mouseup", hiddenKindList, {once: true});
  };
  // 種類リスト非表示
  const hiddenKindList = () => {
    setKindListClassName("page04-filter-kind-list-area-none");
  }
  // 種類のセット
  const clickKind = (e: React.MouseEvent<HTMLElement>) => {
    if (kindRef.current !== null) {
      kindRef.current.textContent = (String(e.currentTarget.getAttribute("data-value")));
      kindRef.current.setAttribute("data-key", String(e.currentTarget.getAttribute("data-key")));
      setFilter();
    }
  }

  // フィルタ処理
  const setFilter = (reportList?: DockConstructionReportList[], sortColmn?: string, sortKind?: string) => {
    // 種類フィルタ値
    let filterValKind = String(kindRef.current?.getAttribute("data-key"));
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
      tableData = dockConstructionReportListDefault.concat();
      colmn = preSortColumn;
      kind = preSortKind;
    }

    // フィルタに入力ありの場合
    let filterTableData: DockConstructionReportList[] = tableData;
    if (filterValKind !== "00"
        || filterValReportName !== "") {
      // フィルタ処理
      filterTableData = [];
      for (const rowData of tableData) {
        // フィルタ対象のテーブル項目値を取得
        const colDataKind = rowData.kind;
        const colDataReportName = rowData.reportName;
        
        // フィルタ入力値がテーブル項目に一致するかチェック
        let pushFlgKind = false;
        let pushFlgReportName = false;

        // 種類
        if (filterValKind === "00") {
          pushFlgKind = true;
        } else if (colDataKind === filterValKind) {
          pushFlgKind = true;
        }

        // 報告書名
        if (filterValReportName === "") {
          pushFlgReportName = true;
        } else if (colDataReportName.indexOf(filterValReportName) > -1) {
          pushFlgReportName = true;
        }

        // 一致があった場合は追加
        if (pushFlgKind && pushFlgReportName) {
          filterTableData.push(rowData);
        }
      }
    }
    // フィルタした一覧を画面表示
    if (kind === "asc") {
      setDockConstructionReportList(sortAsc(filterTableData, colmn));
    } else if (kind === "desc") {
      setDockConstructionReportList(sortDesc(filterTableData, colmn));
    } else {
      setDockConstructionReportList(filterTableData);
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
        // TODO 追加のデータを持ってくる処理をよぶ

        // TODO 以下記載は仮のため、のちに削除すること
        // ローディングオン
        isLoading.current = true;
        const addDataList = dockConstructionReportList.concat();
        const addDataList2 = dockConstructionReportList.concat();
        setDockConstructionReportList([]);
        setDockConstructionReportList(addDataList2);
        let reportList = [...dockConstructionReportList];
        await client.models.DockConstructionReport.list({
          imo: getImo(),
        })
        .then(apiData => {
          for (let i=0; i<10; i++) {
            const addData: DockConstructionReportList = {
              imo: "add01",
              seqNo: i,
              kind: "01",
              createDate: "xxxx/xx/xx",
              reportName: "addData"+i,
              version:i
            }
            addDataList.push(addData)
          }
          
          setDockConstructionReportList(addDataList)
          // ローディングオフ
          isLoading.current = false;
          // TODO ここまで削除する
        });
      }
    }
      
  }

  return (
    <div className="page04-contents">
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page04-page-title">入渠工事</p>

      <div className="page04-report-area">
        <div className="page04-filter-area">

          <div>
            <label>種類</label>
            <div
              onClick={dispKindList}
              ref={kindRef}
              data-key="00"
              id="page04-filter-kind"
            >
              すべて
            </div>
            
            <div className={kindListClassName}>
              <div className="page04-filter-kind-list">
                {kindList.map((kind) => {
                  return (
                    <div
                      className="page04-filter-kind"
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
            <img src="/images/magnifyingGlass.svg" alt="SVG" />
            <div>
              <input
                type="text"
                placeholder="書類名"
                ref={reportNameRef}
                onChange={() => setFilter()}
              />
              <div className="page04-underline-filter"></div>
            </div>
          </div>
        </div>

        <table className="page04-report-table-header-area">
          <tr className="page04-report-table-header">
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
            <td>
              作成日
              <ComSortIcon
                preSortColumn={preSortColumn}
                preSortKind={preSortKind}
                columnName="createDate"
                setSort={setSort}
              />
            </td>
            <td>書類名</td>
          </tr>
        </table>

        <div className="page04-report-table-scroll" ref={scrollList} onScroll={() => scrollBottom()}>
          <table className="page04-report-table">
            {dockConstructionReportList.map((report) => {
              return (
                <tr className="page04-report-table-body" key={report.seqNo}>
                  <td>
                    <div onClick={() => setKeyVal(report.seqNo,report.version,report.createDate)} >
                      <ComDetail />
                    </div>
                  </td>
                  <td>{(kindList.find((kind) => kind.key === report.kind))?.value}</td>
                  <td>{report.createDate}</td>
                  <td>
                    <div>
                      <span>{report.reportName}</span>
                      <span>{report.reportName}</span>
                    </div>
                    <div onClick={() => openDeleteModal(report.seqNo,report.version)}>
                      <ComDelete />
                    </div>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
      <div className="page04-button-area">
        <button onClick={() => setKeyVal(0, 0, dayjs().format('YYYY/MM/DD'))} data-key={""}>
          <ComPlus/>
          新規作成
        </button>
      </div>

      <Modal isOpen={modal} className={modalClass} overlayClassName={modalOverlayClass} appElement={document.getElementById('root') || undefined}>
        <ReportModal
          updateKey={updateKey}
          createDate={createDate}
          setCreateDate={setCreateDate}
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

      <Modal isOpen={deleteModal} className="page04-delete-modal" overlayClassName="page04-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeDeleteModal}
          delete={deleteReport}
          modalText="消去しますか？"
        />
      </Modal>

      <Modal isOpen={calendar} className="com01-calendar-modal" overlayClassName="com01-calendar-overlay" appElement={document.getElementById('root') || undefined}>
        <CommonCalendar
          selectDate={createDate}
          closeCalendar={closeCalendar}
          setDate={setDate}
          isMentenanceReport={false}
        />
      </Modal>

      <Modal isOpen={fileDeleteModal} className="page04-delete-modal" overlayClassName="page04-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDeleteModal}
          delete={deleteFile}
          modalText="削除しますか？"
        />
      </Modal>

      <Modal isOpen={fileDuplicateModal} className="page04-delete-modal" overlayClassName="page04-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDuplicateModal}
          delete={deleteDuplicateFile}
          modalText="同名ファイルが選択されました。上書きしますか？"
        />
      </Modal>
    </div>
  );
};

export default DockConstruction;
