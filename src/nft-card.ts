import { css, customElement, html, LitElement, property } from 'lit-element'
import {Decrypt} from './aes-nolay'
import axios from 'axios'
// @ts-ignore ts error TS7016
/* lit-element classes */
import {is_login, is_logining, set_logining, set_unlogining} from './unipass-login'
import {getDataFromUrl, getPubkey, getSigFromUrl,getAddress,getTimestamp,saveTimestamp} from './localdata'
import './nft-card-front.ts'
import { ButtonEvent } from './types'
let CryptoJS = require("crypto-js")

/**
 * Nft-card element that manages front & back of card.
 * Facilitates acquisition and distribution data between
 * components.
 * Registers <nolay-card> as an HTML tag.
 */
@customElement('nolay-card')
export class NolayCard extends LitElement {
  /* User configurable properties */
  @property({ type: String }) public tokenId: string = ''
  @property({ type: String }) public qrcode: string = ''
  @property({ type: String }) public qrcode_display: string = "0"
  @property({ type: String }) public lock_display: string = "1"
  @property({ type: String }) public is_login: boolean = false
  @property({ type: String }) public has_enc: boolean = false
  @property({ type: String }) public enc_message: string = ''
  @property({ type: String }) public page_display: string = "5"
  @property({ type: String }) public message: string = ''
  @property({ type: String }) public status_of_query_ownership: boolean = false
  
  static get styles() {
    return css`
      :host {
        all: initial;
      }
      p {
        margin: 0;
        -webkit-font-smoothing: antialiased;
      }
      .card {
        background-color: white;
        font-family: 'Roboto', sans-serif;
        -webkit-font-smoothing: antialiased;
        font-style: normal;
        font-weight: normal;
        line-height: normal;
        border-radius: 5px;
        perspective: 1000px;
        margin: auto;
      }
      .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.6s;
        transform-style: preserve-3d;
        box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.25);
        border-radius: 5px;
      }
      .flipped-card .card-inner {
        transform: rotateY(180deg);
      }
      .card .error {
        height: 100%;
        display: flex;
        flex-flow: column;
        justify-content: center;
      }
      .card .error-moji {
        font-size: 50px;
      }
      .card .error-message {
        font-size: 16px;
      }
      .QR-code {
        width: 150px;
        height: 150px;
        opacity: 0;
        transition:opacity 0.5s;
        z-index:2;
      }
    `
  }

  public renderErrorTemplate() {
    return html`
      <div class="error">
        <div class="error-moji">¯\\_(ツ)_/¯</div>
        <div class="error-message">Problem loading asset.</div>
      </div>
    `
  }

  public renderLoaderTemplate() {
    return html`
      <loader-element></loader-element>
    `
  }


  public loginUnipass(){
    // 判断是否已经登录
    if (is_login()){
      this.is_login = true;
       // Good 
    }else{
      // 判断是否正在登录
      if(is_logining()){
        //如果 正在登录，看看url链接，判断自己是不是 登录跳转回来的
        var login_ret = getDataFromUrl();
        if (login_ret) {
          this.is_login = true;
          return;
        }
        set_unlogining()
      }else{
        // 没有登录的话 跳转到登录链接
        // 并且is_logining
        set_logining();
        var login_url = `https://unipass.xyz/login?success_url=${window.location.href}`
        console.log("login_url: ", login_url);
        window.location.href = login_url;
      } 
    }
  }

  public getPrivkey(): string | null{
    var priv_key = localStorage.getItem(this.tokenId + "priv_key");
    console.log("priv_key: ", priv_key);
    return priv_key;
  }
  
  public savePrivkey(data: string) {
    localStorage.setItem(this.tokenId + "priv_key", data);
  }

  public proof_ownership(): string{
    // if 当前href是已经 跳转回来的
    var sig = getSigFromUrl();
    console.log("[+] 已经进入proof_ownership分支，sig是", sig)
    if(sig != ''){
      console.log("[+] 已经进入proof_ownership分支1")
      //  组装成proof_ownership接口 发出去，
      var proof_req:any = {};
      proof_req.data = {
        "token_id":this.tokenId,
        "timestamp": getTimestamp()
      };
      proof_req.sign=sig;
      axios.get(`http://localhost:5000/proof_ownership/${JSON.stringify(proof_req)}`).then((response) => { // TODO: 发布之前把这个改回https://leepanda.top:5000/detail/
      // handle success
        var status = response.data.status;
        if(status){
          console.log("[+] 处理priv_key 分支");
          var key = response.data.priv_key;
          //  记录priv_key 到 localStorage
          this.savePrivkey(key);
          return key;
        }else{
          return '';
        }
      });
      return '';
    }
    saveTimestamp(Math.floor(Date.now()/1000).toString())
    var proof_req_unsigned:any = {
        "token_id":this.tokenId,
        "timestamp": getTimestamp()
      };
    var message = CryptoJS.SHA256(JSON.stringify(proof_req_unsigned)).toString()
    var url = `https://unipass.xyz/sign?success_url=${window.location.href}&pubkey=${getPubkey()}&message=${message}`
    window.location.href = url; 
    return '';
  }

  public queryOwnership(){
    var query_req:any = {};
    query_req = {
      "token_id":this.tokenId,
      "address": getAddress(),
    };
    var query_req_string = JSON.stringify(query_req);
    axios.get(`http://localhost:5000/query_ownership/${query_req_string}`).then((response) => { // TODO: 发布之前把这个改回https://leepanda.top:5000/detail/
      // handle success
      const obj = response.data
      this.status_of_query_ownership = obj.status;
    });
  }

  public initializeNolay() {
    this.loginUnipass();
    // 如果未登录，啥事不发生
    this.message = this.enc_message;
    if (this.is_login){
      this.queryOwnership();
      var priv_key = this.getPrivkey();
      console.log("[+] status and priv_key", this.status_of_query_ownership, priv_key);
      if ( this.status_of_query_ownership && !priv_key){
        // 有权限 但是没有私钥，拿一下私钥
        this.proof_ownership();
      }
      var priv_key = this.getPrivkey();
      if(priv_key){
        // 用私钥解密一下enc_message 放到message里面
        this.message = Decrypt(this.enc_message, priv_key);
        console.log(this.message);
        // 并且透明度page_display调为0
        this.page_display = "0";
      }
    }
    //    query 是否有ownership
    //    如果 有ownership && 没有 priv_key
    //      需要证明 自己是address
    //      只需证明一次 priv_key存入localstorage
    // get token detail by api
    axios.get(`http://localhost:5000/detail/${this.tokenId}`).then((response) => { // TODO: 发布之前把这个改回https://leepanda.top:5000/detail/
                                // handle success
                                const obj = response.data
                                this.qrcode = obj.qrcode
                              })
  }

  public render() {
    this.initializeNolay();
    return html`
      <nft-card-front
        @button-event="${this.eventHandler}"
        .page_display="${this.page_display}"
        .message="${this.message}"
      ></nft-card-front>
      <img class="QR-code" src="${this.qrcode}" style="opacity: ${this.qrcode_display}">
    `
  }


  private async eventHandler(event: ButtonEvent) {
    const { detail } = event

    switch (detail.type) {
      case 'buy':
        this.buy()
        break
    }
  }

  private buy = () => {
    //const url = this.qrcode
    if(this.page_display == "0"){
      this.qrcode_display = "0"
      return
    }
    var obj = this.qrcode_display
    if (obj != "0"){
      this.qrcode_display = "0"
    }else{
      this.qrcode_display = "1"
    }
    this.render()
  }
}