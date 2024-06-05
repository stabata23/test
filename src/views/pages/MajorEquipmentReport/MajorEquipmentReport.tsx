import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./MajorEquipmentReport.css";
import {ReportModal, MajorEquipmentReportData} from "./ReportModal"
import {DeleteModal} from "./DeleteModal"
import {CommonCalendar} from "../../components/CommonCalendar/CommonCalender"
import comSortAsc from "../../components/CommonSort/CommonSortAsc"
import comSortDesc from "../../components/CommonSort/CommonSortDesc"
import ComSortIcon from "../../components/CommonSort/CommonSortIcon";
import ComPlus from "../../components/CommonIcon/CommonPlus";
import ComDetail from "../../components/CommonIcon/CommonDetail";
import ComDelete from "../../components/CommonIcon/CommonDelete";
import ComCheckBoxOff from "../../components/CommonIcon/CommonCheckBoxOff";
import ComCheckBoxOn from "../../components/CommonIcon/CommonCheckBoxOn";
import dayjs from "dayjs";
import { fetchAuthSession } from 'aws-amplify/auth';
import { setMenu } from "../../components/CommonMenu/CommonMenu";
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { Loading } from "../../components/CommonLoading/CommonLoading";
import { Sequence } from "../../hooks/Sequence";
import { FileManagement } from "../../hooks/FileManagement";
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 主要機器現状報告書一覧型
type MajorEquipmentReportList = {
  imo: string;
  seqNo:number;
  createDate: string;
  pendingWork: string;
  note: string;
  completeFlg: string;
  version:number;
}

export type UpdateKey = {
  seqNo:number;
  version:number;
}

