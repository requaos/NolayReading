"use strict";
exports.__esModule = true;
exports.Decrypt = exports.Encrypt = void 0;
var CryptoJS = require("crypto-js");
var iv = '1234567887654321';
// 加密
function Encrypt(text, key) {
    var message = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
    //message = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(message));
    return message;
}
exports.Encrypt = Encrypt;
// 解密
function Decrypt(text, key) {
    //let decData = CryptoJS.enc.Base64.parse(text);
    var decrypted = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
exports.Decrypt = Decrypt;
console.log(Encrypt("JIUSHI123123123", "ac8608e434324565"));
console.log(Decrypt("esuXjtZfOI+wcc9agKO8aA==", "ac8608e434324565"));
