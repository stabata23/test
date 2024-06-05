import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import "./MaintenanceReportModal.css";
import ComFilePicker from "../../components/CommonIcon/CommonFilePicker"
import { PlanInput } from "../MaintenanceTable/MaintenanceTable";
// import Radio from '@material-ui/core/Radio';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
import dayjs from "dayjs";
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { FileManagement } from "../../hooks/FileManagement";
import ComDelete from "../../components/CommonIcon/CommonDelete";


import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 親コンポーネントから持ち回る値
export type MaintenanceReportProps = {
  key: string;
  regist: (menteReport: MaintenanceReport) => void;
  closeModal: () => void;
  openCalendar: () => void;
  implementationDate: string;
  setImplementationDate: (implementationDate: string) => void;
  planInput: PlanInput;
  maintenancePoint: string;
  openFileDeleteModal: () => void;
  isFileDelete: boolean;
  setIsFileDelete: (isFileDelete: boolean) => void;
  openFileDuplicateModal: () => void;
  isDuplicateFile: boolean;
  setIsDuplicateFile: (isDuplicateFile: boolean) => void;
  isDuplicateFileDelete: boolean;
  setIsDuplicateFileDelete: (isDuplicateFileDelete: boolean) => void;
};
export type MaintenanceReport = {
  updateData: { 
    imoMaintenancePoint:string
  , inspectionDateMaintenanceItem:string
  , maintenancePoint: string
  , inspectionDate: string
  , maintenanceItem: string
  , imo : string
  , reportNo: string
  , status: string
  , note: string
  , fileName: string
  , createUser: string
  , updateUser: string
  , version: number,
  };
  file: File[]|null;
  beforePlanDate:string;
}

