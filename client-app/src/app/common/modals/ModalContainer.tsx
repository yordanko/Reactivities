import { observer } from "mobx-react-lite";
import { Modal } from "semantic-ui-react";
import { useStore } from "../../stores/store";
import { ReduxRootState, useAppDispatch } from "../../store-redux/store";
import { useSelector } from "react-redux";
import { ModalReduxStoreType, modalSlice } from "../../store-redux/modalSlice";
import LoginForm from "../../../features/users/LoginForm";
import RegsiterForm from "../../../features/users/RegsiterForm";

export default observer(function ModalContainer() {
    const modalState: ModalReduxStoreType = useSelector(
      (state: ReduxRootState) => state.modalReducer
    );
    const dispatch = useAppDispatch();
    return (
      <Modal
        open={modalState.open}
        onClose={()=>dispatch(modalSlice.actions.closeModal())}
        size="tiny"
      >
        <Modal.Content>
            {modalState.elementName ==='LoginForm' ? 
                <LoginForm/>
                :
                <RegsiterForm/>
            }
        </Modal.Content>
      </Modal>
    );
})