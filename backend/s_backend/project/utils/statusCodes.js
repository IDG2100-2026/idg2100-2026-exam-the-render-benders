// STATUS CODES
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
const httpStatus = {
    // 2xx - SUCCESS
    OK:                     {code: 200, message: 'OK'},                   // 200 - The request succeeded (Meaning of success depends on Method). (f.ex get book list, get user details, update book/user)
    CREATED:                {code: 201, message: 'Created'},              // 201 - The request succeeded, and a new resource was created as a result. (f.ex new user or book)
    ACCEPTED:               {code: 202, message: 'Accepted'},             // 202 - The request has been received but not yet acted upon. (A different process/server handles the request, or batch processing)
    NO_CONTENT:             {code: 204, message: 'No Content'},           // 204 - There is no content to send for this request, but the headers are useful. The user agent may update its cached headers for this resource with the new ones. (deleted book / return book)
    // 3xx - REDIRECTION
    SEE_OTHER:              {code: 303, message: 'See Other'},            // 303 – The server sent this response to direct the client to get the requested resource at another URI with a GET request.
    NOT_MODIFIED:           {code: 304, message: 'Not Modified'},         // 304 – This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.
    TEMPORARY_REDIRECT:     {code: 307, message: 'Temporary Redirect'},   // 307 – Temporary redirect preserving HTTP method
    PERMANENT_REDIRECT:     {code: 308, message: 'Permanent Redirect'},   // 308 – Permanent redirect preserving HTTP method (Safer than 301 since it doesnt change method)
    // 4xx - CLIENT ERRORS
    BAD_REQUEST:            {code: 400, message: 'Bad Request'},          // 400 - The server cannot or will not process the request due to something that is perceived to be a client error (incorrect JSON, missing *fields)
    UNAUTHORIZED:           {code: 401, message: 'Unauthorized'},         // 401 - Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
    FORBIDDEN:              {code: 403, message: 'Forbidden'},            // 403 - The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. (normal user trying to create new book)
    NOT_FOUND:              {code: 404, message: 'Not Found'},            // 404 - The server cannot find the requested resource. (Book or user doesnt exist)
    CONFLICT:               {code: 409, message: 'Conflict'},             // 409 - This response is sent when a request conflicts with the current state of the server., (Book already borrowed, duplicate email)
    IM_A_TEAPOT:            {code: 418, message: 'I\'m a teapot'},        // 418 - The server refuses to brew coffee because it is, permanently, a teapot. (Added for fun :D)
    UNPROCESSABLE_ENTITY:   {code: 422, message: 'Unprocessable Entity'}, // 422 - The request was well-formed but was unable to be followed due to semantic errors. (invalid email format or book ISBN is invalid)
    TOO_MANY_REQUESTS:      {code: 429, message: 'Too Many Requests'},    // 429 - The user has sent too many requests in a given amount of time (Here 100 per minute)
    // 5xx - SERVER ERRORS 
    INTERNAL_SERVER_ERROR:  {code: 500, message: 'Internal Server Error'},// 500 - The server has encountered a situation it does not know how to handle (Generic).
    NOT_IMPLEMENTED:        {code: 501, message: 'Not Implemented'},      // 501 - The request method is not supported by the server and cannot be handled.
    SERVICE_UNAVAILABLE:    {code: 503, message: 'Service Unavailable'},  // 503 - The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded.
    GATEWAY_TIMEOUT:        {code: 504, message: 'Gateway Timeout'}       // 504 - This error response is given when the server is acting as a gateway and cannot get a response in time.
};
export default httpStatus;