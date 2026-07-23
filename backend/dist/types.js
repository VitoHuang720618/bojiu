// 錯誤型別
export var UploadErrorType;
(function (UploadErrorType) {
    UploadErrorType["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    UploadErrorType["INVALID_FORMAT"] = "INVALID_FORMAT";
    UploadErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    UploadErrorType["SERVER_ERROR"] = "SERVER_ERROR";
    UploadErrorType["PERMISSION_DENIED"] = "PERMISSION_DENIED";
})(UploadErrorType || (UploadErrorType = {}));
export class UploadError extends Error {
    type;
    details;
    constructor(message, options) {
        super(message);
        this.name = 'UploadError';
        this.type = options.type;
        this.details = options.details;
    }
}
//# sourceMappingURL=types.js.map