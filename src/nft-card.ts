import { css, customElement, html, LitElement, property } from 'lit-element'
import { styleMap } from 'lit-html/directives/style-map'
import axios from 'axios'
// @ts-ignore ts error TS7016
/* lit-element classes */
import './pill.ts'
import './loader.ts'
import './nft-card-front.ts'
import { ButtonEvent } from './types'
import {is_login, is_logining, set_logining, set_unlogining} from './unipass-login'
import {getDataFromUrl} from './localdata'

/**
 * Nft-card element that manages front & back of card.
 * Facilitates acquisition and distribution data between
 * components.
 * Registers <nft-card> as an HTML tag.
 */
@customElement('nft-card')
export class NftCard extends LitElement {
  /* User configurable properties */
  @property({ type: Boolean }) public horizontal?: boolean
  @property({ type: String }) public tokenId: string = ''
  @property({ type: String }) public width: string = ''
  @property({ type: String }) public height: string = ''
  @property({ type: String }) public minHeight: string = ''
  @property({ type: String }) public maxWidth: string = ''
  @property({ type: String }) public jinseLink: string = ''
  @property({ type: String }) public name: string = ''
  @property({ type: String }) public description: string = ''
  @property({ type: String }) public imageUrl: string = ''
  @property({ type: String }) public issuerName: string = ''
  @property({ type: String }) public issuerAvatar: string = ''
  @property({ type: String }) public issuerId: string = ''
  @property({ type: String }) public qrcode: string = ''
  @property({ type: String }) public qrcode_display: string = "0"
  @property({ type: String }) public is_login: boolean = false
  @property({ type: String }) public has_enc: boolean = false

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
      .QR-code-container{
        width: 0px;
        height: 0px;
        margin-right: 0px;
        margin-top: 0px;

        float: right;
      }
      .QR-code {
        width: 90px;
        height: 90px;
        opacity: 0;
        transition:opacity 0.5s;
        z-index:2;
        position:relative;
        top:10px;
        left:-110px;
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
        var login_url = `https://id.unipass.vip/login?success_url=${window.location.href}`
        console.log("login_url: ", login_url);
        window.location.href = login_url;
      } 
    }
  }

  public queryOwnership(): boolean{
    var status = false;
    axios.get(`https://localhost:5000/query_ownership/${this.tokenId}`).then((response) => { // TODO: 发布之前把这个改回https://leepanda.top:5000/detail/
      // handle success
      status = response.data.status;
    });
    return status;
  }

  public getPrivkey(): string | null{
    return localStorage.getItem("priv_key");
  }
  
  public savePrivkey(data: string) {
    localStorage.setItem("priv_key", data);
  }

  public proof_ownership(){
    // TODO: 写一下sign逻辑 和 上面那个api_server接口 0922
  }

  public renderInnerCardTemplate() {
    
    /*if(this.has_enc){
      // 有加密内容 才需要登录
      this.loginUnipass();
      // 如果未登录，啥事不发生
      if (this.is_login){
        // 如果已登录 && 有加密内容
        if (this.queryOwnership() && !this.getPrivkey()){
          
        }
      }
    }*/
    
    
    

    //    query 是否有ownership
    //    如果 有ownership && 没有 priv_key
    //      需要证明 自己是address
    //      只需证明一次 priv_key存入localstorage
    // get token detail by api
    axios.get(`https://localhost:5000/detail/${this.tokenId}`).then((response) => { // TODO: 发布之前把这个改回https://leepanda.top:5000/detail/
                                // handle success
                                const obj = response.data
                                this.name = obj.name
                                this.imageUrl = obj.imageUrl
                                this.description = obj.description
                                this.jinseLink = 'https://explorer.jinse.cc/nft/' + this.tokenId 
                                this.issuerName = obj.issuerName
                                this.issuerAvatar = obj.issuerAvatar
                                this.issuerId = obj.issuerId
                                this.qrcode = obj.qrcode
                              })

    /*return html`
      <nft-card-front
        .horizontal=${this.horizontal}
        @button-event="${this.eventHandler}"
        .jinseLink="${this.jinseLink}"
        .name="${this.name}"
        .description="${this.description}"
        .imageUrl="${this.imageUrl}"
        .issuerName="${this.issuerName}"
        .issuerAvatar="${this.issuerAvatar}"
        .issuerId="${this.issuerId}"
        .qrcode="${this.qrcode}"
      ></nft-card-front>
    `*/
  }

  public render() {
    return html`
      <style>
        @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500&display=swap');
      </style>
      <div
        class="card"
        style=${styleMap({
          width: this.width,
          height: this.height,
          minHeight: this.minHeight,
          maxWidth: this.maxWidth
        })}
      >
        <div class="card-inner">
          <div class="QR-code-container">
            <img class="QR-code" src="${this.qrcode}" style="opacity: ${this.qrcode_display}">
          </div>
          ${this.renderInnerCardTemplate()}
        </div>
      </div>
    `
  }

  private async eventHandler(event: ButtonEvent) {
    const { detail } = event

    switch (detail.type) {
      case 'view':
      case 'manage':
        this.goToJinse()
        break
      case 'unlock':
        this.goToJinse()
        break
      case 'buy':
        this.buy()
        break
    }
  }

  private goToJinse() {
    const url = this.jinseLink
    window.open(url, '_blank')
  }

  private buy() {
    //const url = this.qrcode
    var obj = this.qrcode_display
    if (obj != "0"){
      this.qrcode_display = "0"
    }else{
      this.qrcode_display = "1"
    }
    this.render()
  }
}
