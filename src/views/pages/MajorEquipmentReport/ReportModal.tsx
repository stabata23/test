import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import "./ReportModal.css";
import ComFilePicker from "../../components/CommonIcon/CommonFilePicker";
import { UpdateKey } from "../MajorEquipmentReport/MajorEquipmentReport";

import { useSessionData } from "../../components/CommonSession/CommonSession";
import ComDelete from "../../components/CommonIcon/CommonDelete";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 親コンポーネントから持ち回る値
export type Props = {
  updateKey: UpdateKey;
  createDate: string;
  setCreateDate: (createDate: string) => void;
  closeModal: () => void;
  openCalendar: () => void;
  registReport: (majorEquipmentReport: MajorEquipmentReportData) => void;
  openFileDeleteModal: () => void;
  isFileDelete: boolean;
  setIsFileDelete: (isFileDelete: boolean) => void;
  openFileDuplicateModal: () => void;
  isDuplicateFile: boolean;
  setIsDuplicateFile: (isDuplicateFile: boolean) => void;
  isDuplicateFileDelete: boolean;
  setIsDuplicateFileDelete: (isDuplicateFileDelete: boolean) => void;
};

export type MajorEquipmentReportData = {
  majorEquipmentReportDetail: MajorEquipmentReportDetail;
  file: File[]|null;
}

// 報告書型
export type MajorEquipmentReportDetail = {
  seqNo: number;
  createDate: string;
  pendingWork: string;
  note: string;
  fileUrls: string[];
  fileNames: string[];
  createUser: string;
  updateUser: string;
  version:number;
}

