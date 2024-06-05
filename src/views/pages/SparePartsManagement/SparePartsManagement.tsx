import React, { useState, useEffect, useRef } from "react";
import "./SparePartsManagement.css";
import ComStockPlus from "../../components/CommonIcon/CommonStockPlus";
import ComStockMinus from "../../components/CommonIcon/CommonStockMinus";

import { setMenu } from "../../components/CommonMenu/CommonMenu";
import { useSessionData } from "../../components/CommonSession/CommonSession";
import { Loading } from "../../components/CommonLoading/CommonLoading";

import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/../../amplify/data/resource';

// DB操作用
const client = generateClient<Schema>();


// 予備品管理型
type SpareParts = {
  partsCode: string;
  partsName: string;
  unit: string;
  stock: number;
  recommendedStock: number
  note: string;
  kind: string;
};

// 機器種類
type Kind = {
  primaryItemName: string;
  primaryItemValue: string;
  secondary: {
    secondaryItemName: string;
    secondaryItemValue: string; // primaryItemValue + "#" + secondaryItemValueで設定
    tertiary: {
      tertiaryItemName: string;
      tertiaryItemValue: string; // primaryItemValue + "#" + secondaryItemValue + "#" + tertiaryItemValueで設定
    }[];
  }[];
};

// 予備品管理画面
const SparePartsManagement: React.FC = () => {

  // 予備品管理型配列
  const [sparePartsList, setSparePartsList] = useState<SpareParts[]>([]);
  // 予備品管理型配列（元データ保持用）
  const [sparePartsListDefault, setSparePartsListDefault] = useState<SpareParts[]>([]);

  // 機器種類型配列
  const [kindList, setKindList] = useState<Kind[]>([]);
  // 重要度セレクトボックス
  const importanceRef = useRef<HTMLInputElement>(null);
  // 機器種類セレクトボックス
  const kindRef = useRef<HTMLInputElement>(null);
  // 予備品名インプットボックス
  const sparePartsNameRef = useRef<HTMLInputElement>(null);

  // 機器種類リストClassName
  const [kindListClassName, setKindListClassName] = React.useState("page06-kind-list-area-none");

  // 重要度リストClassName
  const [importanceListClassName, setImportanceListClassName] = React.useState("page06-importance-list-area-none");
  // 重要度リスト TODO 一旦ベタ
  type importanceType = {
    value: string;
    name: string;
  }
  const importanceList: importanceType[] = [
    {
      value: "01"
      , name: "すべて"
    }
    , {
      value: "02"
      , name: "クリティカル"     
    }
  ];

  // セッションカスタムhook
  const { getImo } = useSessionData();

  // ローディング判定
  const isLoading = useRef(false);

  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 予備品一覧の取得
      getSparePartsList();
      // メニューのセット
      setMenu("5");
    };

    return () => {
      ignore.current = true;
    };

  // eslint-disable-next-line
  }, []);

  // 画面表示項目の取得
  const getSparePartsList = async() => {
    // 共通エリアからimo等取得

    // 予備品種類取得
    setKindList([]);
    let tmpKindList: Kind[]=[];
    isLoading.current = true;
    // const resData = await client.graphql({
    //   query: listSparePartsKindMasters,
    //   variables: {
    //     imo: getImo()
    //   }
    // });
    const resData = await client.models.SparePartsKindMaster.list({
      imo: getImo()
    })
    if ("data" in resData && resData.data ) {
      // 最上位の項目を取得(secondary以下が設定されていない)
      const primaryList = resData.data.filter(item => !item.secondaryCode);   
      for (const primaryItem of primaryList) {
        // 最上位の項目の配下の項目をすべて取得
        const filterList = resData.data.filter(item => item.primaryCode === primaryItem.primaryCode && item.secondaryCode);
        let pushSecondaryList= [];
        if (filterList) {
          // 上位二位の項目のリストを取得(tertiaryCodeが設定されていない)
          const secondaryList = filterList.filter(item => !item.tertiaryCode); 
          if (secondaryList) {
            for (const secondaryItem of secondaryList) {
              // 上位二位の項目配下の上位三位の項目を取得(tertiaryCodeが設定されている)
              const tertiaryList = filterList.filter(item => item.secondaryCode === secondaryItem.secondaryCode && item.tertiaryCode); 
              let pushTertiaryList= [];
              if (tertiaryList) {
                for (const tertiaryItem of tertiaryList) {
                  pushTertiaryList.push({
                    tertiaryItemValue:primaryItem.primaryCode + "#" + secondaryItem.secondaryCode! + "#" + tertiaryItem.tertiaryCode!,
                    tertiaryItemName:tertiaryItem.name!
                  });
                }
              }
              pushSecondaryList.push({
                secondaryItemValue:primaryItem.primaryCode + "#" + secondaryItem.secondaryCode!,
                secondaryItemName:secondaryItem.name!,
                tertiary:pushTertiaryList!
              });
            }
          }
        }
        // TODO 各リストはリスト完成後にソートしないとダメかも
        tmpKindList.push({
          primaryItemValue:primaryItem.primaryCode!,
          primaryItemName:primaryItem.name!,
          secondary: pushSecondaryList
       });
      }
    }
    setKindList(tmpKindList);
    // 一覧データのクリア
    setSparePartsList([]);
    const dispData: SpareParts[]=[];

    // 一覧データを取得
    const apiData = await client.models.SpareParts.list({
      imo: getImo(),
    });

    if ("data" in apiData && apiData.data ) {
      for (const item of apiData.data) {
        const pushItem:SpareParts ={
          partsCode: item.partsCode,
          kind: item.kind,
          partsName: item.partsName,
          unit: item.unit,
          stock: item.stock!,
          recommendedStock: item.recommendedStock!,
          note: item.note!
        }
        dispData.push(pushItem);
      }
    }

    // 取得したデータを画面項目に設定
    setSparePartsList([]);
    setSparePartsList(dispData);

    // 元データ表示用オブジェクトにもセット
    setSparePartsListDefault([]);
    setSparePartsListDefault(dispData);
    isLoading.current = false;
  };

  // 重要度リスト表示
  const dispImportanceList = () => {
    setImportanceListClassName("page06-importance-list-area");
    window.addEventListener("mouseup", hiddenImportanceList, {once: true});
  };
  // 重要度リスト非表示
  const hiddenImportanceList = () => {
    setImportanceListClassName("page06-importance-list-area-none");
  }

  // 重要度のセット
  const clickImportance = (e: React.MouseEvent<HTMLElement>) => {
    if (importanceRef.current !== null) {
      importanceRef.current.textContent = (String(e.currentTarget.getAttribute("data-name")));
      importanceRef.current.setAttribute("data-value", String(e.currentTarget.getAttribute("data-value")));
      setFilter();
    }
  }

  // 機器種類リスト表示
  const dispKindList = () => {
      setKindListClassName("page06-kind-list-area");
      window.addEventListener("mouseup", hiddenKindList, {once: true});
  };

  // 機器種類リスト非表示
  const hiddenKindList = () => {
    setKindListClassName("page06-kind-list-area-none");
  }

  // 機器種類のセット
  const clickKind = (e: React.MouseEvent<HTMLElement>) => {
    if (kindRef.current !== null) {
      kindRef.current.textContent = (String(e.currentTarget.getAttribute("data-name")));
      kindRef.current.setAttribute("data-value", String(e.currentTarget.getAttribute("data-value")));
      setFilter();
    }
  }

  // フィルタ処理
  const setFilter = () => {
    // 機器種類フィルタ値
    let filterValKind = String(kindRef.current?.getAttribute("data-value"));
    // 予備品名フィルタ値
    let filterValSparePartsName = String(sparePartsNameRef.current?.value);

    // 一覧を取得
    let tableData = sparePartsListDefault.concat();

    // フィルタに入力ありの場合は処理
    let filterTableData = tableData;
    if ((filterValKind !== "00"
        && filterValKind !== "")
        || filterValSparePartsName !== "") {
      // フィルタ処理
      filterTableData = [];
      for (const rowData of tableData) {
        // フィルタ対象のテーブル項目値を取得
        const colDataKind = rowData.kind;
        const colDataPartsName = rowData.partsName;
        
        // フィルタ入力値がテーブル項目に一致するかチェック
        let pushFlgKind = false;
        let pushFlgPartsName = false;

        // 機器種類
        if (filterValKind === "00" || filterValKind === "") {
          pushFlgKind = true;
        } else if (colDataKind === filterValKind) {
          pushFlgKind = true;
        }

        // 報告書名
        if (filterValSparePartsName === "") {
          pushFlgPartsName = true;
        } else if (colDataPartsName.indexOf(filterValSparePartsName) > -1) {
          pushFlgPartsName = true;
        }

        // 一致があった場合は追加
        if (pushFlgKind && pushFlgPartsName) {
          filterTableData.push(rowData);
        }
      }
    }
    // フィルタした一覧を画面表示
    setSparePartsList([]);
    setSparePartsList(filterTableData);
  }

  // 在庫数の変更検知
  const changeStock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updateValue = e.target.value.replace(/[^0-9]/g, "");
    e.currentTarget.setAttribute("data-value", updateValue);
    e.currentTarget.value = updateValue;
  }

  // 在庫数の更新
  const updateStock = async(partsCode: string, updateStock: string) => {
    // onblurで呼び出しているが、要検討
    // onchangeだと、一文字ずつで呼ばれる

    // 共通エリア？からIMO等のキー取得処理

    // 更新処理
    try {
      const input ={
        imo: getImo(),
        partsCode: partsCode,
        stock: Number(updateStock),
      }
      await client.models.SpareParts.update(input);
      // デフォルトリストの更新
      const listDafault = sparePartsListDefault.map((item) => {
        if (item.partsCode === partsCode) {
          item.stock = Number(updateStock);
        } 
        return item;
      });
      setSparePartsListDefault(listDafault);
    } catch (error) {
      console.error(error);
      return;
   }
    // alert(updateStock);

    // 画面内容再取得処理
  }

  // 備考の更新
  const updateNote = async(partsCode: string, updateNote: string) => {
    // TODO onblurで呼び出しているが、要検討
    // TODO onchangeだと、一文字ずつで呼ばれる

    // 共通エリア？からIMO等のキー取得処理

    // 更新処理
    try {
      const input ={
        imo: getImo(),
        partsCode: partsCode,
        note: updateNote,
      }
      await client.models.SpareParts.update(input);

      // デフォルトリストの更新
      const listDafault = sparePartsListDefault.map((item) => {
        if (item.partsCode === partsCode) {
          item.note = updateNote;
          return item;
        } else {
          return item;
        }
      });
      setSparePartsListDefault(listDafault);
    } catch (error) {
      console.error(error);
      return;
   }

    // alert(updateNote);

    // 画面内容再取得処理
  }

  // 在庫数のインクリメント
  const stockIncrement = (partsCord: string, e: React.MouseEvent<HTMLElement>) => {
    let input = e.currentTarget.parentElement?.parentElement?.children[0].getElementsByTagName("input")[0];

    if (input !== undefined) {
      const inputValue = input.getAttribute("data-value");
      const stock = Number(inputValue);

      // 数値か判定
      if (typeof stock === "number" && !isNaN(stock)) {
        let incrementStock = String(stock);
        if (stock + 1 <= 999999) {
          incrementStock = String(stock + 1);
        }
        input.value = incrementStock;
        input.setAttribute("data-value", incrementStock);
        updateStock(partsCord, incrementStock)
      }
    }
  }

  // 在庫数のデクリメント
  const stockDecrement = (partsCord: string, e: React.MouseEvent<HTMLElement>) => {
    let input = e.currentTarget.parentElement?.parentElement?.children[0].getElementsByTagName("input")[0];

    if (input !== undefined) {
      const inputValue = input.getAttribute("data-value");
      const stock = Number(inputValue);

      // 数値か判定
      if (typeof stock === "number" && !isNaN(stock)) {
        let decrementStock = String(stock);
        if (stock - 1 >= 0) {
          decrementStock = String(stock - 1);
        }
        input.value = decrementStock;
        input.setAttribute("data-value", decrementStock);
        updateStock(partsCord, decrementStock)
      }
    }
  }

  return (
    <div className="page06-contents">
      <Loading
        isLoading={isLoading.current}
      />
      <p className="page06-page-title">予備品管理</p>

      <div className="page06-sapre-parts-area">
        <div className="page06-filter-area">
          <div>
            <label>重要度</label>
            <div
              onClick={dispImportanceList}
              ref={importanceRef}
              data-value=""
              id="page06-importance"
            >
              すべて
            </div>

            <div className={importanceListClassName}>
              <div className="page06-importance-list">
                {importanceList.map((importanceData) => {
                  return (
                    <div
                      className="page06-importance"
                      onClick={clickImportance}
                      data-value={importanceData.value}
                      data-name={importanceData.name}
                    >
                      <div>
                        {importanceData.name}
                      </div>
                    </div>
                  ) 
                })}    
              </div>
            </div>
          </div>
          <div>
            <label>機器</label>
            <div
              onClick={dispKindList}
              ref={kindRef}
              data-value=""
              id="page06-kind"
            >
              すべて
            </div>
            <div className={kindListClassName}>
              <div className="page06-kind-list">
                {kindList.map((kind) => (
                  kind.secondary.length > 0 ? (
                    <div
                      className="page06-kind page06-kind-arrow"
                    >
                      <div>
                        {kind.primaryItemName}
                        <div className="page06-kind-second-area">
                          {kind.secondary.map((second) => (
                            second.tertiary.length > 0 ? (
                              <div className="page06-kind-second page06-kind-arrow">
                                {second.secondaryItemName}
                                <div className="page06-kind-third-area">
                                  {second.tertiary.map((third) => {
                                    return (
                                      <div
                                        className="page06-kind-third"
                                        onClick={clickKind}
                                        data-value={third.tertiaryItemValue}
                                        data-name={third.tertiaryItemName}
                                      >
                                        {third.tertiaryItemName}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div
                                className="page06-kind-second"
                                onClick={clickKind}
                                data-value={second.secondaryItemValue}
                                data-name={second.secondaryItemName}
                              >
                                {second.secondaryItemName}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="page06-kind"
                      onClick={clickKind}
                      data-value={kind.primaryItemValue}
                      data-name={kind.primaryItemName}
                    >
                      <div>
                        {kind.primaryItemName}
                      </div>
                    </div>
                  )
                ))}
              </div>
              
            </div>
          </div>
          <div>
            <img src="/images/magnifyingGlass.svg" alt="SVG" />
            <div>
              <input
                type="text"
                placeholder="予備品名"
                ref={sparePartsNameRef}
                onChange={() => setFilter()}
              >
              </input>
              <div className="page06-underline-filter"></div>
            </div>
          </div>
        </div>

        <table className="page06-spare-parts-table-header">
          <tr className="page06-table-header">
            <td>部品コード</td>
            <td>予備品名</td>
            <td>単位</td>
            <td>在庫数</td>
            <td>推奨在庫数</td>
            <td>差分</td>
            <td>備考</td>
          </tr>
        </table>
          
          <div className="page06-spare-parts-table-scroll">
            <table className="page06-spare-parts-table">
            {sparePartsList.map((spareParts) => {
              return (
                <tr key={spareParts.partsCode} className="page06-spare-parts-table-body">
                  <td>{spareParts.partsCode}</td>
                  <td>
                    <span>{spareParts.partsName}</span>
                    <span>{spareParts.partsName}</span>
                  </td>
                  <td>{spareParts.unit}</td>
                  <td>
                    <div>
                      <div>
                        <input 
                          type="text"
                          inputMode="numeric"
                          defaultValue={spareParts.stock}
                          onChange={(event) => changeStock(event)}
                          onBlur={(event) => updateStock(spareParts.partsCode, event.target.value)}
                          data-key={spareParts.partsCode}
                          data-value={spareParts.stock}
                          maxLength={6}
                        >
                        </input>
                      </div>
                      <div>
                        <div onClick={(event) => stockIncrement(spareParts.partsCode, event)}>
                          <ComStockPlus />
                        </div>
                        <div onClick={(event) => stockDecrement(spareParts.partsCode, event)}>
                          <ComStockMinus />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{spareParts.recommendedStock}</td>
                  <td>
                    {spareParts.stock - spareParts.recommendedStock === 0 ? (
                      <div>
                        {spareParts.stock - spareParts.recommendedStock}
                      </div>
                    ):(
                      <div>
                        {spareParts.stock - spareParts.recommendedStock > 0 ? (
                          <div>
                            ＋{spareParts.stock - spareParts.recommendedStock}
                          </div>
                        ) : (
                          <div>
                            <div>
                              －{String(spareParts.stock - spareParts.recommendedStock).replace("-", "")}
                            </div>
                            <div>
                              <img src="/images/alert.svg" alt="SVG" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>
                      <textarea
                        defaultValue={spareParts.note}
                        onBlur={(event) => updateNote(spareParts.partsCode, event.target.value)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SparePartsManagement;
