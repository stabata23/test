import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./VoyagePlanComponent.css";
import Modal from "react-modal";
import {CommonCalendar} from "../../components/CommonCalendar/CommonCalender"
import parse from 'html-react-parser';
import ComPlus from "../../components/CommonIcon/CommonStockPlus";

// 親コンポーネントから持ち回る値
export type Props = {
  keyVal: string;
  startPoint: string;
  startDate: string;
  startHour: string;
  startMinutes: string;
  goalPoint: string;
  goalDate: string;
  goalHour: string;
  goalMinutes: string;
  componentErrorFlg: boolean;
  setStartPoint: (value: string) => void;
  setStartDate: (value: string) => void;
  setStartHour: (value: string) => void;
  setStartMinutes: (value: string) => void;
  setGoalPoint: (value: string) => void;
  setGoalDate: (value: string) => void;
  setGoalHour: (value: string) => void;
  setGoalMinutes: (value: string) => void;
  setComponentErrorFlg: (flgValue: boolean) => void;
  checkAllComponentErrorFlg: () => void;
  addVoyagePlan: (index: number) => void;
  deleteVoyagePlan: (index: number) => void;
  openDeleteModal: () => void;
  isDelete: boolean;
  setIsDelete: (isDelete: boolean) => void;
};

// 航海計画型
// export type TypeVoyagePlan = {
//   voyagePlanTitle: string;
//   startPoint: string;
//   startDate: string;
//   startHour: string;
//   startMinutes: string;
//   goalPoint: string;
//   goalDate: string;
//   goalHour: string;
//   goalMinutes: string;
//   sailingTime: string;
//   berthingTime: string;
// }

