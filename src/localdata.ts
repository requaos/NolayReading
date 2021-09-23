var urlencode = require('urlencode');
import {
    Blake2bHasher,
    HashType,
    Script
  } from '@lay2/pw-core';
/*
 * @Author: Aven
 * @Date: 2021-04-26 14:18:43
 * @LastEditors: Aven
 * @LastEditTime: 2021-05-13 19:52:16
 * @Description:
 */
const ADDRESS_KEY = 'unipass_address';
const PUBLIC_KEY = 'unipass_pubkey';
export interface UnipassData {
  email: string;
  address: string;
  pubkey: string;
  sig?: string;
}
export function getPubkey(): string | null{
  return localStorage.getItem(PUBLIC_KEY);
}

export function savePubkey(data: string) {
  localStorage.setItem(PUBLIC_KEY, data);
}

export function getAddress(): string | null{
  return localStorage.getItem(PUBLIC_KEY);
}

export function saveAddress(address: string) {
  localStorage.setItem(ADDRESS_KEY, address);
}

export function Logout() {
  localStorage.remove(ADDRESS_KEY);
  localStorage.remove(PUBLIC_KEY);
}

export function pubkeyToAddress(pubkey: string): string {
    const pubKeyBuffer = Buffer.from(pubkey.replace('0x', ''), 'hex');

    const hashHex = new Blake2bHasher()
      .update(pubKeyBuffer.buffer)
      .digest()
      .serializeJson()
      .slice(0, 42);
    console.log('------hashHex', hashHex);
    let script: Script;
    script = new Script(
    '0x614d40a86e1b29a8f4d8d93b9f3b390bf740803fa19a69f1c95716e029ea09b3',
    hashHex,
    HashType.type
    );

    return script.toAddress().toCKBAddress();
  }

export interface UnipassDataResp {
    data: {
      email?: string;
      pubkey?: string;
      recovery?: string;
      sig?: string;
    };
    info: string;
    code: number;
  }

export function getDataFromUrl(): boolean { // 这个是登录后的解析函数
    const url = new URL(window.location.href);
      console.log('getDataFromUrl--', url);
      let data = '';
      data = url.searchParams.get('unipass_ret') as string;
      if (data == ''){
        console.log("不是登录callback link")
        return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const unipassStr = urlencode.decode(data, 'utf-8');
    var unipassData = JSON.parse(unipassStr) as UnipassDataResp;
    console.log(unipassData);
    if (unipassData.code === 200) {
      // todo save data
      if (unipassData.data.pubkey) {
        const ckbAddress = pubkeyToAddress(unipassData.data.pubkey);
        console.log('ckbAddress', ckbAddress);
        saveAddress(ckbAddress);
        savePubkey(unipassData.data.pubkey);
        return true;
      }
    }
    return false;
  }