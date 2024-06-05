import React from "react";
import "./DeleteModal.css";

export type DeleteProps = {
  closeModal: () => void;
  delete: () => void;
  modalText: string;
};

export const DeleteModal: React.FC<DeleteProps> = props => {

  return (
    <div className="page03-delete-modal-area">
      <div className="page03-delete-modal-header">
        <div>
          <img src="/images/modalClose.svg" alt="SVG" onClick={props.closeModal}/>
        </div>
      </div>
      <div className="page03-delete-modal-contents">
        <div>
          <p>{props.modalText}</p>
        </div>
      </div>
      <div className="page03-delete-modal-button">
        <button className="page03-delete-modal-close-button" onClick={props.closeModal}>キャンセル</button>
        <button className="page03-delete-modal-ok-button" onClick={props.delete}>OK</button>
      </div>
    </div>
  );
};

export default DeleteModal;
