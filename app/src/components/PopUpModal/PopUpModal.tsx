import React from "react";
import Modal from "react-bootstrap/Modal";
import "./style.css";
export interface PopUpProps {
  show: boolean;
  onClose: () => void;
  type: "success" | "error" | "info";
  title?: string | undefined;
  message?: string | undefined;
}
const PopUpModal: React.FC<PopUpProps> = (props: PopUpProps) => {
  return (
    <Modal
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
        <div onClick={props.onClose} className="close-icon">
          X
        </div>
        <img
          src={`/wp-includes/images/${
            props.type == "success" ? "tick" : "wrong"
          }.png`}
          alt="not found"
          className="type-icon"
        />
        <div className="popup-title">{props.title ?? ""}</div>
        <div className="popup-message">{props.message ?? ""}</div>
        <button className="popup-button" onClick={props.onClose}>
          Done
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default PopUpModal;
