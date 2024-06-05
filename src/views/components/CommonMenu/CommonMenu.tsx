import React, { useState, useEffect } from "react";
import "./CommonMenu.css";
import { Link } from "react-router-dom";
import Maintenance from "../CommonIcon/CommonMaintenance";
import VoyagePlan from "../CommonIcon/CommonVoyagePlan";
import Report from "../CommonIcon/CommonReport";
import Construction from "../CommonIcon/CommonConstruction";
import ShipSupplies from "../CommonIcon/CommonShipSupplies";
import Files from "../CommonIcon/CommonFiles";
import Export from "../CommonIcon/CommonExport";

// 選択中メニュー（リロード用）
let menuNo = "1";
export function setMenu(selectMenuNo: string) {
  menuNo = selectMenuNo;
}

const CommonMenu = () => {

  // 初期処理
  useEffect(() => {
    setSelectmenu(menuNo);

  // eslint-disable-next-line
  }, [menuNo]);

  // 選択中メニュー
  const [selectMenu, setSelectmenu] = useState(menuNo);

  return (
    <div className="com03-menu">
      <div className="com03-menu-hover">
        <Link to="/VoyagePlan">
          <div className={selectMenu === "1" ? "com03-selected" : "com03-unselected"} onClick={() => setSelectmenu("1")}>
            <div>
              <VoyagePlan
                opacity={selectMenu === "1" ? "none" : "0.4"}
              />
            </div>
            <div className="com03-menu-title com03-padding-title">
              航海計画
            </div>
          </div>
        </Link>  

        <div className={selectMenu === "2" ? "com03-selected" : "com03-unselected"}>
          <div>
            <Maintenance
              opacity={selectMenu === "2" ? "none" : "0.5"}
            />
          </div>
          <div className="com03-menu-title com03-padding-title com03-menu-arrow">
            船舶保守管理
            <div className="com03-menu-sub-area">
              <Link to="/MaintenanceTable" onClick={() => setSelectmenu("2")}>
                <div>
                  保守整備表
                </div>
              </Link>
              <div>
                運転時間推定
              </div>
              <Link to="/MajorEquipmentReport" onClick={() => setSelectmenu("2")}>
                <div>
                  主要機器現状報告書
                </div>
              </Link>
            </div>
          </div>
        </div>

        <Link to="/FailureReport">
          <div className={selectMenu === "3" ? "com03-selected" : "com03-unselected"} onClick={() => setSelectmenu("3")}>
            <div>
              <Report
                opacity={selectMenu === "3" ? "none" : "0.35"}
              />
            </div>
            <div className="com03-menu-title">
              報告書
            </div>
          </div>
        </Link>

        <Link to="/DockConstruction">
          <div className={selectMenu === "4" ? "com03-selected" : "com03-unselected"} onClick={() => setSelectmenu("4")}>
            <div>
              <Construction
                opacity={selectMenu === "4" ? "none" : "0.35"}
              />
            </div>
            <div className="com03-menu-title">
              入渠工事
            </div>
          </div>
        </Link>

        <div className={selectMenu === "5" ? "com03-selected" : "com03-unselected"}>
          <div>
            <ShipSupplies
              opacity={selectMenu === "5" ? "none" : "0.35"}
            />
          </div>
          <div className="com03-menu-title com03-menu-arrow">
            船用品管理
            <div className="com03-menu-sub-area">
              <Link to="/SparePartsManagement" onClick={() => setSelectmenu("5")}>
                <div>
                  予備品管理
                </div>
              </Link>
              <div>
                潤滑油管理
              </div>
              <div>
                燃料油管理
              </div>
            </div>
          </div>
        </div>

        {/* <div className={selectMenu === "6" ? "com03-selected" : "com03-unselected"} onClick={() => setSelectmenu("6")}> */}
        <div className={selectMenu === "6" ? "com03-selected" : "com03-unselected"}>
          <div>
            <Files
              opacity={selectMenu === "6" ? "none" : "0.35"}
            />
          </div>
          <div className="com03-menu-title">
            完成図書検索
          </div>
        </div>

        {/* <div className={selectMenu === "7" ? "com03-selected" : "com03-unselected"} onClick={() => setSelectmenu("7")}> */}
        <div className={selectMenu === "7" ? "com03-selected" : "com03-unselected"}>
          <div>
            <Export
              opacity={selectMenu === "7" ? "none" : "0.35"}
            />
          </div>
          <div className="com03-menu-title">
            エクスポート
          </div>
        </div>
      </div>

    </div>
  );
};

export default CommonMenu;
