using System.Text.Json;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader(this HttpResponse response, int currentPage,
            int itemsPerPage, int totalItems, int totalPages)
        {
            var paginationHeader = new
            {
                currentPage,
                itemsPerPage,
                totalItems,
                totalPages
            };
            response.Headers.Add("Pagination", JsonSerializer.Serialize(paginationHeader));

            //By adding to CORS policies next line we do not need to expose "Pagination" headers.
            //("WWW-Authenticate", "Pagination") overrides next line and there is no need

            //Note: Expose custom "Pagination" headers otherwise CORS will not let browser about it
            //response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
    }
}