// 主要機器現状報告画面
const MajorEquipmentReport: React.FC = () => {

  // 主要機器現状報告書一覧型
  const [majorEquipmentReportList, setMajorEquipmentReportList] = React.useState<MajorEquipmentReportList[]>([]);
  
  // 主要機器現状報告書一覧型（元データ保持用）
  const [majorEquipmentReportListDefault, setMajorEquipmentReportListDefault] = useState<MajorEquipmentReportList[]>([]);

  // 主要機器現状報告書一覧型（ソート後データ保持用）
  // const [majorEquipmentReportListSort, setMajorEquipmentReportListSort] = useState<MajorEquipmentReportList[]>([]);

  // データを一意に特定するキー
  const [updateKey, setUpdateKey] = useState<UpdateKey>({seqNo:0,version:0});
  
  // 報告書モーダルで表示する日付、YYYY/MM/DD形式
  const [createDate, setCreateDate] = useState(dayjs().format('YYYY/MM/DD'));

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
  const [modalClass, setModalClass] = useState("page02-report-modal");
  // 報告書モーダルオーバーレイクラス制御
  const [modalOverlayClass, setModalOverlayClass] = useState("page02-report-modal-overlay");

  // 前回ソート項目
  const [preSortColumn, setPreSortColumn] = useState("");
  // 前回ソート種別
  const [preSortKind, setPreSortKind] = useState("");
  const [identityId, setIdentityId] = useState<any>();
  // 2重初期処理防止
  const ignore = useRef(false);

  // ファイルタイプ
  const FILE_TYPE = "02" //主要機器現状報告書

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
      // 画面表示項目の取得
      getReportList();
      // メニューのセット
      setMenu("2");
    };

    return () => {
      ignore.current = true;
    };

    // eslint-disable-next-line
  }, []);
  // セッション情報取得
  const getSession = async () => {
    const {
      identityId,
    } = await fetchAuthSession();
    setIdentityId(identityId);
  };
  // データ取得・更新用のkeyをセット
  const setKeyVal = (seqNo: number, version:number, createDate:string) => {
    // keyをセット
    // const key = String(e.currentTarget.getAttribute("data-key"));
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
    let reportDefaultList = [...majorEquipmentReportListDefault];
    reportDefaultList.splice(0);
    let reportList = [...majorEquipmentReportList];
    reportList.splice(0);

    // 一覧データを取得
    isLoading.current = true;
    await client.models.MajorEquipmentReport.list({
      imo: getImo(),
    }).then(apiData=>{
      if("data" in apiData && apiData.data ){
        for (const item of apiData.data) {
          reportList.push({
              imo: item.imo
            , seqNo: item.seqNo
            , createDate: item.createDate
            , pendingWork: item.pendingWork!
            , note: item.note!
            , completeFlg: item.completeFlg
            , version:item.version!
          });
        }
      }
      isLoading.current = false;
    });
    reportDefaultList = reportList.concat();
    // 取得したデータを画面項目に設定
    setMajorEquipmentReportList(reportList);
    // 元データ表示用オブジェクトにもセット
    setMajorEquipmentReportListDefault(reportDefaultList);
  }

  // 報告書モーダルから渡ってきた報告書型オブジェクトを登録する
  const registReport = async(report: MajorEquipmentReportData) => {
    try {
      let errFlg = false;
      // const apiData = await client.graphql({query: getMajorEquipmentReport,
      //   variables: {
      //     imo: getImo(),
      //     seqNo: report.majorEquipmentReportDetail.seqNo
      //   }
      // });
      const apiData = await client.models.MajorEquipmentReport.get({
        imo: getImo(),
        seqNo: report.majorEquipmentReportDetail.seqNo
      });
      if ("data" in apiData && apiData.data ) {
        if (apiData.data.version !== report.majorEquipmentReportDetail.version) {
          console.error("排他エラー");
          errFlg = true;
        } else {
          const data = {
            imo: getImo(),
            seqNo: report.majorEquipmentReportDetail.seqNo,
            createDate: report.majorEquipmentReportDetail.createDate,
            pendingWork:report.majorEquipmentReportDetail.pendingWork,
            note: report.majorEquipmentReportDetail.note,
            fileName: report.majorEquipmentReportDetail.fileNames.join(','),
            updateUser:"UpdateUser", //TODO ログインユーザーを設定する
            version:report.majorEquipmentReportDetail.version + 1
          };
          await client.models.MajorEquipmentReport.update(data);
        }
      } else {
        // seqNoを取得
        // const res = await client.graphql({query: getSequence,
        //   variables: {
        //     imo: getImo(),
        //     seqPrefix:"MajorEquipmentReport" // TODO 正式決定したら修正
        //   }
        // });
        const res = await client.models.Sequence.get({
          imo: getImo(),
          seqPrefix:"MajorEquipmentReport" // TODO 正式決定したら修正
        });
        if ("data" in res && res.data ) {
          // 登録処理
          const data = {
            imo: getImo(),
            seqNo: Number(res.data.currentValue),
            createDate: report.majorEquipmentReportDetail.createDate,
            pendingWork:report.majorEquipmentReportDetail.pendingWork,
            note: report.majorEquipmentReportDetail.note,
            completeFlg: "0",
            fileName: report.majorEquipmentReportDetail.fileNames.join(','),
            reportCreateUser:"CreateUser", //TODO ログインユーザーを設定する
            reportUpdateUser:"CreateUser", //TODO ログインユーザーを設定する
            version:1
          };
          client.models.MajorEquipmentReport.create(data);
          updateNextSequence("MajorEquipmentReport");// TODO 正式決定したら修正
        } else {
          console.error("採番エラー");
          errFlg = true;
        }
      }
      if(!errFlg){
        // ファイルアップロード
        uploadFile(report.majorEquipmentReportDetail.fileNames, report.file , String(report.majorEquipmentReportDetail.seqNo) ,FILE_TYPE);
        // fileUpload(
        //   report.majorEquipmentReportDetail.fileNames
        //   , report.file
        //   , getImo()
        //   , report.majorEquipmentReportDetail.seqNo
        // );
        // 報告書モーダルを閉じる
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

  // チェック状況のUPDATE
  const onCheck = async(seqNo:number, version:number) => {
    
    // 更新用のkeyを取得
    try {
      await client.models.MajorEquipmentReport.get({
        imo: getImo(),
        seqNo: seqNo
      })
      .then(apiData=>{
        if ("data" in apiData && apiData.data) {
          if (apiData.data.version !== version) {
            console.error("排他エラー");
            return;
          } else {
            const data = {
              imo: getImo(),
              seqNo: seqNo,
              completeFlg:apiData.data.completeFlg==="0"?"1":"0",
              reportUpdateUser:"CreateUser", //TODO ログインユーザーを設定する
              version:apiData.data.version + 1
            };
            client.models.MajorEquipmentReport.update(data);
            const dispData = [...majorEquipmentReportList];
            dispData.map((item) => {
              if (item.seqNo === seqNo) {
                item.completeFlg = data.completeFlg!;
                item.version = data.version!;
                return item;
              }
            });
            // 取得したデータを画面項目に設定
            setMajorEquipmentReportList([]);
            setMajorEquipmentReportList(dispData);
        
            // 元データ表示用オブジェクトにもセット
            setMajorEquipmentReportListDefault([]);
            setMajorEquipmentReportListDefault(dispData)
            // getReportList();
          }
        }
      });
    } catch (error) {
       console.error(error);
       return;
    }
    // 再取得処理
    // getReportList();
  };

  // カレンダーモーダルで選択した日付セット
  const setDate = (selectDate: string) => {
    // 選択日付をセット
    setCreateDate(selectDate);

    // カレンダーモーダルを閉じる
    closeCalendar();
  }

  // 報告書削除
  const deleteReport = async() => {
    
    // 削除処理
    try{
      const data = {
        imo: getImo(),
        seqNo: updateKey!.seqNo,
      };
      await client.models.MajorEquipmentReport.delete(data);
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
    setMajorEquipmentReportList([]);

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
      setMajorEquipmentReportList(majorEquipmentReportListDefault);
    } else {
      // 昇降順判定
      let sortTable: MajorEquipmentReportList[];
      if (sortKind === "asc") {
        // 昇順ソート
        sortTable = sortAsc(majorEquipmentReportListDefault.concat(), columnName);
      } else {
        // 降順ソート
        sortTable = sortDesc(majorEquipmentReportListDefault.concat(), columnName);
      }

      // ソート項目の保持
      setPreSortColumn(columnName);
      // ソート項目の保持
      setPreSortKind(sortKind);

      // ソート結果を画面にセット
      setMajorEquipmentReportList(sortTable);
    }
  }

  // 昇順ソート
  const sortAsc = (sortTable: MajorEquipmentReportList[], columnName: string) => {
    return sortTable.sort((a, b) => comSortAsc(columnName as keyof MajorEquipmentReportList, a, b));
  }

  // 降順ソート
  const sortDesc = (sortTable: MajorEquipmentReportList[], columnName: string) => {
    return sortTable.sort((a, b) => comSortDesc(columnName as keyof MajorEquipmentReportList, a, b));
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
      }
    }
      
  }

  return (
    <div className="page02-contents">
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page02-page-title">主要機器現状報告書</p>

      <div className="page02-report-area">
        <table className="page02-report-table-header-area">
          <tr className="page02-report-table-header">
            <td>詳細</td>
            <td>
              記入日
              <ComSortIcon
                preSortColumn={preSortColumn}
                preSortKind={preSortKind}
                columnName="createDate"
                setSort={setSort}
              />
            </td>
            <td>保留作業</td>
            <td>備考</td>
            <td>
              完了
              <ComSortIcon
                preSortColumn={preSortColumn}
                preSortKind={preSortKind}
                columnName="completeFlg"
                setSort={setSort}
              />
            </td>
          </tr>
        </table>

        <div className="page02-report-table-scroll" ref={scrollList} onScroll={() => scrollBottom()}>
          <table className="page02-report-table">
            {majorEquipmentReportList.map((report) => {
              return (
                <tr className="page02-report-table-body" key={report.seqNo}>
                  <td>
                    <div onClick={() => setKeyVal(report.seqNo, report.version, report.createDate)} data-key={report.seqNo}>
                      <ComDetail />
                    </div>
                  </td>
                  <td>{report.createDate}</td>
                  <td>
                    <span>{report.pendingWork}</span>
                    <span>{report.pendingWork}</span>
                  </td>
                  {report.note.length > 30 ? (
                    <td className="page02-note-hover-long">
                      <span>{report.note}</span>
                      <span>{report.note}</span>
                    </td>
                  ) : (
                    <td className="page02-note-hover">
                      <span>{report.note}</span>
                      <span>{report.note}</span>
                    </td>
                  )}
                  <td>
                    <div>
                      {report.completeFlg === "1" ? (
                        <div onClick={() => onCheck(report.seqNo,report.version)}>
                          <ComCheckBoxOn />
                        </div>
                      ) : (
                        <div className="page02-hover" onClick={() => onCheck(report.seqNo,report.version)}>
                          <ComCheckBoxOff />
                        </div>
                      )}
                    </div>
                    <div onClick={() => openDeleteModal(report.seqNo,report.version)} data-key={report.seqNo}>
                      <ComDelete />
                    </div>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
      <div className="page02-button-area">
        <button onClick={() => setKeyVal(0,0, dayjs().format('YYYY/MM/DD'))} data-key={""}>
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

      <Modal isOpen={deleteModal} className="page02-delete-modal" overlayClassName="page02-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
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

      <Modal isOpen={fileDeleteModal} className="page02-delete-modal" overlayClassName="page02-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDeleteModal}
          delete={deleteFile}
          modalText="削除しますか？"
        />
      </Modal>

      <Modal isOpen={fileDuplicateModal} className="page02-delete-modal" overlayClassName="page02-delete-modal-overlay" appElement={document.getElementById('root') || undefined}>
        <DeleteModal
          closeModal={closeFileDuplicateModal}
          delete={deleteDuplicateFile}
          modalText="同名ファイルが選択されました。上書きしますか？"
        />
      </Modal>
    </div>
  );
};

export default MajorEquipmentReport;
