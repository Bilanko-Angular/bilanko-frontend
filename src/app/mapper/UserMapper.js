"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
var UserMapper = /** @class */ (function () {
    function UserMapper() {
    }
    UserMapper.toRegisterDto = function (user) {
        var _a, _b, _c, _d;
        return {
            name: (_a = user.nom) !== null && _a !== void 0 ? _a : '',
            subname: (_b = user.subname) !== null && _b !== void 0 ? _b : '',
            email: (_c = user.email) !== null && _c !== void 0 ? _c : '',
            password: (_d = user.password) !== null && _d !== void 0 ? _d : '',
        };
    };
    UserMapper.fromRegisterDto = function (dto, id) {
        return {
            id: id,
            nom: dto.name,
            subname: dto.subname,
            email: dto.email,
        };
    };
    UserMapper.toLoginDto = function (user) {
        var _a, _b;
        return {
            email: (_a = user.email) !== null && _a !== void 0 ? _a : '',
            password: (_b = user.password) !== null && _b !== void 0 ? _b : '',
        };
    };
    return UserMapper;
}());
exports.UserMapper = UserMapper;
