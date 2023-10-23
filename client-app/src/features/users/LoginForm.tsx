import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header, Label } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import { useSelector } from "react-redux";
import { ReduxRootState, useAppDispatch } from "../../app/store-redux/store";
import { loginUser } from "../../app/store-redux/userSlice";
import { useEffect } from "react";
import { modalSlice } from "../../app/store-redux/modalSlice";
import { router } from "../../app/router/Routes";

export default observer(function LoginForm() {
    //const { userStore } = useStore();
    const {user} = useSelector((state: ReduxRootState) => state.userReducer);
    // const { token } = useSelector((state:ReduxRootState) =>{
    //     console.log(state.commonReducer);
    //     return state.commonReducer.token});
    const dispatch = useAppDispatch();

    const loggedIn = useEffect(()=>{
        if (user) {
          console.log("Inside useEffect in LoginForm");
          router.navigate("/activities");
          dispatch(modalSlice.actions.closeModal());
        }

    },[user]);
    return (
        <Formik
            initialValues={{ email: '', password: '', error: null }}
            onSubmit={(values, { setErrors }) =>
            dispatch(loginUser(values)).catch(error => setErrors({ error: 'Invalid email or password' }))}
        >
            {({ handleSubmit, isSubmitting, errors }) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Login to Reactivities' color="teal" textAlign="center" />
                    <MyTextInput placeholder="Email" name='email' />
                    <MyTextInput placeholder="Password" name='password' type='password' />
                    <ErrorMessage name='error' render={() => 
                        <Label style={{ marginBottom: 10 }} basic color='red' content={errors.error} />} />
                    <Button loading={isSubmitting} positive content='Login' type="submit" fluid />
                </Form>
            )}

        </Formik>
    )
})