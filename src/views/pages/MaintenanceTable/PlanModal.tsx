import React from "react";
import "./PlanModal.css";

export type PlanProps = {
  description: string;
  closeModal: () => void;
  makePlan: () => void;
};

export const PlanModal: React.FC<PlanProps> = props => {

  return (
    <div className="page01-plan-modal-area">
      <div className="page01-plan-modal-header">
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="page01-plan-modal-contents">
        <div>
          <p>選択した日付に作業を設定しますか？</p>
        </div>
      </div>
      <div className="page01-plan-modal-button">
        <button className="page01-plan-modal-close-button" onClick={props.closeModal}>キャンセル</button>
        <button className="page01-plan-modal-ok-button" onClick={props.makePlan}>OK</button>
      </div>
    </div>
  );
};

export default PlanModal;