// 主要機器現状報告書画面-報告書モーダル
export const ReportModal: React.FC<Props> = props => {

  // 更新キー
  // propsでくる
  // const [key, setKey] = useState("");

  // 担当者
  const [maintenanceUser, setMaintenanceUser] = useState("");
  // 保留作業
  const [pendingWork, setPendingWork] = useState("");
  // 備考
  const [note, setNote] = useState("");
  // ファイル
  type MajorEquipmentReportFile = {
    // file: File;
    fileName: string;
    fileUrl: string;
    isDownloadable: boolean
  }
  const [file, setFile] = useState<MajorEquipmentReportFile[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  // 作成者
  const [createUser, setCreateUser] = useState("");
  // 更新者
  const [updateUser, setUpdateUser] = useState("");
  // seqNo
  const [seqNo, setSeqNo] = useState(0);
  // version
  const [version, setVersion] = useState(0);
  // ファイル選択コントロールref
  const attachRef = useRef<HTMLInputElement>(null);

  // 削除用ファイルリスト
  const fileList = useRef<any[]>();
  // 削除対象ファイルインデックス
  const targetNum = useRef<number>();

  // 選択ファイル全量リスト
  const allSelectFileList = useRef<MajorEquipmentReportFile[]>([]);
  // 選択ファイルリスト（重複削除）
  const notDupSelectFileList = useRef<MajorEquipmentReportFile[]>([]);
  // 登録済ファイルリスト（重複削除）
  const deleteDupFileList = useRef<MajorEquipmentReportFile[]>([]);

  // 担当者セレクトボックス
  const maintenanceUserRef = useRef<HTMLInputElement>(null);
  // 担当者セレクトボックスClassName
  const [maintenanceUserListClassName, setMaintenanceUserListClassName] = React.useState("page02-maintenance-user-list-area-none");
  // 担当者リスト TODO 一旦ベタ
  type maintenanceUserType = {
    userId: string;
    userName: string;
  }
  const maintenanceUserList: maintenanceUserType[] = [
    {
      userId: "01"
      , userName: "担当者01"
    }
    , {
      userId: "02"
      , userName: "担当者02"     
    }
    , {
      userId: "03"
      , userName: "担当者03"
    }
  ];

  // validation
  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: {
      errors,
      isValid
    }
  } = useForm({ mode: "onChange"});

  // セッションカスタムhook
  const { getImo } = useSessionData();
     
  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 報告書項目の取得
      getReportDetail();
    };

    return () => {
      ignore.current = true;
    };

    // eslint-disable-next-line
  }, []);

  // カレンダーから作成日が変更された場合のチェック実施
  useEffect(() => {
    setValue("createDate", props.createDate)
    trigger("createDate");
  
  // eslint-disable-next-line
  }, [props.createDate]);

  // 報告書項目の取得
  const getReportDetail = async() => {
    // propsのkeyを使用し、DBからデータ取得
    setCreateUser("dffas_plus12");
    setUpdateUser("dffas_plus12");
    await client.models.MajorEquipmentReport.get({
      imo: getImo(),
      seqNo: Number(props.updateKey.seqNo)
    })
    .then(res=>{
      if("data" in res && res.data ){
        setPendingWork(res.data.pendingWork!);
        setNote(res.data.note!);
        if (null !== res.data.fileName
            && undefined !== res.data.fileName
            && "" !== res.data.fileName) {
          const registeredFiles: MajorEquipmentReportFile[] = [];
          const fileDatas: string[] = res.data.fileName!.split(",");
          for (let i = 0; i < fileDatas.length; i++) {
            const registeredFile: MajorEquipmentReportFile = {
              fileName: fileDatas[i],
              fileUrl: "", // TODO ファイルURLはどこから取得できる？
              isDownloadable: true
            };
            // TODO 「files」は必要？props.registに渡している
            registeredFiles.push(registeredFile);
          }
          setFile(registeredFiles);
        }
        setCreateUser(res.data.createUser!);
        setUpdateUser(res.data.updateUser!);
        setSeqNo(props.updateKey.seqNo);
        setVersion(props.updateKey.version);
      }
    });
  }

  // 報告書データの登録
  const registReport = () => {

    // 登録用の値をセット
    // 更新者とかは共通エリアから取得する？
    // TODO バックエンド修正後に担当者も以下に加える
    const majorEquipmentReportDetail: MajorEquipmentReportDetail = {
        seqNo: seqNo
      , createDate: props.createDate
      , pendingWork: pendingWork
      , note: note
      , fileUrls: file.map(file => file.fileUrl)
      , fileNames: file.map(file => file.fileName)
      , createUser: createUser
      , updateUser: updateUser
      , version: version
    }

    // 登録処理
    props.registReport({majorEquipmentReportDetail:majorEquipmentReportDetail,
    file:files});
  }

  // 日付形式チェック
  const checkDateType = (date: string) => {
    if (date === undefined) { 
      date = props.createDate;
    }
    const month = date.substring(5, 7);
    const checkDate = new Date(date);
    if (!isNaN(checkDate.getDate())) {
      if (checkDate.getMonth() + 1 === Number(month)) {
        return true;
      }
    }
    return false;
  }

  // 非表示のfilePickerを選択する
  const clickFilePicker = () => {
    // filePickerをクリック
    attachRef.current?.click();
  }

  // filePickerでファイル選択時の処理
  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      // 選択ファイルがない場合は処理終了
      if (e.target.files.length === 0) {
        return;
      }

      // 選択ファイル名のリスト
      let fileNameList = file.map(fl => fl.fileName);
      // 選択ファイル全量リスト
      let tmpAllSelectFileList: MajorEquipmentReportFile[] = [];
      // 選択ファイルから、重複を抜いたリスト
      let tmpNotDupSelectFileList: MajorEquipmentReportFile[] = [];
      // 重複フラグ
      let duplicateFlg = false;

      // ファイル名重複チェック
      for (let i = 0; i < e.target.files.length; i++) {
        // 登録済ファイルに重複があった場合は、重複フラグオン
        if (fileNameList.includes(e.target.files[i].name)) {
          duplicateFlg = true;
        } else {
          // 選択ファイルから重複を除いたデータを作成
          const notDupData: MajorEquipmentReportFile = {
            fileName: e.target.files[i].name,
            fileUrl: window.URL.createObjectURL(e.target.files[i]),
            isDownloadable: false
          };
          tmpNotDupSelectFileList.push(notDupData);
        }
        // 選択ファイル全量リスト用のデータ作成
        const fileData: MajorEquipmentReportFile = {
          fileName: e.target.files[i].name,
          fileUrl: window.URL.createObjectURL(e.target.files[i]),
          isDownloadable: false
        };
        tmpAllSelectFileList.push(fileData);
      }

      // 同名ファイルありの場合
      if (duplicateFlg) {
        // 重複ファイル上書き用リストの作成
        let selectFileNameList: string[] = [];
        for (let i = 0; i < e.target.files.length; i++) {
          selectFileNameList.push(e.target.files[i].name);
        }
        let tmpDeleteDupFileList: MajorEquipmentReportFile[] = [];
        // 登録済ファイルの中から、選択ファイル名と一致していないものを抜き出す
        for (let i = 0; i < file.length; i++) {
          if (!selectFileNameList.includes(file[i].fileName)) {
            tmpDeleteDupFileList.push(file[i]);
          }
        }

        allSelectFileList.current = tmpAllSelectFileList;
        notDupSelectFileList.current = tmpNotDupSelectFileList;
        deleteDupFileList.current = tmpDeleteDupFileList;
        props.openFileDuplicateModal();

      } else {
        // 同名ファイルなしの場合
        // 選択したファイルを取得
        let tmpFile = [...file];
        for (let i = 0; i < e.target.files.length; i++) {
          const pushFile: MajorEquipmentReportFile = {
            fileName: e.target.files[i].name,
            fileUrl: window.URL.createObjectURL(e.target.files[i]),
            isDownloadable: false
          };
          tmpFile.push(pushFile);
        }
        setFile(tmpFile);
      }
    }
  }

  // ファイル重複検知
  useEffect(() => {
    // ファイル削除判定
    if (props.isDuplicateFile) {
      setDuplicateFile();
    };
  }, [props.isDuplicateFile]);

  // 重複ファイルのセット処理
  const setDuplicateFile = () => {
    let tmpFiles: MajorEquipmentReportFile[] = [];
    
    // 重複ファイル上書きの場合
    if (props.isDuplicateFileDelete) {
      tmpFiles = Array.prototype.concat(deleteDupFileList.current, allSelectFileList.current);
    } else {
      tmpFiles = Array.prototype.concat(file, notDupSelectFileList.current);
    }
    // 作成したファイルリストを設定
    setFile(tmpFiles);

    // 重複ファイルリストを空にする
    allSelectFileList.current = [];
    notDupSelectFileList.current = [];
    deleteDupFileList.current = [];
    props.setIsDuplicateFile(false);
    props.setIsDuplicateFileDelete(false);
  }

  // ファイル削除モーダル表示
  const openFileDeleteModal = (e: React.MouseEvent<HTMLElement>) => {
    // 押下したファイルの番号を特定
    fileList.current = Array.prototype.slice.call(e.currentTarget.parentElement?.parentElement?.getElementsByTagName("span"));
    targetNum.current = fileList.current?.findIndex(idx => idx === e.currentTarget);
    props.openFileDeleteModal();
  }

  // ファイル削除検知
  useEffect(() => {
    // ファイル削除判定
    if (props.isFileDelete) {
      deleteFile();
    };
  }, [props.isFileDelete]);

  // ファイル削除
  const deleteFile = () => {
    // 対象ファイルを除いた配列を作成
    if (undefined !== targetNum.current) {
      const newFiles = [...file];
      newFiles.splice(targetNum.current, 1);
      setFile(newFiles);

    }
    props.setIsFileDelete(false);
  }

  // ファイルダウンロード
  const fileDownload = (e: React.MouseEvent<HTMLElement>) => {
    // ファイルの一覧取得
    const downloadFileList = Array.prototype.slice.call(e.currentTarget.parentElement?.parentElement?.getElementsByTagName("p"));
    // 押下した対象ファイルの番号取得
    const downloadFileNum = downloadFileList.findIndex(idx => idx === e.currentTarget);
    
    // TODO APIを呼ぶように修正
    alert("ダウンロード index:" + downloadFileNum)
  }

  // 担当者リスト表示
  const dispMaintenanceUserList = () => {
    setMaintenanceUserListClassName("page02-maintenance-user-list-area");
    window.addEventListener("mouseup", hiddenMaintenanceUserList, {once: true});
  };
  // 担当者リスト非表示
  const hiddenMaintenanceUserList = () => {
    setMaintenanceUserListClassName("page02-maintenance-user-list-area-none");
  }

  // 担当者のセット
  const clickMaintenanceUser = (e: React.MouseEvent<HTMLElement>) => {
    if (maintenanceUserRef.current !== null) {
      maintenanceUserRef.current.textContent = (String(e.currentTarget.getAttribute("data-value")));
      setMaintenanceUser(String(e.currentTarget.getAttribute("data-key")));
    }
  }

  return (
    <div className="page02-report-modal-area">
      <div className="page02-modal-header">
        <p>主要機器現状報告書</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="page02-modal-contents">
        <div className="page02-create-date">
          <label htmlFor="page02-create-date">記入日</label>
          <span className="page02-calendar-border">
            <div>
              <img src="/images/calendar.svg" alt="SVG" onClick={props.openCalendar} className="page02-calendar"/>
            </div>
            <input
              type="text"
              id="createDate"
              value={props.createDate}
              { ...register("createDate", { 
                required: "必須入力項目です", 
                pattern: {
                  value: /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/
                  , message: "YYYY/MM/DD形式で入力してください"
                },
                onChange: (event) => props.setCreateDate(event.target.value),
                validate: () => checkDateType(getValues("createDate")) || "存在しない日付です"
              })}
            />
            {errors.createDate &&
              <div className="page02-error-area">
                <span className="page02-error-create-date">
                  {errors.createDate?.message as string}
                </span>
              </div>
            }

          </span>
        </div>
        <div className="page02-maintenance-user-area">
          <div>
            <label>担当者</label>
            <div
              onClick={dispMaintenanceUserList}
              ref={maintenanceUserRef}
              data-value={maintenanceUser}
              id="page02-maintenance-user"
            >
              {/* すべて */}
            </div>

            <div className={maintenanceUserListClassName}>
              <div className="page02-maintenance-user-list">
                {maintenanceUserList.map((user) => {
                  return (
                    <div
                      className="page02-maintenance-user"
                      onClick={clickMaintenanceUser}
                      data-value={user.userName}
                      data-key={user.userId}
                      key={user.userId}
                    >
                      <div>
                        {user.userName}
                      </div>
                    </div>
                  ) 
                })}    
              </div>
            </div>
          </div>
        </div>
        <div className="page02-pending-work">
          <label htmlFor="page02-pending-work">保留作業</label>
          <textarea onChange={event => setPendingWork(event.target.value)} id="page02-pending-work" value={pendingWork}></textarea>
          <div className="page02-underline-pending-work"></div>
        </div>
        <div className="page02-note">
          <label htmlFor="page02-note">備考</label>
          <textarea onChange={event => setNote(event.target.value)} id="page02-note" value={note}></textarea>
          <div className="page02-underline-note"></div>
        </div>
        <div className="page02-file">
          <label htmlFor="page02-file">ファイル添付</label>
          <ComFilePicker
            clickFilePicker={clickFilePicker}
          />
          <div className="page02-filename-area">
            {file.length === 0 ? (
              <p>ファイル名</p>
            ) : (
              <>
                {file.map((fileList) => {
                  return (
                    <div key={fileList.fileName}>
                      {fileList.isDownloadable === true ? (
                        <>
                          <p className="page02-file-downloadable" onClick={(event) => fileDownload(event)}>{fileList.fileName}</p>
                          <span onClick={(event) => (openFileDeleteModal(event))}>
                            <ComDelete />
                          </span>
                        </>
                      ) : (
                        <>
                          <p>{fileList.fileName}</p>
                          <span onClick={(event) => (openFileDeleteModal(event))}>
                            <ComDelete />
                          </span>
                        </>
                      )}
                      
                    </div>
                  )
                })}
              </>
            )}
          </div>
          <input type="file" multiple style={{ display: 'none' }} ref={attachRef} onChange={selectFile} onClick={(e) => e.currentTarget.value = ""}></input>
        </div>
      </div>
      <div className="page02-modal-button">
        <div className="page02-file-info">
          <div>
            <span>作成</span>：{createUser}
          </div>
          <div>
            <span>最終更新</span>：{updateUser}
          </div>
        </div>
        <button className="page02-close-button" onClick={props.closeModal}>キャンセル</button>
        <button
          className="page02-ok-button"
          onClick={registReport}
          disabled={!isValid}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
