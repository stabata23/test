import React, { useState, useEffect, useRef } from "react";
import "./MasterRegist.css";
import ComFilePicker from "../../components/CommonIcon/CommonFilePicker"
import { Loading } from "../../components/CommonLoading/CommonLoading";
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// マスター取込用(仮作成)
const MasterRegist: React.FC = () => {

  // 2重初期処理防止
  const ignore = useRef(false);

  // ローディング判定
  const isLoading = useRef(false);
  // ファイル選択コントロールref
  const attachRef = useRef<HTMLInputElement>(null);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);


    // filePickerでファイル選択時の処理
    // AWS Dynamodbのコンソールから出力したCSVファイルをそのまま取り込んでDynamodbに登録する。
    // テーブル名はファイル名から判定する。
    const selectFile = async(e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files !== null) {
        // 選択ファイルがない場合は処理終了
        if (e.target.files.length === 0) {
          return;
        }
        
        // 選択したファイルを取得
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const reader = new FileReader();
          const csv = await readFile(file);
          console.log(csv);
          const aa = csvToArray(csv);
         
          const tabeleName = e.target.files[i].name.split(".")[0];
          // ファイル名でテーブルを判定する
          if ("MaintenanceTable" === tabeleName){
            for (let i=1;i < aa.length;i++ ) {
              const item:string[] = aa[i];
              // 最初の行はカラム名なので無視
              const input = {
                topItem: item[0].replaceAll('"', ''),
                bottomItem: item[1].replaceAll('"', ''),
                dueDate: item[3].replaceAll('"', ''),
                imo: item[4].replaceAll('"', ''),
                incompleteAlertFlg: item[5].replaceAll('"', ''),
                interval: Number(item[6].replaceAll('"', '')),
                intervalUnit: item[7].replaceAll('"', ''),
                lastPlanDate: item[8].replaceAll('"', ''),
                maintenancePoint: item[9].replaceAll('"', ''),
                maintenancePosition: item[10].replaceAll('"', ''),
                name: item[11].replaceAll('"', ''),
                nextPlanDate: item[12].replaceAll('"', ''),
                nextPlanDateAlertFlg: item[13].replaceAll('"', ''),
                updateUser: item[15].replaceAll('"', ''),
              };
              try{
                console.log(input);
                await client.models.MaintenanceTable.create(input);
              } catch (error) {
                console.error(error);
              }
            }
          } 
          else if ("SpareParts" === tabeleName){
            for (let i=1;i < aa.length;i++ ) {
              const item:string[] = aa[i];
              
              // 最初の行はカラム名なので無視
              const input= {
                imo: item[0].replaceAll('"', ''),
                partsCode: item[1].replaceAll('"', ''),
                kind: item[3].replaceAll('"', ''),
                note: item[4].replaceAll('"', ''),
                partsName: item[5].replaceAll('"', ''),
                recommendedStock: Number(item[6].replaceAll('"', '')),
                stock: Number(item[7].replaceAll('"', '')),
                unit: item[8].replaceAll('"', ''),
              };
              try{
                const res = await client.models.SpareParts.create(input);
                console.log(input);
                console.log(res);
              } catch (error) {
                console.error(error);
              }
            }
          } else if ("SparePartsKindMaster" === tabeleName){
            for (let i=1;i < aa.length;i++ ) {
              const item:string[] = aa[i];
              
              // 最初の行はカラム名なので無視
              const input = {
                imo: item[0].replaceAll('"', ''),
                seqNo: Number(item[1].replaceAll('"', '')),
                name: item[3].replaceAll('"', ''),
                primaryCode: item[4].replaceAll('"', ''),
                secondaryCode: item[5].replaceAll('"', ''),
                tertiaryCode: item[6].replaceAll('"', ''),
              };
              try{
                await client.models.SparePartsKindMaster.create(input);
              } catch (error) {
                console.error(error);
              }
            }
          } else if ("CodeMaster" === tabeleName){
            for (let i=1;i < aa.length;i++ ) {
              const item:string[] = aa[i];
            
              // 最初の行はカラム名なので無視
              const input= {
                codeName: item[0].replaceAll('"', ''),
                value: item[1].replaceAll('"', ''),
                valueName: item[4].replaceAll('"', '')
              };
              try{
                console.log(input);
                const res = await client.models.CodeMaster.create(input);
                console.log(res);
              } catch (error) {
                console.error(error);
              }
            }
          } else if ("Sequence" === tabeleName){
            for (let i=1;i < aa.length;i++ ) {
              const item:string[] = aa[i];
              
              console.log(item[0] +":"+item[0].replaceAll('"', ''));
              // 最初の行はカラム名なので無視
              const input= {
                imo: item[0].replaceAll('"', ''),
                seqPrefix: item[1].replaceAll('"', ''),
                currentValue: item[4].replaceAll('"', ''),
              };
              try{
                const res = await client.models.Sequence.create(input);
                console.log(input);
                console.log(res);
              } catch (error) {
                console.error(error);
              }
            }
          }
          const a = e.target.files[i].name;
        }
      }
    }
    // 非表示のfilePickerを選択する
    const clickFilePicker = () => {
      // filePickerをクリック
      attachRef.current?.click();
    }

    const readFile = async(file: Blob): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => resolve((reader.result as string) || '');
        reader.readAsText(file);
      });
    }
    const csvToArray = (csv: string): string[][] =>  {
      return csv.split('\n').map((row) => row.split(','));
    }
  return (
    <div className="page03-contents">
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page03-page-title">
        マスター取込用（仮）
      </p>

      <div className="page03-report-area">
        <div className="page03-modal-contents">
         <div className="page03-file">
          <label htmlFor="page03-file">ファイル添付</label>
          <ComFilePicker
            clickFilePicker={clickFilePicker}
          />
          <input type="file" multiple style={{ display: 'none' }} ref={attachRef} onChange={selectFile}></input>
        </div>
        </div>
      </div>

    </div>
  );
};

export default MasterRegist;
