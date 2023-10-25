import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import { observer } from 'mobx-react-lite';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import { useSelector } from 'react-redux';
import { ReduxDispatch, ReduxRootState, useAppDispatch } from '../store-redux/store';
import { commonSlice } from '../store-redux/commonSlice';
import { getUser, userSlice } from '../store-redux/userSlice';

function App() {
  const location = useLocation();
  const userState = useSelector((state:ReduxRootState) => state.userReducer);
  const commonState = useSelector((state:ReduxRootState) => state.commonReducer);
  const dispatch: ReduxDispatch = useAppDispatch();


  useEffect(() => {
    if (commonState.token) {
      //NOTE: dispatch passes getUser() which is api call to get user, not userSlice.actions.getUser()
      //because createAsyncThunk is used for getUser
      dispatch(getUser()).finally(() => dispatch(commonSlice.actions.setAppLoaded()));
    } else {
      dispatch( commonSlice.actions.setAppLoaded());
    }
  }, [commonState]);

  if (!commonState.appLoaded)
    return <LoadingComponent content="Loading app..." />;

  return (
    <>
      <ScrollRestoration />
      <ModalContainer />
      <ToastContainer position='bottom-right' hideProgressBar theme='colored' />
      {location.pathname === '/' ? <HomePage /> : (
        <>
          <NavBar />
          <Container style={{ marginTop: '7em' }}>
            <Outlet />
          </Container>
        </>
      )}
    </>
  );
}

export default observer(App);
