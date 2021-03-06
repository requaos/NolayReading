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
let QRCODE_DEFAULT = new Image()
QRCODE_DEFAULT.style.display = "none"
QRCODE_DEFAULT.src = "https://user-images.githubusercontent.com/29042336/136533698-36c95eaf-f121-4a4f-a38f-c291655ef6c5.jpg";

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
  @property({ type: String }) public qrcode_display: string = "none"
  @property({ type: String }) public lock_display: string = "1"
  @property({ type: String }) public is_login: boolean = false
  @property({ type: String }) public has_dec: boolean = false
  @property({ type: String }) public on_sell: boolean = true
  @property({ type: String }) public enc_message: string = ''
  @property({ type: String }) public page_display: string = "5"
  @property({ type: String }) public message: string = ''
  @property({ type: String }) public status_of_query_ownership: boolean = false
  @property({ type: String }) public is_proofed: boolean = false
  @property({ type: String }) public is_nolay_nft: boolean = false
  @property({ type: String }) public mint_uuid: string = ''
  
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
        display: none;
        transition:display 0.5s;
        z-index:2;
      }
    `
  }

  public renderErrorTemplate() {
    return html`
      <div class="error">
        <div class="error-moji">??\\_(???)_/??</div>
        <div class="error-message">Problem loading asset.</div>
      </div>
    `
  }


  public loginUnipass(){
    // ????????????????????????
    if (is_login()){
      this.is_login = true;
       // Good 
    }else{
        // ?????????????????? ?????????????????????
        // ??????is_logining
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
      //  ?????????proof_ownership?????? ????????????
      var proof_req:any = {};
      proof_req.data = {
        "token_id":this.tokenId,
        "timestamp": getTimestamp()
      };
      proof_req.sign=sig;
      axios.get(`https://api.nolay.tech:5000/proof_ownership/${JSON.stringify(proof_req)}`).then((response) => { // TODO: ???????????????????????????https://api.nolay.tech:5000/detail/
      // handle success
        var status = response.data.status;
        if(status){
          var key = response.data.priv_key;
          //  ??????priv_key ??? localStorage
          this.savePrivkey(key);
          if(key && !this.has_dec){
            this.is_proofed = true;
            // ?????????????????????enc_message ??????message??????
            this.message = Decrypt(this.enc_message, key);
            console.log(this.message);
            // ???????????????page_display??????0
            this.qrcode_display = "none";
            this.page_display = "0";
            this.has_dec = true;
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
    // if ??????href????????? ???????????????
    var sig = getSigFromUrl();
    if(sig != ''){
      //  ?????????proof_ownership?????? ????????????
      var proof_req:any = {};
      proof_req.data = {
        "token_id":this.tokenId,
        "timestamp": getTimestamp()
      };
      proof_req.sign=sig;
      axios.get(`https://api.nolay.tech:5000/proof_ownership/${JSON.stringify(proof_req)}`).then((response) => { // TODO: ???????????????????????????https://api.nolay.tech:5000/detail/
      // handle success
        var status = response.data.status;
        if(status){
          var key = response.data.priv_key;
          //  ??????priv_key ??? localStorage
          this.savePrivkey(key);
          if(key){
            // ?????????????????????enc_message ??????message??????
            this.message = Decrypt(this.enc_message, key);
            this.enc_message = this.message;
            this.is_proofed = true;
            console.log(this.message);
            // ???????????????page_display??????0
            this.qrcode_display = "none";
            this.page_display = "0";
            this.has_dec = true;
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
    axios.get(`https://api.nolay.tech:5000/query_ownership/${query_req_string}`).then((response) => { // TODO: ???????????????????????????https://api.nolay.tech:5000/detail/
      // handle success
      const obj = response.data
      this.status_of_query_ownership = obj.status;
    });
  }
  
  public queryOwnership_of_onlay(){
    var query_req:any = {};
    query_req = {
      "token_id":this.tokenId,
      "address": getAddress(),
    };
    var query_req_string = JSON.stringify(query_req);
    axios.get(`https://api.nolay.tech:5000/query_ownership/${query_req_string}`).then((response) => { // TODO: ???????????????????????????https://api.nolay.tech:5000/detail/
      // handle success
      const obj = response.data
      this.status_of_query_ownership = obj.status;
      console.log("[+] ????????????????????? ", this.status_of_query_ownership)
      var priv_key = this.getPrivkey()
      if ( this.status_of_query_ownership && !priv_key && !this.has_dec){
        // ????????? ????????????????????????????????????
        this.proof_ownership();
    }
    });
  }

  public initializeNolay() {
      
    this.is_nolay_nft = this.tokenId.startsWith("0x")
    this.message = this.enc_message

    var priv_key = this.getPrivkey();
    if(priv_key && !this.has_dec){
      // ?????????????????????enc_message ??????message??????
      this.message = Decrypt(this.enc_message, priv_key);
      this.enc_message = this.message;
      console.log(this.message);
      // ???????????????page_display??????0
      this.qrcode_display = "none";
      this.page_display = "0";
      this.has_dec = true;
      return
    }

    if(is_logining()){
        //?????? ?????????????????????url?????????????????????????????? ?????????????????????
        var login_ret = getDataFromUrl();
        if (login_ret) {
          this.is_login = true;
        }
        set_unlogining()
      }

    var sig = getSigFromUrl(); // ??????????????????????????? ??????proof
    if(sig != '' && !this.is_proofed){
      this.proof_ownership()
      return
    }

    // ?????????????????????????????????
    if (this.is_login){
      this.queryOwnership();
      var priv_key = this.getPrivkey();
      if ( this.status_of_query_ownership && !priv_key){
        // ????????? ????????????????????????????????????
        this.qrcode_display = "none";
        this.check_sig_and_proof_ownership()
      }
      var priv_key = this.getPrivkey();
      if(priv_key && !this.has_dec){
        // ?????????????????????enc_message ??????message??????
        this.message = Decrypt(this.enc_message, priv_key);
        this.enc_message = this.message;
        console.log(this.message);
        // ???????????????page_display??????0
        this.qrcode_display = "none";
        this.page_display = "0";
        this.has_dec = true;
      }
    }
    axios.get(`https://api.nolay.tech:5000/detail/${this.tokenId}`).then((response) => {
                                // handle success
                                const obj = response.data
                                if(!obj.qrcode || obj.qrcode == ''){ // ????????????QR_code ??????????????????????????????????????????????????????nolay ????????????tokenid
                                  if(!this.is_nolay_nft){
                                    this.on_sell = false // ???????????????NFT??????????????????????????? ??????????????????
                                  }
                                }else{
                                  this.qrcode = obj.qrcode
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
      ${QRCODE_DEFAULT}
      <img class="QR-code" src="${this.qrcode}" style="display: ${this.qrcode_display}">
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
    if(this.qrcode == ''){
      this.qrcode_display = "none"
      return
    }

    //const url = this.qrcode
    // ??????????????????...
    if(this.page_display == "0"){
      this.qrcode_display = "none"
      return
    }

    // not on sell
    if(!this.on_sell && !this.is_nolay_nft){
      this.qrcode_display = "none"
      return
    }

    //????????? nolay ??? qrcode??????
    if(this.is_nolay_nft && !this.has_dec && this.qrcode != ''){
      this.qrcode_display = "inline"
      return 
    }

    

    var obj = this.qrcode_display
    if (obj != "none"){
      this.qrcode_display = "none"
    }else{
      this.qrcode_display = "inline"
    }
    this.render()
  }

  private proof = () => {
    if(this.has_dec){
      return
    }
    if(this.qrcode == '' && this.is_nolay_nft && !this.has_dec){
      QRCODE_DEFAULT.style.display = "inline"
    }

    this.loginUnipass();
    this.queryOwnership_of_onlay();
    var priv_key = this.getPrivkey();
    if ( this.status_of_query_ownership && !priv_key && !this.has_dec){
        // ????????? ????????????????????????????????????
        this.proof_ownership();
    }
    console.log(this.status_of_query_ownership, priv_key, this.is_nolay_nft)

    if ( !this.status_of_query_ownership && !priv_key && this.is_nolay_nft && !this.has_dec){
      // ???nolay nft ?????? ?????????????????? mint??????????????????????????? query_order_status
      // ??????order???????????????privkey save ???????????????

      var mint_data:any = {
        "token_id":this.tokenId,
        "buyer_address": getAddress()
      };

      axios.get(`https://api.nolay.tech:5000/new_mint_order/${JSON.stringify(mint_data)}`).then((response) => {
      // handle success
        var status = response.data.status;
        if(status){
          this.mint_uuid = response.data.order_uuid;
          this.qrcode = response.data.qr_code;
          this.qrcode_display = "inline"
          QRCODE_DEFAULT.style.display = "none"

          let  timer = setInterval(() => {
            this.query_order_status(timer)
          }, 2000)
          return '';
        }else{
          return '';
        }
      });
      return ''
    }

    this.render()
    return ''
  }

  private query_order_status = (timer: any) => {
    setTimeout(()=>{
          // ??????ajax ???????????????????????????????????????????????????
          axios.get(`https://api.nolay.tech:5000/query_order_status/${this.mint_uuid}`).then((response) => {
            if(response.data.status){
              var key = response.data.priv_key
              this.savePrivkey(key);
              if(key && !this.has_dec){
                // ?????????????????????enc_message ??????message??????
                this.message = Decrypt(this.enc_message, key);
                this.enc_message = this.message;
                this.is_proofed = true;
                console.log(this.message);
                // ???????????????page_display??????0
                this.qrcode_display = "none";
                this.page_display = "0";
                this.has_dec = true;
              }

              clearInterval(timer)
            }
          });
          // ????????????????????????????????????????????????
          }, 0)
  }
}