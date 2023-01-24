import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable, runInAction } from "mobx";
import { ChatComment } from "../models/comment";
import { store } from "./store";

//to install signalR on the client use command: npm install @microsoft/signalr
export default class CommentStore {
    comments: ChatComment[] = [];
    hubConnection: HubConnection | null = null; 

    constructor() {
        makeAutoObservable(this);
    }

    createHubConnection = (activityId: string) => {
        if (store.activityStore.selectedActivity) {
          this.hubConnection = new HubConnectionBuilder()
            .withUrl(
              process.env.REACT_APP_CHAT_URL + "?activityId=" + activityId,
              {
                //pass token
                accessTokenFactory: () => store.userStore.user?.token!,
              }
            )
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

          this.hubConnection
            .start()
            .catch((error) =>
              console.log("Error establishing connection: ", error)
            );

          //make sure 'LoadComments' much Caller call inside class ChatHub, function OnConnectedAsync()
          this.hubConnection.on("LoadComments", (comments: ChatComment[]) => {
            runInAction(() => {
              comments.forEach((comment) => {
                comment.createdAt = new Date(comment.createdAt);
              });
              this.comments = comments;
            });
          });

          this.hubConnection.on("ReceiveComment", (comment) => {
            runInAction(() => {
              comment.createdAt = new Date(comment.createdAt);
              this.comments.unshift(comment);
            });
          });
        }
    }

    stopHubConnection = () => {
        this.hubConnection?.stop().catch(error => console.log('Error stopping connection: ', error));
    }

    //used when user disconnect
    clearComments = () => {
        this.comments = [];
        this.stopHubConnection();
    }

    addComment = async (values: any) => {
        values.activityId = store.activityStore.selectedActivity?.id;
        try {
            //'SendComment' muches Class ChatHub added method!
            await this.hubConnection?.invoke('SendComment', values);
        } catch (error) {
            console.log(error);
        }
    }
}

