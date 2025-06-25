import React, { useState } from "react";
import { DeleteIcon } from "../../icon/Icon";
import Modal from "../../modal/Modal";
import Button from "../../button/Button";
import { useDeletePost } from "../../../hooks";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../../button/StyledButton";
import { StyledDeletePostModalContainer } from "./DeletePostModalContainer";
import { useClickOutside } from "../../../hooks";

interface DeletePostModalProps {
  show: boolean;
  onClose: () => void;
  id: string;
}

export const DeletePostModal = ({
  show,
  id,
  onClose,
}: DeletePostModalProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const deletePostMutation = useDeletePost();
  const { t } = useTranslation();

  // Use click outside hook to close the dropdown menu
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    if (show && !showModal) {
      onClose();
    }
  });

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync(id);
      handleClose();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {show && (
        <>
          <StyledDeletePostModalContainer
            ref={dropdownRef}
            onClick={() => setShowModal(true)}
          >
            <DeleteIcon />
            <p>{t("buttons.delete")}</p>
          </StyledDeletePostModalContainer>
          <Modal
            title={t("modal-title.delete-post") + "?"}
            text={t("modal-content.delete-post")}
            show={showModal}
            onClose={handleClose}
            acceptButton={
              <Button
                text={t("buttons.delete")}
                buttonType={ButtonType.DELETE}
                size={"MEDIUM"}
                onClick={handleDelete}
              />
            }
          />
        </>
      )}
    </>
  );
};

export default DeletePostModal;
