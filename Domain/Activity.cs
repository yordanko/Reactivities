namespace Domain
{
    public class Activity
    {
        //Note: ICollection<ActivityAttendee>. It is one to many ActivityAttendee
        public Guid Id { get; set; }
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string City { get; set; }
        public string Venue { get; set; }
        public bool IsCancelled { get; set; }

        //Note: next collections are initialized. They will not be set to null, instead will be empty array []
        public ICollection<ActivityAttendee> Attendees { get; set; } = new List<ActivityAttendee>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}