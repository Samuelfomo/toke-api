export default class HttpStatus {
    // 2xx Success
    static SUCCESS = 200;
    static CREATED = 201;
    static ACCEPTED = 202;
    static NO_CONTENT = 204;
    static RESET_CONTENT = 205;
    static PARTIAL_CONTENT = 206;
    static MULTI_STATUS = 207;
    static ALREADY_REPORTED = 208;
    static IM_USED = 226;

    // 3xx Redirection
    static MULTIPLE_CHOICES = 300;
    static MOVED_PERMANENTLY = 301;
    static FOUND = 302;
    static SEE_OTHER = 303;
    static NOT_MODIFIED = 304;
    static USE_PROXY = 305;
    static SWITCH_PROXY = 306;
    static TEMPORARY_REDIRECT = 307;
    static PERMANENT_REDIRECT = 308;

    // 4xx Client Error
    static BAD_REQUEST = 400;
    static UNAUTHORIZED = 401;
    static PAYMENT_REQUIRED = 402;
    static FORBIDDEN = 403;
    static NOT_FOUND = 404;
    static METHOD_NOT_ALLOWED = 405;
    static NOT_ACCEPTABLE = 406;
    static REQUEST_TIMEOUT = 408;
    static CONFLICT = 409;
    static GONE = 410;
    static PRECONDITION_FAILED = 412;
    static SECTION_EXPIRED = 419;
    static UNPROCESSABLE_ENTITY = 422;
    static LOCKED = 423;
    static FAILED_DEPENDENCY = 424;
    static TOO_EARLY = 425;
    static UPGRADE_REQUIRED = 426;
    static PRECONDITION_REQUIRED = 428;
    static TOO_MANY_REQUESTS = 429;
    static UNAVAILABLE_FOR_LEGAL_REASONS = 451;

    // 5xx Server Error
    static INTERNAL_ERROR = 500;
    static NOT_IMPLEMENTED = 501;
    static BAD_GATEWAY = 502;
    static SERVER_UNAVAILABLE = 503;
    static GATEWAY_TIMEOUT = 504;
    static HTTP_VERSION_NOT_SUPPORTED = 505;
    static VARIANT_ALSO_NEGOTIATES = 506;
    static INSUFFICIENT_STORAGE = 507;
    static LOOP_DETECTED = 508;
    static NOT_EXTENDED = 510;
    static NETWORK_AUTHENTICATION_REQUIRED = 511;
}
