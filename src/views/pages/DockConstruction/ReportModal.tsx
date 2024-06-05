import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import "./ReportModal.css";
import ComFilePicker from "../../components/CommonIcon/CommonFilePicker"
import { UpdateKey,DockConstructionReportDetail,kindList } from "../DockConstruction/DockConstruction";
// import FormControlLabel from '@material-ui/core/FormControlLabel';
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
  registReport: (dockConstructionReportDetailData: DockConstructionReportData) => void;
  openFileDeleteModal: () => void;
  isFileDelete: boolean;
  setIsFileDelete: (isFileDelete: boolean) => void;
  openFileDuplicateModal: () => void;
  isDuplicateFile: boolean;
  setIsDuplicateFile: (isDuplicateFile: boolean) => void;
  isDuplicateFileDelete: boolean;
  setIsDuplicateFileDelete: (isDuplicateFileDelete: boolean) => void;
};

export type DockConstructionReportData = {
  dockConstructionReportDetail: DockConstructionReportDetail;
  file: File[]|null;
}
// 入渠工事画面-報告書モーダル
export const ReportModal: React.FC<Props> = props => {

  const kindListModal =  kindList.filter(item => item.value !== "すべて");
  // 種類
  const [kind, setKind] = useState("");
  // 連番
  const [seqNo, setSeqNo] = useState(0);
  // 報告書名
  const [reportName, setReportName] = useState("");
  // ファイル
  type DockConstructionReportFile = {
    // file: File;
    fileName: string;
    isDownloadable: boolean
  }
  const [file, setFile] = useState<DockConstructionReportFile[]>([]);

  // // ファイルURL
  // const [fileUrls, setFileUrls] = useState([""]);
  // ファイル
  const [files, setFiles] = useState<File[]>([]);
  // // ファイル名
  // const [fileNames, setFileNames] = useState<string[]>([]);
  // // ファイルダウンロード可能
  // const [isDownloadable, setIsDownloadable] = useState<boolean[]>([]);
  // 作成者
  const [createUser, setCreateUser] = useState("");
  // 更新者
  const [updateUser, setUpdateUser] = useState("");
  // version
  const [version, setVersion] = useState(0);

  // ファイル選択コントロールref
  const attachRef = useRef<HTMLInputElement>(null);

  // 削除用ファイルリスト
  const fileList = useRef<any[]>();
  // 削除対象ファイルインデックス
  const targetNum = useRef<number>();

  // 選択ファイル全量リスト
  const allSelectFileList = useRef<DockConstructionReportFile[]>([]);
  // 選択ファイルリスト（重複削除）
  const notDupSelectFileList = useRef<DockConstructionReportFile[]>([]);
  // 登録済ファイルリスト（重複削除）
  const deleteDupFileList = useRef<DockConstructionReportFile[]>([]);

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
      // 入渠工事仕様書項目の取得
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

  // 入渠工事仕様書項目の取得
  const getReportDetail = async() => {
    // propsのkeyを使用し、DBからデータ取得
    // keyが空の場合（新規作成）は空データ
    setCreateUser("dffas_plus12");
    setUpdateUser("dffas_plus12");

    if(props.updateKey.seqNo) {
      // const res = await client.graphql({query: getDockConstructionReport,
      //   variables: {
      //     imo: getImo(),
      //     seqNo: Number(props.updateKey.seqNo)
      //   }
      // });
      const res = await client.models.DockConstructionReport.get({
        imo: getImo(),
        seqNo: Number(props.updateKey.seqNo)
      });
      if ("data" in res && res.data ) {
          setKind(res.data.kind);
          setReportName(res.data.reportName!);
          if (null !== res.data.fileName
              && undefined !== res.data.fileName
              && "" !== res.data.fileName) {
            const registeredFiles: DockConstructionReportFile[] = [];
            const fileDatas: string[] = res.data.fileName!.split(",");
            for (let i = 0; i < fileDatas.length; i++) {
              const registeredFile: DockConstructionReportFile = {
                fileName: fileDatas[i],
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
    } else {
      // seqNoを取得
      // const res = await client.graphql({query: getSequence,
      //   variables: {
      //    imo: getImo(),
      //    seqPrefix:"DockConstructionReport" // TODO 正式決定したら修正
      //  }
      // });
      const res = await client.models.Sequence.get({
        imo: getImo(),
        seqPrefix:"DockConstructionReport" // TODO 正式決定したら修正
      });
      if ("data" in res && res.data ) {
        setSeqNo(Number(res.data.currentValue));
      }
      // 初期値は01
      setKind("01");
    }
  }

  // 報告書データの登録
  const registReport = () => {
    // 登録用の値をセット
    // 更新者とかは共通エリアから取得する？
    const dockConstructionReportDetail: DockConstructionReportDetail = {
      seqNo: seqNo
      , kind: kind
      , createDate: props.createDate
      , reportName: reportName
      , fileNames: file.map(file => file.fileName)
      , createUser: createUser
      , updateUser: updateUser
      , version:version
    }

    // 登録処理
    // TODO [files]はもう不要？以前はファイルアップロード関係で使用していたが今はコメントアウトされている
    props.registReport({dockConstructionReportDetail:dockConstructionReportDetail, file:files});
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
      let tmpAllSelectFileList: DockConstructionReportFile[] = [];
      // 選択ファイルから、重複を抜いたリスト
      let tmpNotDupSelectFileList: DockConstructionReportFile[] = [];
      // 重複フラグ
      let duplicateFlg = false;

      // ファイル名重複チェック
      for (let i = 0; i < e.target.files.length; i++) {
        // 登録済ファイルに重複があった場合は、重複フラグオン
        if (fileNameList.includes(e.target.files[i].name)) {
          duplicateFlg = true;
        } else {
          // 選択ファイルから重複を除いたデータを作成
          const notDupData: DockConstructionReportFile = {
            fileName: e.target.files[i].name,
            isDownloadable: false
          };
          tmpNotDupSelectFileList.push(notDupData);
        }
        // 選択ファイル全量リスト用のデータ作成
        const fileData: DockConstructionReportFile = {
          fileName: e.target.files[i].name,
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
        let tmpDeleteDupFileList: DockConstructionReportFile[] = [];
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
          const pushFile: DockConstructionReportFile = {
            fileName: e.target.files[i].name,
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
    let tmpFiles: DockConstructionReportFile[] = [];
    
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

  return (
    <div className="page04-report-modal-area">
      <div className="page04-modal-header">
        <p>入渠工事</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="page04-modal-contents">
        <div className="page04-kind">
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
        <div className="page04-create-date">
          <label htmlFor="page04-create-date">作成日</label>
          <span className="page04-calendar-border">
            <div>
              <img src="/images/calendar.svg" alt="SVG" onClick={props.openCalendar} className="page04-calendar"/>
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
              <div className="page04-error-area">
                <span className="page04-error-create-date">
                  {errors.createDate?.message as string}
                </span>
              </div>
            }
          </span>
        </div>
        <div className="page04-report-name">
          <label htmlFor="page04-report-name">書類名</label>
          <textarea onChange={event => setReportName(event.target.value)} value={reportName} id="page04-report-name"></textarea>
          <div className="page04-underline-report-name"></div>
        </div>
        <div className="page04-file">
          <label htmlFor="page04-file">ファイル添付</label>
          <ComFilePicker
            clickFilePicker={clickFilePicker}
          />
          <div className="page04-filename-area">
            {file.length === 0 ? (
              <p>ファイル名</p>
            ) : (
              <>
                {file.map((fileList) => {
                  return (
                    <div key={fileList.fileName}>
                      {fileList.isDownloadable === true ? (
                        <>
                          <p className="page04-file-downloadable" onClick={(event) => fileDownload(event)}>{fileList.fileName}</p>
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
      <div className="page04-modal-button">
        <div className="page04-file-info">
          <div>
            <span>作成</span>：{createUser}
          </div>
          <div>
            <span>最終更新</span>：{updateUser}
          </div>
        </div>
        <button className="page04-close-button" onClick={props.closeModal}>キャンセル</button>
        <button
          className="page04-ok-button"
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
