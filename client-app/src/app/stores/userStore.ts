import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { router } from "../router/Routes";
import { store } from "./store";

export default class UserStore {
    user: User | null = null;
    fbLogin =false;
    refreshTokenTimeout:any;

    constructor() {
        makeAutoObservable(this)
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds)
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.register(creds);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error: any) {
            if (error?.response?.status === 400) throw error;
            store.modalStore.closeModal();
            console.log(500);
        }
    }


    logout = () => {
        store.commonStore.setToken(null);
        this.user = null;
        router.navigate('/');
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    setImage = (image: string) => {
        if (this.user) this.user.image = image;
    }

    setUserPhoto = (url: string) => {
        if (this.user) this.user.image = url;
    }

    setDisplayName = (name: string) => {
        if (this.user) this.user.displayName = name;
    }

    facebookLogin = async(accessToken:string)=>{
        try{
            this.fbLogin =true;
            const user = await agent.Account.fbLogin(accessToken);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(()=>{
                this.user = user;
                this.fbLogin = false;
            })
            router.navigate('/activities');
        } catch(error){
            console.log(error);
            runInAction(() => this.fbLogin = false);
        }
    }

    refreshToken = async () => {
         this.stopRefreshTokenTimer();
        try{
            const user = await agent.Account.refreshToken();
            runInAction( () => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        }
        catch(error){
            console.log(error);
        }
    }

    private startRefreshTokenTimer(user: User){
       
      //split token and get part after .
      const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
      //same code as above, but it is not working
      //const jwtToken = JSON.parse(Buffer.from(user.token.split('.')[1],'base64').toString());

      //get expiry date of a token
      const expires = new Date(jwtToken.exp * 1000);

      //calculate 30 seconds before expiry of the token
      const timeout = expires.getTime() - Date.now() - (30 * 1000);
      this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }

    private stopRefreshTokenTimer(){
        clearTimeout(this.refreshTokenTimeout);
    }
}