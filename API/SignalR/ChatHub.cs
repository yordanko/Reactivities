using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    //Custom class inherited from Hub.No need to install Nuget package 
    public class ChatHub : Hub
    {
        //It is optional but this implementation uses MediatR, so needs to inject it
        private readonly IMediator _mediator;

        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        //Client will be able to invoke methods with the hub, So client will be able to call any public method in the Hub
        public async Task SendComment(Create.Command command)
        {
            var comment = await _mediator.Send(command);

            //comment will be send to group matching Id of activity id
            await Clients.Group(command.ActivityId.ToString())
            //ReceiveComment is method needed to receive message
                .SendAsync("ReceiveComment", comment.Value);
        }

        //When client connect ChatHub, the group they will join is activity id group
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var activityId = httpContext.Request.Query["activityId"];
            await Groups.AddToGroupAsync(Context.ConnectionId, activityId);

            //get comments from database
            var result = await _mediator.Send(new List.Query{ActivityId = Guid.Parse(activityId)});

            //send it to caller
            await Clients.Caller.SendAsync("LoadComments", result.Value);
        }
    }
}