// 航海計画画面-航海計画共通コンポーネント
export const VoyagePlanComponent: React.FC<Props> = props => {

  // 航海計画（時）のプルダウンデータ
  const voyagePlanHourList = [
    "00", "01", "02", "03", "04", "05", "06", "07", "08", "09"
    , "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"
    , "20", "21", "22", "23"
  ];

  // 航海計画（分）のプルダウンデータ
  const voyagePlanMinutesList = [
    "00", "01", "02", "03", "04", "05", "06", "07", "08", "09"
    , "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"
    , "20", "21", "22", "23", "24", "25", "26", "27", "28", "29"
    , "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"
    , "40", "41", "42", "43", "44", "45", "46", "47", "48", "49"
    , "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"
  ];

  // 出港時間（時）リストClassName
  const [startHourListClassName, setStartHourListClassName] = useState("page05-ymlist-area");
  // 出港時間（分）リストClassName
  const [startMinutesListClassName, setStartMinutesListClassName] = useState("page05-ymlist-area");
  // 入港時間（時）リストClassName
  const [goalHourListClassName, setGoalHourListClassName] = useState("page05-ymlist-area");
  // 入港時間（分）リストClassName
  const [goalMinutesListClassName, setGoalMinutesListClassName] = useState("page05-ymlist-area");

  // key
  // const [key] = useState(props.key);
  // 出港場所
  const [startPoint, setStartPoint] = useState(props.startPoint);
  // 出港日付
  const [startDate, setStartDate] = useState(props.startDate);
  // 出港時間（時）
  const [startHour, setStartHour] = useState(props.startHour);
  // 出港時間（分）
  const [startMinutes, setStartMinutes] = useState(props.startMinutes);
  // 入港場所
  const [goalPoint, setGoalPoint] = useState(props.goalPoint);
  // 入港日付
  const [goalDate, setGoalDate] = useState(props.goalDate);
  // 入港時間（時）
  const [goalHour, setGoalHour] = useState(props.goalHour);
  // 入港時間（分）
  const [goalMinutes, setGoalMinutes] = useState(props.goalMinutes);

  // 削除対象ファイルインデックス
  const deleteTargetNum = useRef<number>();
  
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
  } = useForm({ mode: "onChange" });

  // カレンダーから出港日付が変更された場合のチェック実施
  useEffect(() => {
    setValue("startDate", startDate);
    trigger("startDate");
  
  // eslint-disable-next-line
  }, [startDate]);

  // カレンダーから入港日付が変更された場合のチェック実施
  useEffect(() => {
    setValue("goalDate", goalDate);
    trigger("goalDate");
  
  // eslint-disable-next-line
  }, [goalDate]);

  // 必須入力チェック
  const [startPointErrorMsg, setStartPointErrorMsg] = useState("");
  const [startHourErrorMsg, setStartHourErrorMsg] = useState("");
  const [startMinutesErrorMsg, setStartMinutesErrorMsg] = useState("");
  const [goalPointErrorMsg, setGoalPointErrorMsg] = useState("");
  const [goalHourErrorMsg, setGoalHourErrorMsg] = useState("");
  const [goalMinutesErrorMsg, setGoalMinutesErrorMsg] = useState("");
  useEffect(() => {
    trigger("startDate");
    trigger("goalDate");
    // props.setErrorFlg(!isValid);
    props.setComponentErrorFlg(!isValid);
    props.checkAllComponentErrorFlg();
    let errorFlg = false;

    // if (startPoint !== ""
    //     || startDate !== ""
    //     || startHour !== ""
    //     || startMinutes !== ""
    //     || goalPoint !== ""
    //     || goalDate !== ""
    //     || goalHour !== ""
    //     || goalMinutes !== "") {
      if (startPoint === "") {
        setStartPointErrorMsg("必須項目です");
        errorFlg = true;
      } else {
        setStartPointErrorMsg("");
      }
      if (startHour === "") {
        setStartHourErrorMsg("必須項目です");
        errorFlg = true;
      } else {
        setStartHourErrorMsg("");
      }
      if (startMinutes === "") {
        setStartMinutesErrorMsg("必須項目です");
        errorFlg = true;
      } else {
        setStartMinutesErrorMsg("");
      }
      if (goalPoint === "") {
        setGoalPointErrorMsg("必須項目です");
        errorFlg = true;
      } else {
        setGoalPointErrorMsg("");
      }
      if (goalHour === "") {
        setGoalHourErrorMsg("必須項目です");
        errorFlg = true;
      } else {
        setGoalHourErrorMsg("");
      }
      if (goalMinutes === "") {
        setGoalMinutesErrorMsg("必須項目です");
        errorFlg = true;
      } else {
        setGoalMinutesErrorMsg("");
      }
    // } else {
    //   setStartPointErrorMsg("");
    //   setStartHourErrorMsg("");
    //   setStartMinutesErrorMsg("");
    //   setGoalPointErrorMsg("");
    //   setGoalHourErrorMsg("");
    //   setGoalMinutesErrorMsg("");
    // }

    if (isValid) {
      // props.setErrorFlg(errorFlg);
      props.setComponentErrorFlg(errorFlg);
    props.checkAllComponentErrorFlg();
    }
  // eslint-disable-next-line
  }, [isValid, startPoint, startDate, startHour, startMinutes, goalPoint, goalDate, goalHour, goalMinutes]);

  // 出港場所の更新
  const updateStartPoint = (updateValue: string) => {
    setStartPoint(updateValue);
    props.setStartPoint(updateValue);
  }
  // 出港日付の更新
  const updateStartDate = (updateValue: string) => {

    setStartDate(updateValue);
    props.setStartDate(updateValue);
  }
  // 出港時間（時）の更新
  const updateStartHour = (updateValue: string) => {
    updateValue = updateValue.replace(/[^0-9]/g, "");
    if (updateValue.length === 2) {
      if (!voyagePlanHourList.includes(updateValue)) {
        updateValue = updateValue.substring(0, 1);
      }
    }
    setStartHour(updateValue);
    props.setStartHour(updateValue);
  }
  // 出港時間（分）の更新
  const updateStartMinutes = (updateValue: string) => {
    updateValue = updateValue.replace(/[^0-9]/g, "");
    if (updateValue.length === 2) {
      if (!voyagePlanMinutesList.includes(updateValue)) {
        updateValue = updateValue.substring(0, 1);
      }
    }
    setStartMinutes(updateValue);
    props.setStartMinutes(updateValue);
  }
  // 入港場所の更新
  const updateGoalPoint = (updateValue: string) => {
    setGoalPoint(updateValue);
    props.setGoalPoint(updateValue);
  }
  // 入港日付の更新
  const updateGoalDate = (updateValue: string) => {
    setGoalDate(updateValue);
    props.setGoalDate(updateValue);
  }
  // 入港時間（時）の更新
  const updateGoalHour = (updateValue: string) => {
    updateValue = updateValue.replace(/[^0-9]/g, "");
    if (updateValue.length === 2) {
      if (!voyagePlanHourList.includes(updateValue)) {
        updateValue = updateValue.substring(0, 1);
      }
    }
    setGoalHour(updateValue);
    props.setGoalHour(updateValue);
  }
  // 入港時間（分）の更新
  const updateGoalMinutes = (updateValue: string) => {
    updateValue = updateValue.replace(/[^0-9]/g, "");
    if (updateValue.length === 2) {
      if (!voyagePlanMinutesList.includes(updateValue)) {
        updateValue = updateValue.substring(0, 1);
      }
    }
    setGoalMinutes(updateValue);
    props.setGoalMinutes(updateValue);
  }
  // 出港時間（時）の0埋め
  const zeroPaddingStartHour = (inputValue: string) => {
    if (inputValue !== undefined
      && inputValue.length === 1) {
        inputValue = "0" + inputValue;
        setStartHour(inputValue);
        props.setStartHour(inputValue);
    }
  }
  // 出港時間（分）の0埋め
  const zeroPaddingStartMinutes = (inputValue: string) => {
    if (inputValue !== undefined
      && inputValue.length === 1) {
        inputValue = "0" + inputValue;
        setStartMinutes(inputValue);
        props.setStartMinutes(inputValue);
    }
  }
  // 入港時間（時）の0埋め
  const zeroPaddingGoalHour = (inputValue: string) => {
    if (inputValue !== undefined
      && inputValue.length === 1) {
        inputValue = "0" + inputValue;
        setGoalHour(inputValue);
        props.setGoalHour(inputValue);
    }
  }
  // 入港時間（分）の0埋め
  const zeroPaddingGoalMinutes = (inputValue: string) => {
    if (inputValue !== undefined
      && inputValue.length === 1) {
        inputValue = "0" + inputValue;
        setGoalMinutes(inputValue);
        props.setGoalMinutes(inputValue);
    }
  }

  // 出港時間（時）ref
  const startHourRef = useRef<HTMLInputElement>(null);
  // 出港時間（分）ref
  const startMinutesRef = useRef<HTMLInputElement>(null);
  // 入港時間（時）ref
  const goalHourRef = useRef<HTMLInputElement>(null);
  // 入港時間（分）ref
  const goalMinutesRef = useRef<HTMLInputElement>(null);

  // 出港時間（時）リスト表示
  const dispStartHourList = () => {
    // 位置を取得
    let position = startHourRef.current?.getBoundingClientRect().top;
    
    // 半分より下の場合はリストを上向きに表示
    if (position !== undefined && position > 550) {
      setStartHourListClassName("page05-ymlist-area-up");  
    } else {
      setStartHourListClassName("page05-ymlist-area");
    }
  }

  // 出港時間（分）リスト表示
  const dispStartMinutesList = () => {
    // 位置を取得
    let position = startMinutesRef.current?.getBoundingClientRect().top;
    
    // 半分より下の場合はリストを上向きに表示
    if (position !== undefined && position > 550) {
      setStartMinutesListClassName("page05-ymlist-area-up");  
    } else {
      setStartMinutesListClassName("page05-ymlist-area");
    }
  }

  // 入港時間（時）リスト表示
  const dispGoalHourList = () => {
    // 位置を取得
    let position = goalHourRef.current?.getBoundingClientRect().top;
    
    // 半分より下の場合はリストを上向きに表示
    if (position !== undefined && position > 550) {
      setGoalHourListClassName("page05-ymlist-area-up");  
    } else {
      setGoalHourListClassName("page05-ymlist-area");
    }
  }

  // 入港時間（分）リスト表示
  const dispGoalMinutesList = () => {
    // 位置を取得
    let position = goalMinutesRef.current?.getBoundingClientRect().top;
    
    // 半分より下の場合はリストを上向きに表示
    if (position !== undefined && position > 550) {
      setGoalMinutesListClassName("page05-ymlist-area-up");  
    } else {
      setGoalMinutesListClassName("page05-ymlist-area");
    }
  }

  // 出港時間（時）のセット
  const clickStartHour = (e: React.MouseEvent<HTMLElement>) => {
    updateStartHour(String(e.currentTarget.getAttribute("data-value")));
    setStartHourListClassName("page05-ymlist-area-none");
  }

  // 出港時間（分）のセット
  const clickStartMinutes = (e: React.MouseEvent<HTMLElement>) => {
    updateStartMinutes(String(e.currentTarget.getAttribute("data-value")));
    setStartMinutesListClassName("page05-ymlist-area-none");
  }

  // 入港時間（時）のセット
  const clickGoalHour = (e: React.MouseEvent<HTMLElement>) => {
    updateGoalHour(String(e.currentTarget.getAttribute("data-value")));
    setGoalHourListClassName("page05-ymlist-area-none");
  }

  // 入港時間（分）のセット
  const clickGoalMinutes = (e: React.MouseEvent<HTMLElement>) => {
    updateGoalMinutes(String(e.currentTarget.getAttribute("data-value")));
    setGoalMinutesListClassName("page05-ymlist-area-none");
  }

  // 出港日付カレンダーモーダル表示制御
  const [startDateCalendar, setStartDateCalendar] = useState(false);
  // カレンダーモーダル表示
  const openStartDateCalendar = () => {
    setStartDateCalendar(true);
  };
  // カレンダーモーダル非表示
  const closeStartDateCalendar = () => {
    setStartDateCalendar(false);
  };
  // カレンダーモーダルで選択した日付セット
  const setStartDateModal = (selectDate: string) => {
    // 選択日付をセット
    updateStartDate(selectDate);
    // カレンダーモーダルを閉じる
    closeStartDateCalendar();
  };

  // 入港日付カレンダーモーダル表示制御
  const [goalDateCalendar, setGoalDateCalendar] = useState(false);
  // カレンダーモーダル表示
  const openGoalDateCalendar = () => {
    setGoalDateCalendar(true);
  };
  // カレンダーモーダル非表示
  const closeGoalDateCalendar = () => {
    setGoalDateCalendar(false);
  };
  // カレンダーモーダルで選択した日付セット
  const setGoalDateModal = (selectDate: string) => {
    // 選択日付をセット
    updateGoalDate(selectDate);
    // カレンダーモーダルを閉じる
    closeGoalDateCalendar();
  };

  // 日付形式チェック
  const checkDateType = (date: string) => {
    if (date === undefined) { 
      date = props.startDate;
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

  // 航海計画追加
  const addPlan = (e: React.MouseEvent<HTMLElement>) => {
    // 押下したプラスボタンのインデックスを特定
    const voyagePlanList = Array.prototype.slice.call(e.currentTarget.parentElement?.parentElement?.parentElement?.getElementsByClassName("page05-plus-button"));
    const targetNum = voyagePlanList.findIndex(idx => idx === e.currentTarget) + 1;
    props.addVoyagePlan(targetNum);
  }

  // 航海計画削除モーダル表示
  const openDeleteModal = (e: React.MouseEvent<HTMLElement>) => {
    // 押下した削除ボタンのインデックスを特定
    const voyagePlanList = Array.prototype.slice.call(e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.getElementsByClassName("page05-delete-button"));
    deleteTargetNum.current = voyagePlanList.findIndex(idx => idx === e.currentTarget);
    props.openDeleteModal();
  }

  // 航海計画削除検知
  useEffect(() => {
    // 航海計画削除判定
    if (props.isDelete) {
      deletePlan();
    };
  }, [props.isDelete]);

  // 航海計画削除
  const deletePlan = () => {
    props.setIsDelete(false);
    if (deleteTargetNum.current !== undefined) {
      props.deleteVoyagePlan(deleteTargetNum.current);
    }
  }

  return (
    <div key={props.keyVal}>
      <div className="page05-modal-title-area">
        {/* <p className="page05-modal-title">
          {voyagePlanTitle}
        </p> */}
      </div>
      <div className="page05-modal-voyage-plan-area">
        <div>
          {/* 画像 */}
          <div>
            <img src="/images/startPoint.svg" alt="SVG"/>
          </div>
          {/* 場所 */}
          <div>
            <input type="text" value={startPoint} onChange={event => updateStartPoint(event.target.value)} />
            {startPointErrorMsg !== "" &&
              <div className="page05-error-area">
                <span className="page05-error-start-point">
                  {startPointErrorMsg}
                </span>
              </div>
            }
          </div>
          {/* カレンダー */}
          <div>
            <div>
              <div>
                <div>
                  <img src="/images/calendar.svg" alt="SVG" onClick={openStartDateCalendar}/>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="----/--/--"
                  value={startDate}
                  id="startDate"
                  { ...register("startDate", {
                    pattern: {
                      value: /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/
                      , message: "YYYY/MM/DD形式で<br/>入力してください"
                    },
                    validate: () => {
                      // if ((startPoint !== ""
                      //     || startDate !== ""
                      //     || startHour !== ""
                      //     || startMinutes !== ""
                      //     || goalPoint !== ""
                      //     || goalDate !== ""
                      //     || goalHour !== ""
                      //     || goalMinutes !== "")
                      //     && getValues("startDate") === "") {
                      //   return "必須項目です";                    
                      // } else {
                      if (getValues("startDate") === "") {
                        return "必須項目です";                    
                      } else {
                        if (getValues("startDate") !== "") {
                          return checkDateType(getValues("startDate")) || "存在しない日付です"
                        }
                      }
                    },
                    onChange: (event) => updateStartDate(event.target.value)
                  })}
                />
              </div>
            </div>
            {errors.startDate &&
              <div className="page05-error-area">
                <span className="page05-error-start-date">
                  {parse(errors.startDate?.message as string)}
                </span>
              </div>
            }
          </div>
          {/* 時 */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00"
              maxLength={2}
              value={startHour}
              onChange={event => updateStartHour(event.target.value)}
              onFocus={dispStartHourList}
              ref={startHourRef}
              onBlur={event => zeroPaddingStartHour(event.target.value)}
            />
            <div className={startHourListClassName}>
              <div className="page05-ymlist">
                {voyagePlanHourList.map((hour) => {
                  return (
                    <div className="page05-ym" onClick={clickStartHour} data-value={hour}>
                      <div>
                        {hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {startHourErrorMsg !== "" &&
              <div className="page05-error-area">
                <span className="page05-error-start-hour">
                  {startHourErrorMsg}
                </span>
              </div>
            }
          </div>
          <div>
            <p>：</p>
          </div>
          {/* 分 */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00"
              maxLength={2}
              value={startMinutes}
              onChange={event => updateStartMinutes(event.target.value)}
              onFocus={dispStartMinutesList}
              ref={startMinutesRef}
              onBlur={event => zeroPaddingStartMinutes(event.target.value)}
            />
            <div className={startMinutesListClassName}>
              <div className="page05-ymlist">
                {voyagePlanMinutesList.map((minutes) => {
                  return (
                    <div className="page05-ym" onClick={clickStartMinutes} data-value={minutes}>
                      <div>
                        {minutes}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {startMinutesErrorMsg !== "" &&
              <div className="page05-error-area">
                <span className="page05-error-start-minutes">
                  {startMinutesErrorMsg}
                </span>
              </div>
            }
          </div>
          <div>
            <p>発</p>
          </div>
          <div>
            <div>
              <img src="/images/modalClose.svg" alt="SVG" className="page05-delete-button" onClick={(event) => openDeleteModal(event)}/>
            </div>
          </div>
        </div>

        <div className="page05-arrow-area">
          <img src="/images/underArrow.svg" alt="SVG"/>
        </div>

        <div>
          {/* 画像 */}
          <div>
            <img src="/images/goalPoint.svg" alt="SVG"/>
          </div>
          {/* 場所 */}
          <div>
            <input type="text" value={goalPoint} onChange={event => updateGoalPoint(event.target.value)} />
            {goalPointErrorMsg !== "" &&
              <div className="page05-error-area">
                <span className="page05-error-goal-point">
                  {goalPointErrorMsg}
                </span>
              </div>
            }
          </div>
          {/* カレンダー */}
          <div>
            <div>
              <div>
                <div>
                  <img src="/images/calendar.svg" alt="SVG" onClick={openGoalDateCalendar}/>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="----/--/--"
                  value={goalDate}
                  id="goalDate"
                  { ...register("goalDate", {
                    pattern: {
                      value: /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/
                      , message: "YYYY/MM/DD形式で<br/>入力してください"
                    },
                    validate: () => {
                      // if ((startPoint !== ""
                      //     || startDate !== ""
                      //     || startHour !== ""
                      //     || startMinutes !== ""
                      //     || goalPoint !== ""
                      //     || goalDate !== ""
                      //     || goalHour !== ""
                      //     || goalMinutes !== "")
                      //     && getValues("goalDate") === "") {
                      //   return "必須項目です";
                      if (getValues("goalDate") === "") {
                        return "必須項目です";
                      } else {
                        if (getValues("goalDate") !== "") {
                          return checkDateType(getValues("goalDate")) || "存在しない日付です"
                        }
                      }
                    },
                    onChange: (event) => updateGoalDate(event.target.value)
                  })}
                />
              </div>
            </div>
            {errors.goalDate &&
              <div className="page05-error-area">
                <span className="page05-error-goal-date">
                  {parse(errors.goalDate?.message as string)}
                </span>
              </div>
            }
          </div>
          {/* 時 */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00"
              maxLength={2}
              value={goalHour}
              onChange={event => updateGoalHour(event.target.value)}
              onFocus={dispGoalHourList}
              ref={goalHourRef}
              onBlur={event => zeroPaddingGoalHour(event.target.value)}
            />
            <div className={goalHourListClassName}>
              <div className="page05-ymlist">
                {voyagePlanHourList.map((hour) => {
                  return (
                    <div className="page05-ym" onClick={clickGoalHour} data-value={hour}>
                      <div>
                        {hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {goalHourErrorMsg !== "" &&
              <div className="page05-error-area">
                <span className="page05-error-goal-hour">
                  {goalHourErrorMsg}
                </span>
              </div>
            }
          </div>
          <div>
            <p>：</p>
          </div>
          {/* 分 */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00"
              maxLength={2}
              value={goalMinutes}
              onChange={event => updateGoalMinutes(event.target.value)} onFocus={dispGoalMinutesList} ref={goalMinutesRef}
              onBlur={event => zeroPaddingGoalMinutes(event.target.value)}
            />
            <div className={goalMinutesListClassName}>
              <div className="page05-ymlist">
                {voyagePlanMinutesList.map((minutes) => {
                  return (
                    <div className="page05-ym" onClick={clickGoalMinutes} data-value={minutes}>
                      <div>
                        {minutes}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {goalMinutesErrorMsg !== "" &&
              <div className="page05-error-area">
                <span className="page05-error-goal-minutes">
                  {goalMinutesErrorMsg}
                </span>
              </div>
            }
          </div>
          <div>
            <p>着</p>
          </div>
        </div>
      </div>
      <div className="page05-plus-button-area">
        <span className="page05-plus-button" onClick={(event) => addPlan(event)}>
          <ComPlus />
        </span>
      </div>

      <Modal isOpen={startDateCalendar} className="com01-calendar-modal" overlayClassName="com01-calendar-overlay" appElement={document.getElementById('root') || undefined}>
        <CommonCalendar
          selectDate={startDate}
          closeCalendar={closeStartDateCalendar}
          setDate={setStartDateModal}
          isMentenanceReport={false}
        />
      </Modal>

      <Modal isOpen={goalDateCalendar} className="com01-calendar-modal" overlayClassName="com01-calendar-overlay" appElement={document.getElementById('root') || undefined}>
        <CommonCalendar
          selectDate={goalDate}
          closeCalendar={closeGoalDateCalendar}
          setDate={setGoalDateModal}
          isMentenanceReport={false}
        />
      </Modal>
    </div>
  );
};

export default VoyagePlanComponent;
