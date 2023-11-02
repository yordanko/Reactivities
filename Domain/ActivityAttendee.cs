using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    //Note: Manualy create many to many (activity to user) class
    //traditionaly can be done by using convention it adds ICollection<Activity> on AppUser class and also
    //ICollection<AppUser> Users in Activity class
    public class ActivityAttendee
    {
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }
        public Guid ActivityId { get; set; }
        public Activity Activity { get; set; }   
        public bool IsHost { get; set; }
    }
}