// 保守整備表画面-保守整備記録モーダル
export const MaintenanceReportModal: React.FC<MaintenanceReportProps> = props => {

  // 更新キー
  // propsでくる
  // const [key, setKey] = useState("");
  // 報告書番号
  const [reportNo, setReportNo] = React.useState("");
  // ステータス
  const [status, setStatus] = React.useState("");
  // 整備内容
  const [note, setNote] = React.useState("");
  // ファイル
  type MaintenanceReportFile = {
    // file: File;
    fileName: string;
    isDownloadable: boolean
  }
  const [file, setFile] = useState<MaintenanceReportFile[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  // 作成者
  const [createUser, setCreateUser] = useState("");
  // 更新者
  const [updateUser, setUpdateUser] = useState("");
  // バージョン（排他用）
  const [version, setVersion] = useState(0);
  // 変更前計画日（排他用）
  const [beforePlanDate, setBeforePlanDate] = useState("");

  // ステータスリスト
  // DBからとってくる？
  const statusList = [
    {key: "4", value: "完了"},
    {key: "3", value: "完了 (コメントあり)"},
    {key: "2", value: "未完了"}
  ];

  // ファイル選択コントロールref
  const attachRef = useRef<HTMLInputElement>(null);

  // 削除用ファイルリスト
  const fileList = useRef<any[]>();
  // 削除対象ファイルインデックス
  const targetNum = useRef<number>();

  // 選択ファイル全量リスト
  const allSelectFileList = useRef<MaintenanceReportFile[]>([]);
  // 選択ファイルリスト（重複削除）
  const notDupSelectFileList = useRef<MaintenanceReportFile[]>([]);
  // 登録済ファイルリスト（重複削除）
  const deleteDupFileList = useRef<MaintenanceReportFile[]>([]);

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
  } = useForm({ mode: "onChange" , context: props.implementationDate});
  
  // セッションカスタムhook
  const { getImo } = useSessionData();
  const { getFileUrl } = FileManagement();
  // ファイルタイプ
  const FILE_TYPE = "01" //保守整備表

  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // 初期表示時の点検箇所リストの取得
    const get = async () => {
      // const apiData = await client.graphql({
      //   query: getMaintenanceInspectionDate,
      //   variables: {
      //     imoMaintenancePoint: getImo() + "#" + props.maintenancePoint,
      //     inspectionDate:props.planInput.date,
      //     maintenanceItem:props.planInput.maintenanceItem
      //   }});
      const apiData = await client.models.MaintenanceInspectionDate.get({
          imoMaintenancePoint: getImo() + "#" + props.maintenancePoint,
          inspectionDateMaintenanceItem:props.planInput.date+ "#" + props.planInput.maintenanceItem,
      });
      if ("data" in apiData && apiData.data ) {
        if (null !== apiData.data.fileName
            && undefined !== apiData.data.fileName
            && "" !== apiData.data.fileName) {
          const registeredFiles: MaintenanceReportFile[] = [];
          const fileDatas: string[] = apiData.data.fileName.split(",");
          for (let i = 0; i < fileDatas.length; i++) {
            const registeredFile: MaintenanceReportFile = {
              fileName: fileDatas[i],
              isDownloadable: true
            };
            // TODO 「file」は必要？props.registに渡している
            registeredFiles.push(registeredFile);
          }
          setFile(registeredFiles);
        }
        
        if (apiData.data.status === "1") {
          setStatus("4");
        } else {
          setStatus(apiData.data.status!);
        }

        if (apiData.data.inspectionDate === undefined
            || apiData.data.inspectionDate === ""
            || apiData.data.inspectionDate === null) {
          setValue("implementationDate", props.implementationDate);
        } else {
          props.setImplementationDate(apiData.data.inspectionDate!);
          setValue("implementationDate", apiData.data.inspectionDate);
        }
        setNote(apiData.data.note!);
        setCreateUser(apiData.data.createUser!);
        setUpdateUser(apiData.data.updateUser!);
        setVersion(apiData.data.version!);
        setBeforePlanDate(props.planInput.date);
        if (!apiData.data.reportNo) {
          // reportNoを取得
          // const res = await client.graphql({query: getSequence,
          //   variables: {
          //     imo: getImo(),
          //     seqPrefix:"MaintenanceReport" // TODO 正式決定したら修正
          //   }
          // });
          const res = await client.models.Sequence.get({
            imo: getImo(),
            seqPrefix:"MaintenanceReport" // TODO 正式決定したら修正
          });
          if("data" in res && res.data) {
            setReportNo(res.data.currentValue);
          } else {
            console.error("採番エラー");
          }
        } else {
          setReportNo(apiData.data.reportNo);
        }
      }
    };

    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      get();
    };

    return () => {
      ignore.current = true;
    };

    // eslint-disable-next-line
  }, []);

  // カレンダーから実施日が変更された場合のチェック実施
  useEffect(() => {
    setValue("implementationDate", props.implementationDate);
    trigger("implementationDate");
  
  // eslint-disable-next-line
  }, [props.implementationDate]);

  // 呼び出し元コンポーネントのメソッドを使用し保守整備表型の登録
  const registMaintenanceReport = () => {

    const tmpFileNames = file.map(file => file.fileName);
    
    // 保守整備型オブジェクトに値設定
    const input = {
      imoMaintenancePoint: getImo() + "#" + props.maintenancePoint
      , inspectionDateMaintenanceItem: props.implementationDate + "#" + props.planInput.maintenanceItem
      , maintenancePoint: props.maintenancePoint
      , inspectionDate: props.implementationDate
      , maintenanceItem: props.planInput.maintenanceItem
      , imo : getImo()
      , reportNo: reportNo
      , status: status
      , note: note
      , fileName: tmpFileNames.join(',') 
      , createUser: createUser ? createUser:"create" // TODO ログインユーザーを設定する
      , updateUser: "updateUser" // TODO ログインユーザーを設定する
      , version: version,
    }
    const menteReportObj:MaintenanceReport = {
      updateData: input,
      file: input.fileName ? files! : null,
      beforePlanDate:beforePlanDate
    }

    // 登録処理
    props.regist(menteReportObj);
  }

  // 日付形式チェック
  const checkDateType = (date: string) => {
    if (date === undefined) { 
      date = props.implementationDate;
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

  // 未来日チェック
  const checkFutureDate = (date: string) => {
    if (date === undefined) { 
      date = props.implementationDate;
    }
    const checkDate = new Date(date);
    const nowDate = new Date(dayjs().format('YYYY/MM/DD'));
    if (checkDate > nowDate) {
      return false;
    }
    return true;
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
      let tmpAllSelectFileList: MaintenanceReportFile[] = [];
      // 選択ファイルから、重複を抜いたリスト
      let tmpNotDupSelectFileList: MaintenanceReportFile[] = [];
      // 重複フラグ
      let duplicateFlg = false;

      // ファイル名重複チェック
      for (let i = 0; i < e.target.files.length; i++) {
        // 登録済ファイルに重複があった場合は、重複フラグオン
        if (fileNameList.includes(e.target.files[i].name)) {
          duplicateFlg = true;
        } else {
          // 選択ファイルから重複を除いたデータを作成
          const notDupData: MaintenanceReportFile = {
            fileName: e.target.files[i].name,
            // fileUrl: window.URL.createObjectURL(e.target.files[i]),
            isDownloadable: false
          };
          tmpNotDupSelectFileList.push(notDupData);
        }
        // 選択ファイル全量リスト用のデータ作成
        const fileData: MaintenanceReportFile = {
          fileName: e.target.files[i].name,
          // fileUrl: window.URL.createObjectURL(e.target.files[i]),
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
        let tmpDeleteDupFileList: MaintenanceReportFile[] = [];
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
          const pushFile: MaintenanceReportFile = {
            fileName: e.target.files[i].name,
            // fileUrl: window.URL.createObjectURL(e.target.files[i]),
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
    let tmpFiles: MaintenanceReportFile[] = [];
    
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
  const fileDownload = async(e: React.MouseEvent<HTMLElement>) => {
    // ファイルの一覧取得
    const downloadFileList = Array.prototype.slice.call(e.currentTarget.parentElement?.parentElement?.getElementsByTagName("p"));
    // 押下した対象ファイルの番号取得
    // const downloadFileNum = downloadFileList.findIndex(idx => idx === e.currentTarget);
    const downloadFile = downloadFileList.find(idx => idx === e.currentTarget);
    // ファイルダウンロード↓
    const fileUrl = await getFileUrl(downloadFile.innerText,reportNo,FILE_TYPE);
    var link = document.createElement("a");
    document.body.appendChild(link);
    link.href = fileUrl?.url.toString()!;
    link.download = downloadFile.innerText;
    link.click();
    document.body.removeChild(link);
    // ファイルダウンロード↑

  }

  return (
    <div className="page01-maintenance-report-modal-area">
      <div className="page01-maintenance-report-modal-header">
        <p>保守整備記録</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>  
      </div>
      <div className="page01-maintenance-report-modal-contents">
        <div className="page01-maintenance-report-no">
          <label htmlFor="page01-maintenance-report-no">報告書番号</label>
          <p>{reportNo}</p>
        </div>
        <div className="page01-maintenance-report-status">
          <label>ステータス</label>
          <div>
            {statusList.map((statusItem) => {
              return(
                <div key={statusItem.key}>
                  {/* <FormControlLabel
                    value={statusItem.key}
                    control={statusItem.key === status ? <Radio style={{color: "#E66300"}} /> : <Radio style={{color: "white"}} />}
                    label={statusItem.value}
                    labelPlacement="end"
                    name="kind"
                    checked={statusItem.key === status ? true : false}
                    onChange={() => setStatus(statusItem.key)}
                  /> */}
                </div>
              )
            })}
          </div>
        </div>
        <div className="page01-maintenance-report-implementation-date">
          <label htmlFor="page01-maintenance-report-implementation-date">実施日</label>
          <span className="page01-maintenance-report-calendar-border">
            <div>
              <img src="/images/calendar.svg" alt="SVG" onClick={props.openCalendar} className="page01-maintenance-report-calendar"/>
            </div>
            <input
              type="text"
              id="implementationDate"
              value={props.implementationDate}
              { ...register("implementationDate", { 
                required: "必須入力項目です", 
                pattern: {
                  value: /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/
                  , message: "YYYY/MM/DD形式で入力してください"
                },
                onChange: (event) => props.setImplementationDate(event.target.value),
                validate: {
                  checkDateType: () => checkDateType(getValues("implementationDate")) || "存在しない日付です",
                  checkFutureDate: () => checkFutureDate(getValues("implementationDate")) || "本日以前の日付を入力してください"
                }
              })}
            />
            {errors.implementationDate &&
              <div className="page01-error-area">
                <span className="page01-error-implementation-date">
                  {errors.implementationDate?.message as string}
                </span>
              </div>
            }
          </span>
        </div>
        <div className="page01-maintenance-report-note">
          <label htmlFor="page01-maintenance-report-note">備考</label>
          <textarea onChange={event => setNote(event.target.value)} id="page01-maintenance-report-note" value={note}></textarea>
          <div className="page01-underline-note"></div>
        </div>
        <div className="page01-maintenance-report-file">
          <label htmlFor="page01-maintenance-report-file">ファイル添付</label>
          {/* <img onClick={clickFilePicker} src="/images/filePicker.svg" alt="SVG" id="page01-maintenance-report-file"></img> */}
          <ComFilePicker
            clickFilePicker={clickFilePicker}
          />
          <div className="page01-filename-area">
            {file.length === 0 ? (
              <p>ファイル名</p>
            ) : (
              <>
                {file.map((fileList) => {
                  return (
                    <div key={fileList.fileName}>
                      {fileList.isDownloadable === true ? (
                        <>
                          <p className="page01-file-downloadable" onClick={(event) => fileDownload(event)}>{fileList.fileName}</p>
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
      <div className="page01-maintenance-report-modal-button">
        <div className="page01-maintenance-report-file-info">
          <div>
            <span>作成</span>：{createUser}
          </div>
          <div>
            <span>最終更新</span>：{updateUser}
          </div>
        </div>
        <button className="page01-maintenance-report-close-button" onClick={props.closeModal}>キャンセル</button>
        <button
          className="page01-maintenance-report-ok-button"
          onClick={registMaintenanceReport}
          disabled={!isValid}
        >
          保存
        </button>
      </div>
    </div>
  );
// };
};

export default MaintenanceReportModal;
