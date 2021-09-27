import { css, customElement, html, LitElement, property } from 'lit-element'
import {Decrypt} from './aes-nolay'
import axios from 'axios'
// @ts-ignore ts error TS7016
/* lit-element classes */
import {is_login, is_logining, set_logining, set_unlogining} from './unipass-login'
import {getDataFromUrl, getPubkey, getSigFromUrl,getAddress,getTimestamp,saveTimestamp} from './localdata'
import './nolay-card-front.ts'
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
  @property({ type: String }) public on_sell: boolean = true
  @property({ type: String }) public enc_message: string = ''
  @property({ type: String }) public page_display: string = "5"
  @property({ type: String }) public message: string = ''
  @property({ type: String }) public status_of_query_ownership: boolean = false
  @property({ type: String }) public is_proofed: boolean = false
  
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


  public loginUnipass(){
    // 判断是否已经登录
    if (is_login()){
      this.is_login = true;
       // Good 
    }else{
        // 没有登录的话 跳转到登录链接
        // 并且is_logining
        set_logining();
        var login_url = `https://unipass.xyz/login?success_url=${window.location.href}`
        window.location.href = login_url;
    }
  }

  public getPrivkey(): string | null{
    var priv_key = localStorage.getItem(this.tokenId + "priv_key");
    return priv_key;
  }
  
  public savePrivkey(data: string) {
    localStorage.setItem(this.tokenId + "priv_key", data);
  }

  public check_sig_and_proof_ownership(): string{
    var sig = getSigFromUrl();
    if(sig != '' && !this.is_proofed){
      //  组装成proof_ownership接口 发出去，
      var proof_req:any = {};
      proof_req.data = {
        "token_id":this.tokenId,
        "timestamp": getTimestamp()
      };
      proof_req.sign=sig;
      axios.get(`https://api.nolay.tech:5000/proof_ownership/${JSON.stringify(proof_req)}`).then((response) => { // TODO: 发布之前把这个改回https://api.nolay.tech:5000/detail/
      // handle success
        var status = response.data.status;
        if(status){
          var key = response.data.priv_key;
          //  记录priv_key 到 localStorage
          this.savePrivkey(key);
          if(key){
            this.is_proofed = true;
            // 用私钥解密一下enc_message 放到message里面
            this.message = Decrypt(this.enc_message, key);
            console.log(this.message);
            // 并且透明度page_display调为0
            this.qrcode_display = "0";
            this.page_display = "0";
          }
          return key;
        }else{
          return '';
        }
      });
      return '';
    }
    return '';
  }

  public proof_ownership(): string{
    // if 当前href是已经 跳转回来的
    var sig = getSigFromUrl();
    if(sig != ''){
      //  组装成proof_ownership接口 发出去，
      var proof_req:any = {};
      proof_req.data = {
        "token_id":this.tokenId,
        "timestamp": getTimestamp()
      };
      proof_req.sign=sig;
      axios.get(`https://api.nolay.tech:5000/proof_ownership/${JSON.stringify(proof_req)}`).then((response) => { // TODO: 发布之前把这个改回https://api.nolay.tech:5000/detail/
      // handle success
        var status = response.data.status;
        if(status){
          var key = response.data.priv_key;
          //  记录priv_key 到 localStorage
          this.savePrivkey(key);
          if(key){
            // 用私钥解密一下enc_message 放到message里面
            this.message = Decrypt(this.enc_message, key);
            this.enc_message = this.message;
            this.is_proofed = true;
            console.log(this.message);
            // 并且透明度page_display调为0
            this.qrcode_display = "0";
            this.page_display = "0";
          }
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
    axios.get(`https://api.nolay.tech:5000/query_ownership/${query_req_string}`).then((response) => { // TODO: 发布之前把这个改回https://api.nolay.tech:5000/detail/
      // handle success
      const obj = response.data
      this.status_of_query_ownership = obj.status;
    });
  }

  public initializeNolay() {
    this.message = this.enc_message

    if(is_logining()){
        //如果 正在登录，看看url链接，判断自己是不是 登录跳转回来的
        var login_ret = getDataFromUrl();
        if (login_ret) {
          this.is_login = true;
        }
        set_unlogining()
      }

    var sig = getSigFromUrl(); // 如果是签完名回来的 直接proof
    if(sig != '' && !this.is_proofed){
      this.proof_ownership()
      return
    }

    // 如果未登录，啥事不发生
    if (this.is_login){
      this.queryOwnership();
      var priv_key = this.getPrivkey();
      if ( this.status_of_query_ownership && !priv_key){
        // 有权限 但是没有私钥，拿一下私钥
        this.qrcode_display = "0";
        this.check_sig_and_proof_ownership()
      }
      var priv_key = this.getPrivkey();
      if(priv_key){
        // 用私钥解密一下enc_message 放到message里面
        this.message = Decrypt(this.enc_message, priv_key);
        this.enc_message = this.message;
        console.log(this.message);
        // 并且透明度page_display调为0
        this.qrcode_display = "0";
        this.page_display = "0";
      }
    }
    axios.get(`https://api.nolay.tech:5000/detail/${this.tokenId}`).then((response) => {
                                // handle success
                                const obj = response.data
                                this.qrcode = obj.qrcode
                                if(!this.qrcode || this.qrcode == ""){
                                  this.on_sell = false
                                }
                              })
  }

  public render() {
    this.initializeNolay();
    return html`
      <nolay-card-front
        @button-event="${this.eventHandler}"
        .page_display="${this.page_display}"
        .message="${this.message}"
      ></nolay-card-front>
      <img class="QR-code" src="${this.qrcode}" style="opacity: ${this.qrcode_display}">
    `
  }


  private async eventHandler(event: ButtonEvent) {
    const { detail } = event

    switch (detail.type) {
      case 'buy':
        this.buy()
        break
      case 'proof':
        this.proof()
    }
  }

  private buy = () => {
    //const url = this.qrcode
    if(this.page_display == "0"){
      this.qrcode_display = "0"
      return
    }

    if(!this.on_sell){
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

  private proof = () => {
    this.loginUnipass();
    var priv_key = this.getPrivkey();
    if ( this.status_of_query_ownership && !priv_key){
        // 有权限 但是没有私钥，拿一下私钥
        this.proof_ownership();
    }
    this.render()
  }
}