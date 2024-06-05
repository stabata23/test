import React, { useEffect, useRef } from "react";
import "./CommonCalendar.css";
import dayjs from "dayjs";

export type CalendarProps = {
  selectDate: string;
  closeCalendar: () => void;
  setDate: (selectedDate: string, isMentenanceReport: boolean) => void;
  isMentenanceReport: boolean;
};

export type DayProps = {
  yyyymmdd: number;
  yyyymmddSlash: string;
  day: number;
  otherMonthFlg: boolean;
};

export type WeekProps = {
  dayData: DayProps[];
}

let weekArray: WeekProps[] = [];

export const CommonCalendar: React.FC<CalendarProps> = props => {

  // カレンダートップのYYYY/MM
  const [calendarTopYm, setCalendarTopYm] = React.useState(dayjs().format(''));
  // 選択日付
  const [selectDay, setSelectDay] = React.useState(dayjs().format('YYYY/MM/DD'));
  // 後にこれに変える
  //const [selectDay, setSelectDay] = React.useState(Propsで渡ってきた日付);

  // 2重初期処理防止
  const ignore = useRef(false);
  // 初期処理
  useEffect(() => {
    // すでに処理済の場合は処理をしない(ストリクトモード対応のため)
    if (ignore.current === false) {
      // 呼び出し元から連携された日付を設定、無い場合は現在日付
      let date = props.selectDate;
      if (date === "") {
        date = dayjs().format('YYYY/MM/DD');
      } else {
        const checkDate = new Date(date);
        if (isNaN(checkDate.getDate())) {
          date = dayjs().format('YYYY/MM/DD');
        }
      }
      setSelectDay(date);

      // カレンダーの生成
      createCalendar(date);
    };

    return () => {
      ignore.current = true;
    };

    // eslint-disable-next-line
  }, []);

  // 選択日付保存
  const calendarClick = (e: React.MouseEvent<HTMLElement>) => {
    setSelectDay(dayjs(String(e.currentTarget.getAttribute("data-day"))).format('YYYY/MM/DD'));
  };

  // カレンダーの作成
  const createCalendar = (targetDay: string, ) => {
    // カレンダー初期化
    weekArray = [];

    // カレンダー上部に表示するYYYY/MM
    const year = dayjs(targetDay).format('YYYY');
    const month = dayjs(targetDay).format('MM');
    // const day = dayjs(targetDay).format('DD');
    setCalendarTopYm(year + "/" + Number(month));

    // 月初日を取得
    const monthStartDay = dayjs(targetDay).startOf("month").format("YYYYMMDD");
    // 月初日の曜日を数字で取得、日曜日から0スタート
    const startDayOfWeek = dayjs(monthStartDay).format("d");

    // カレンダーの初日を取得
    const calendarStartDay = dayjs(monthStartDay).subtract(Number(startDayOfWeek), 'd').format("YYYYMMDD");

    // カレンダーを作成
    let addDay = 0;
    // 6週間分ループ
    for (let i = 0; i < 6; i++) {
      // 週毎データ格納用配列
      const weekItem: DayProps[] = [];

      // 7日間分ループ
      for (let n = 0; n < 7; n++) {
        // カレンダー初日からの日付
        let day = Number(dayjs(calendarStartDay).add(addDay, 'd').format("DD"));
        // onClickで使用する日付
        let yyyymmdd = Number(dayjs(calendarStartDay).add(addDay, 'd').format("YYYYMMDD"));
        // cheked判定に使用する日付
        let yyyymmddSlash = dayjs(calendarStartDay).add(addDay, 'd').format("YYYY/MM/DD");
        // 別月フラグ
        let otherMonthFlg;

        // 別月判定
        if ((addDay <= 7 && day >= 8)
            || (addDay >= 29 && day <= 14)) {
          otherMonthFlg = true;
        } else {
          otherMonthFlg = false;
        }

        // 日付データ
        const dayItem: DayProps = {
          yyyymmddSlash: yyyymmddSlash,
          yyyymmdd: yyyymmdd,
          day : day,
          otherMonthFlg: otherMonthFlg
        }

        // 7日分の日付データを週データにpush
        weekItem.push(dayItem);

        addDay += 1;
      }
      // 6週分のデータをpush
      const WeekData: WeekProps = {
        dayData: weekItem
      }
      weekArray.push(WeekData);
    }
    console.log(weekArray);
  }

  // 前月のカレンダー表示
  const dispPreMonth = () => {
    // 表示中カレンダーの前月を取得(YYYY/MM/01形式)
    const preMonth = dayjs(calendarTopYm + "/01").subtract(1, 'M').format("YYYY/MM/DD");
    // 選択日付にセット
    setSelectDay(preMonth);
    // カレンダー生成
    createCalendar(preMonth);
  }

  // 来月のカレンダー表示
  const dispNextMonth = () => {
    // 表示中カレンダーの来月を取得(YYYY/MM/01形式)
    const nextMonth = dayjs(calendarTopYm + "/01").add(1, 'M').format("YYYY/MM/DD");
    // 選択日付にセット
    setSelectDay(nextMonth);
    // カレンダー生成
    createCalendar(nextMonth);
  }

  // 前年のカレンダー表示
  const dispPreYear = () => {
    // 表示中カレンダーの前年を取得(YYYY/MM/01形式)
    const preYear = dayjs(calendarTopYm + "/01").subtract(1, 'y').format("YYYY/MM/DD");
    // 選択日付にセット
    setSelectDay(preYear);
    // カレンダー生成
    createCalendar(preYear);
  }

  // 来年のカレンダー表示
  const dispNextYear = () => {
    // 表示中カレンダーの来年を取得(YYYY/MM/01形式)
    const nextYear = dayjs(calendarTopYm + "/01").add(1, 'y').format("YYYY/MM/DD");
    // 選択日付にセット
    setSelectDay(nextYear);
    // カレンダー生成
    createCalendar(nextYear);
  }

  // 選択した日付を呼び出し元コンポーネントにセット
  const setDate = () => {
    // 呼び出し元の日付セットメソッド呼び出し
    props.setDate(selectDay, props.isMentenanceReport);
    // カレンダーモーダルのクローズ
    props.closeCalendar();
  }

  return (
    <div className="com01-calendar-area">
      <div className="com01-calendar-header">
        <p>日付選択</p>
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeCalendar}/>
        </div>
      </div>
      <div className="com01-calendar-contents">
        <div className="com01-change-month">
          <div className="com01-change-month-icon">
            <img src="/images/leftDoubleArrow.svg" alt="SVG" onClick={dispPreYear} />
          </div>
          <div className="com01-change-month-icon">
            <img src="/images/leftArrow.svg" alt="SVG" onClick={dispPreMonth} />
          </div>
          <div>
            <p>{calendarTopYm}</p>
          </div>
          <div className="com01-change-month-icon">
            <img src="/images/rightArrow.svg" alt="SVG" onClick={dispNextMonth} />
          </div>
          <div className="com01-change-month-icon">
            <img src="/images/rightDoubleArrow.svg" alt="SVG" onClick={dispNextYear} />
          </div>
        </div>
        <div className="com01-calendar-body">
          <div className="com01-day-of-week">
            <p>日</p>
            <p>月</p>
            <p>火</p>
            <p>水</p>
            <p>木</p>
            <p>金</p>
            <p>土</p>
          </div>

          {weekArray.map((week) => {
            return (
              <div className="com01-week" key={week.dayData[0].yyyymmdd}>
                {week.dayData.map((day) => {
                  return (
                    <label
                      htmlFor={String(day.yyyymmdd)}
                      key={day.yyyymmdd}
                    >
                      <input
                        id={String(day.yyyymmdd)}
                        onClick={calendarClick}
                        data-day={day.yyyymmdd}
                        type="radio"
                        name="calendar"
                        checked={selectDay === day.yyyymmddSlash}
                      />
                      {day.otherMonthFlg === false ? (
                        <p className="com01-this-month">
                          {day.day}
                        </p>
                      ) : (
                        <p className="com01-other-month">
                          {day.day}
                        </p>
                      )}
                    </label>
                  )
                })}
              </div>
            )
          })}
          {/* {parse(calendar)} */}
        </div>
        <div className="com01-select-day">
          <p>{selectDay}</p>
        </div>
      </div>
      <div className="com01-calendar-button">
        <button className="com01-close-button" onClick={props.closeCalendar}>キャンセル</button>
        <button className="com01-ok-button" onClick={setDate}>OK</button>
      </div>
    </div>
  );
// };
};

export default CommonCalendar;
