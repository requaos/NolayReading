let CryptoJS = require("crypto-js")

const iv = '1234567887654321'

// 加密
export function Encrypt (text: string, key:string) {
  var message = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString()
  //message = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(message));
  return message
}

// 解密
export function Decrypt (text: string, key:string) {
  //let decData = CryptoJS.enc.Base64.parse(text);
  let decrypted = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

console.log(Encrypt("JIUSHI123123123","ac8608e434324565"))
console.log(Decrypt("esuXjtZfOI+wcc9agKO8aA==","ac8608e434324565"))
