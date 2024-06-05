import { uploadData, remove, getUrl} from 'aws-amplify/storage';
import { useSessionData } from "../components/CommonSession/CommonSession";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();

// ファイルは全ユーザーが読書可能

export const FileManagement = () => {
  
    // セッションカスタムhook
    const { getImo } = useSessionData();
    const uploadFile = async(fileNames:string[]|null ,files:File[]|null, reportNo:string, fileType:string) => {
        // ファイルの登録
        if (fileNames && fileNames.length > 0) {
          const imo = getImo()!; 
          const prefix =   "public/" + imo + "/" + fileType + "/" + reportNo ;
          // 新規ファイルを判定
          for (let i=0;i < fileNames.length;i++) {
            const file = files?.filter(item => item.name === fileNames[i]); 
            if (file && file.length > 0) {
              const prefixFile =  prefix  + "/" + file[0].name;
              // await client.graphql({
              //   query: getFileManagement,
              //   variables: {
              //     imo: imo,
              //     prefix: prefixFile,
              //   }
              // })
              await client.models.FileManagement.get({
                imo: imo,
                prefix: prefixFile,
              }).then(res => {
                console.log(res);
                if (!res.data) {
                  // ファイル管理テーブルに未登録の場合はDBに登録
                  const inputData = {
                    imo: imo,
                    fileName: file[0].name,
                    prefix:  prefixFile,
                    fileType: fileType,
                  }
                  client.models.FileManagement.update(inputData);
                }
                // S3にファイルをアップロード（同名の場合は上書き）
                uploadData({
                    path:  prefixFile,
                    data: file[0],
                });
              });
            }
          }
          // ファイル管理テーブルから現在登録されているファイル一覧を取得する
          // const apiData = await client.graphql({
          //   query: listFileManagements,
          //   variables: {
          //     imo: getImo()
          //   }
          // });
          const apiData = await client.models.FileManagement.list({
            imo: imo,
          });
          if ("data" in apiData && apiData.data ) {
            const fileData = apiData.data;
            // 登録されているファイルとアップロードされたファイルを比較
            for (let i=0;i < fileData.length;i++) {
              // 連携されたファイルに存在するか(削除or変更されていないファイルは再度連携はされない)
              const file = files?.filter(item => item.name === fileData[i].fileName); 
              // 連携されたファイル名に存在するか(削除されたファイル名は連携されない)
              const fileName = fileNames?.filter(item => item === fileData[i].fileName); 
              if((file && file?.length < 1)
                && (fileName && fileName?.length < 1)){
                // ファイルもファイル名も存在しない場合は削除
                await deleteFile([fileData[i].fileName], reportNo, fileData[i].fileType);
              }
              // ファイルが連携されていないものは何もしない
            }
          }

        }
      }

      const deleteFile = async(fileNames:string[] , reportNo:string, fileType:string) => {
        // ファイル管理テーブルから該当のレコードを取得
        const imo = getImo()!;
        for (const fileName of fileNames) {
          const prefix =  "public/" + imo + "/" + fileType + "/" + reportNo  + "/" + fileName;
          // const res = await client.graphql({
          //   query: getFileManagement,
          //   variables: {
          //     imo: imo,
          //     prefix: prefix
          //   }
          // });
          const res = await client.models.FileManagement.get({
            imo: imo,
            prefix: prefix,
          });
          if ("data" in res && res.data) {
            // 該当のレコードを削除
            const input ={
                tableName: "FileManagement",
                imo:imo,
                deleteData:JSON.stringify(res.data),
                id:"",
            };
            await client.models.DeleteData.create(input);
            
            // ファイル管理テーブルから該当のレコードを削除
            const delData = {
              imo: imo,
              prefix: prefix,
            };
            await client.models.FileManagement.delete(delData);
            // S3から該当のファイルを削除する
            // await remove({
            //   path: prefix,
            //   options: {
            //     accessLevel: ACCESS_LEVEL, // defaults to `guest` but can be 'private' | 'protected' | 'guest'
            //   }
            // });
          }
        }
      }

      const getFileUrl = async(fileName:string , reportNo:string, fileType:string) => {
        // ファイル管理テーブルから該当のレコードを取得
        const imo = getImo()!;
        const prefix = "public/"+  imo + "/" + fileType + "/" + reportNo  + "/" + fileName;
        const res = await client.models.FileManagement.get({
          imo: imo,
          prefix: prefix,
        });
        if (res.data) {
          // S3から該当のファイルのURLを取得する
          return await getUrl({
            path: prefix,
            options: {
              expiresIn:3 // 有効期間3分
            }
          });
        }
      }
      return { uploadFile, deleteFile, getFileUrl };
};