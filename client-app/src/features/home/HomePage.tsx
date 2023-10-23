import { observer } from 'mobx-react-lite';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Header, Segment, Image, Divider } from "semantic-ui-react";
import { useStore } from '../../app/stores/store';
import LoginForm from '../users/LoginForm';
import RegsiterForm from '../users/RegsiterForm';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useSelector } from 'react-redux';
import { ReduxRootState, useAppDispatch } from '../../app/store-redux/store';
import { IsUserLoggedIn, UserReduxStoreType } from '../../app/store-redux/userSlice';
import { modalSlice } from '../../app/store-redux/modalSlice';

export default observer(function HomePage() {
    const userName  = useSelector(
      (state: ReduxRootState) => state.userReducer.user?.displayName
    );
    const dispatch = useAppDispatch();
    const logedIn = IsUserLoggedIn();

    //const modal = useSelector((state:ReduxRootState) => state.modalReducer)
    return (
      <Segment inverted textAlign="center" vertical className="masthead">
        <Container text>
          <Header as="h1" inverted>
            <Image
              size="massive"
              src="/assets/logo.png"
              alt="logo"
              style={{ marginBottom: 12 }}
            />
            Reactivities
          </Header>
          {logedIn ? (
            <>
              <Header as="h2" inverted content={`Welcome back ${userName}`} />
              <Button as={Link} to="/activities" size="huge" inverted>
                Go to activities!
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() =>
                  dispatch(modalSlice.actions.openModal("LoginForm"))
                }
                size="huge"
                inverted
              >
                Login!
              </Button>
              <Button
                onClick={() =>
                  dispatch(modalSlice.actions.openModal("RegsiterForm"))
                }
                size="huge"
                inverted
              >
                Register
              </Button>
              <Divider horizontal inverted>
                Or
              </Divider>
              <Button
                as={FacebookLogin}
                appId="2095249933999664"
                size="huge"
                inverted
                color="facebook"
                content="Login with Facebook"
                //loading={userStore.fbLogin}
                onSuccess={(response: any) => {
                  console.log("Login succes", response);
                  //user.facebookLogin(response.accessToken);
                }}
                onFail={(response: any) => {
                  console.log("Login failed", response);
                }}
              />
            </>
          )}
        </Container>
      </Segment>
    );
})