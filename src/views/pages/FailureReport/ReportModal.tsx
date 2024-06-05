import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import "./ReportModal.css";
import ComFilePicker from "../../components/CommonIcon/CommonFilePicker"
import { UpdateKey,FailureReportDetail,kindList,groupList } from "../FailureReport/FailureReport";
// import Radio from '@material-ui/core/Radio';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { FileManagement } from "../../hooks/FileManagement";
import ComDelete from "../../components/CommonIcon/CommonDelete";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// 親コンポーネントから持ち回る値
export type Props = {
  updateKey: UpdateKey;
  accrualDate: string;
  setAccrualDate: (accrualDate: string) => void;
  closeModal: () => void;
  openCalendar: () => void;
  registReport: (failureReportData: FailureReportData) => void;
  openFileDeleteModal: () => void;
  isFileDelete: boolean;
  setIsFileDelete: (isFileDelete: boolean) => void;
  openFileDuplicateModal: () => void;
  isDuplicateFile: boolean;
  setIsDuplicateFile: (isDuplicateFile: boolean) => void;
  isDuplicateFileDelete: boolean;
  setIsDuplicateFileDelete: (isDuplicateFileDelete: boolean) => void;
};
export type FailureReportData = {
  failureReportDetail: FailureReportDetail;
  file: File[]|null;
}

