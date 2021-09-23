"use strict";
exports.__esModule = true;
exports.Decrypt = exports.Encrypt = void 0;
var CryptoJS = require("crypto-js");
var iv = '1234567887654321';
// 加密
function Encrypt(text, key) {
    return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
}
exports.Encrypt = Encrypt;
// 解密
function Decrypt(text, key) {
    var decrypted = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
exports.Decrypt = Decrypt;
var enc = Encrypt("pandatea", 'aaaabbbbccccdddd');
console.log(enc);
var msg = Decrypt(enc, 'aaaabbbbccccdddd');
console.log(msg);