// 報告書画面-報告書モーダル
export const ReportModal: React.FC<Props> = props => {

  const kindListModal =  kindList.filter(item => item.value !== "すべて");
  const groupListModal =  groupList.filter(item => item.value !== "すべて");
  // ローディング判定
  const isLoading = useRef(false);
  // 更新キー
  // propsでくる
  // const [key, setKey] = useState("");
  // 種類
  const [kind, setKind] = useState("");
  // 報告書番号
  const [reportNo, setReportNo] = useState("");
  // 報告書名
  const [reportName, setReportName] = useState("");
  // グループ
  const [group, setGroup] = useState("");
  // ファイル
  type FailureReportFile = {
    // file: File;
    fileName: string;
    isDownloadable: boolean
  }
  const [file, setFile] = useState<FailureReportFile[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  // 作成者
  const [createUser, setCreateUser] = useState("");
  // 更新者
  const [updateUser, setUpdateUser] = useState("");
  // version
  const [version, setVersion] = useState(0);

  // ファイル選択コントロールref
  const attachRef = useRef<HTMLInputElement>(null);

  // グループセレクトボックス
  const groupRef = useRef<HTMLInputElement>(null);
  // グループセレクトボックスClassName
  const [groupListClassName, setGroupListClassName] = React.useState("page03-group-list-area-none");

  // 削除用ファイルリスト
  const fileList = useRef<any[]>();
  // 削除対象ファイルインデックス
  const targetNum = useRef<number>();

  // 選択ファイル全量リスト
  const allSelectFileList = useRef<FailureReportFile[]>([]);
  // 選択ファイルリスト（重複削除）
  const notDupSelectFileList = useRef<FailureReportFile[]>([]);
  // 登録済ファイルリスト（重複削除）
  const deleteDupFileList = useRef<FailureReportFile[]>([]);

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
  const { getFileUrl } = FileManagement();

  // 2重初期処理防止
  const ignore = useRef(false);

  const FILE_TYPE = "03" //報告書

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

  // カレンダーから発生日が変更された場合のチェック実施
  useEffect(() => {
    setValue("accrualDate", props.accrualDate)
    trigger("accrualDate");
  
  // eslint-disable-next-line
  }, [props.accrualDate]);

  // 報告書項目の取得
  const getReportDetail = async() => {
    // propsのkeyを使用し、DBからデータ取得
    // keyが空の場合（新規作成）は空データ
    setCreateUser("dffas_plus12");
    setUpdateUser("dffas_plus12");
    
    if (props.updateKey.reportNo) {
      // const res = await client.graphql({query: getFailureReport,
      //   variables: {
      //     imo: getImo(),
      //     reportNo: props.updateKey.reportNo
      //   }
      // });
      const res = await client.models.FailureReport.get({
        imo: getImo(),
        reportNo: props.updateKey.reportNo
      });
      if ("data" in res && res.data) {
          setGroup(res.data.group!);
          if (groupRef.current !== null) {
            groupRef.current.textContent = String((groupList.find((group) => group.key === res.data!.group))?.value);
          }
          setKind(res.data.kind);
          setReportName(res.data.reportName!);
          setCreateUser(res.data.createUser!);
          setUpdateUser(res.data.updateUser!);
          setReportNo(props.updateKey.reportNo);
          setVersion(props.updateKey.version);

          if (null !== res.data.fileName
            && undefined !== res.data.fileName
            && "" !== res.data.fileName) {
          const registeredFiles: FailureReportFile[] = [];
          const fileDatas: string[] = res.data.fileName.split(",");
          for (let i = 0; i < fileDatas.length; i++) {
            const registeredFile: FailureReportFile = {
              fileName: fileDatas[i],
              isDownloadable: true
            };
            // TODO 「file」は必要？props.registに渡している
            registeredFiles.push(registeredFile);
          }
          setFile(registeredFiles);
        }
        }
    } else {
      // reportNoを取得
      // const res = await client.graphql({query: getSequence,
      //   variables: {
      //     imo: getImo(),
      //     seqPrefix:"FailureReport" // TODO 正式決定したら修正
      //   }
      // });
      const res = await client.models.Sequence.get({
        imo: getImo(),
        seqPrefix:"FailureReport" // TODO 正式決定したら修正
      });
      if ("data" in res && res.data) {
        setReportNo(res.data.currentValue);
      }
      setGroup("01")
      if (groupRef.current !== null) {
        groupRef.current.textContent = String((groupList.find((group) => group.key === "01"))?.value);
      }
      setKind("01");
    }
  }

  // 報告書データの登録
  const registReport = () => {
    isLoading.current = true;
    // ファイルをS3に登録してそのURLを↓にセット

    // 登録用の値をセット
    // 更新者とかは共通エリアから取得する？
    const failureReportDetail: FailureReportDetail = {
       kind: kind
      , reportNo: reportNo
      , reportName: reportName
      , group: group
      , accrualDate: props.accrualDate
      // , fileUrls: file.map(file => file.fileUrl)
      , fileNames: file.map(file => file.fileName)
      , createUser: createUser
      , updateUser: updateUser
      , version:version
    }

    // 登録処理
    props.registReport({failureReportDetail:failureReportDetail, file:files});
  }

  // 日付形式チェック
  const checkDateType = (date: string) => {
    if (date === undefined) { 
      date = props.accrualDate;
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
      let tmpAllSelectFileList: FailureReportFile[] = [];
      // 選択ファイルから、重複を抜いたリスト
      let tmpNotDupSelectFileList: FailureReportFile[] = [];
      // 重複フラグ
      let duplicateFlg = false;

      // ファイル名重複チェック
      for (let i = 0; i < e.target.files.length; i++) {
        // 登録済ファイルに重複があった場合は、重複フラグオン
        if (fileNameList.includes(e.target.files[i].name)) {
          duplicateFlg = true;
        } else {
          // 選択ファイルから重複を除いたデータを作成
          const notDupData: FailureReportFile = {
            fileName: e.target.files[i].name,
            // fileUrl: window.URL.createObjectURL(e.target.files[i]),
            isDownloadable: false
          };
          tmpNotDupSelectFileList.push(notDupData);
        }
        // 選択ファイル全量リスト用のデータ作成
        const fileData: FailureReportFile = {
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
        let tmpDeleteDupFileList: FailureReportFile[] = [];
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
          const pushFile: FailureReportFile = {
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
    let tmpFiles: FailureReportFile[] = [];
    
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

  // グループリスト表示
  const dispGroupList = () => {
    setGroupListClassName("page03-group-list-area");
    window.addEventListener("mouseup", hiddenGroupList, {once: true});
  };
  // グループリスト非表示
  const hiddenGroupList = () => {
    setGroupListClassName("page03-group-list-area-none");
  }

  // グループのセット
  const clickGroup = (e: React.MouseEvent<HTMLElement>) => {
    if (groupRef.current !== null) {
      groupRef.current.textContent = (String(e.currentTarget.getAttribute("data-value")));
      setGroup(String(e.currentTarget.getAttribute("data-key")));
    }
  }

  return (
    <div className="page03-report-modal-area">
      <div className="page03-modal-header">
        <p>報告書</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="page03-modal-contents">
        <div className="page03-kind">
          <label>種類</label>
          <div>
            {kindListModal.map((kindItem) => {
              return(
                <div key={kindItem.key}>
                  {/* <FormControlLabel
                    value={kindItem.key}
                    control={kindItem.key === kind ? <Radio style={{color: "#E66300"}} /> : <Radio style={{color: "white"}} />}
                    label={kindItem.value}
                    labelPlacement="end"
                    name="kind"
                    checked={kindItem.key === kind ? true : false}
                    onChange={() => setKind(kindItem.key)}
                  /> */}
                </div>
              )
            })}
          </div>
        </div>
        <div className="page03-report-no">
          <label htmlFor="page03-report-no">報告書番号</label>
          <div id="page03-report-no">{reportNo}</div>
        </div>
        <div className="page03-report-name">
          <label htmlFor="page03-report-name">報告書名</label>
          <textarea onChange={event => setReportName(event.target.value)} value={reportName} id="page03-report-name"></textarea>
          <div className="page03-underline-report-name"></div>
        </div>
        <div className="page03-group-area">

          <div>
          <label>グループ</label>
          <div
            onClick={dispGroupList}
            ref={groupRef}
            data-value={group}
            id="page03-group"
          >
            すべて
          </div>

          <div className={groupListClassName}>
            <div className="page03-group-list">
              {groupListModal.map((group) => {
                return (
                  <div
                    className="page03-group"
                    onClick={clickGroup}
                    data-value={group.value}
                    data-key={group.key}
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

        </div>
        <div className="page03-accrual-date">
          <label htmlFor="page03-accrual-date">発生日</label>
          <span className="page03-calendar-border">
            <div>
              <img src="/images/calendar.svg" alt="SVG" onClick={props.openCalendar} className="page03-calendar"/>
            </div>
            <input
              type="text"
              id="accrualDate"
              value={props.accrualDate}
              { ...register("accrualDate", { 
                required: "必須入力項目です", 
                pattern: {
                  value: /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/
                  , message: "YYYY/MM/DD形式で入力してください"
                },
                onChange: (event) => props.setAccrualDate(event.target.value),
                validate: () => checkDateType(getValues("accrualDate")) || "存在しない日付です"
              })}
            />
            {errors.accrualDate &&
              <div className="page03-error-area">
                <span className="page03-error-accrual-date">
                  {errors.accrualDate?.message as string}
                </span>
              </div>
            }
          </span>
        </div>
        <div className="page03-file">
          <label htmlFor="page03-file">ファイル添付</label>
          <ComFilePicker
            clickFilePicker={clickFilePicker}
          />
          <div className="page03-filename-area">
            {file.length === 0 ? (
              <p>ファイル名</p>
            ) : (
              <>
                {file.map((fileList) => {
                  return (
                    <div key={fileList.fileName}>
                      {fileList.isDownloadable === true ? (
                        <>
                          <p className="page03-file-downloadable" onClick={(event) => fileDownload(event)}>{fileList.fileName}</p>
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
      <div className="page03-modal-button">
        <div className="page03-file-info">
          <div>
            <span>作成</span>：{createUser}
          </div>
          <div>
            <span>最終更新</span>：{updateUser}
          </div>
        </div>
        <button className="page03-close-button" onClick={props.closeModal}>キャンセル</button>
        <button
          className="page03-ok-button"
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
