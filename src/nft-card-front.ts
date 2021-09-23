import { css, customElement, html, LitElement, property } from 'lit-element'

import { classMap } from 'lit-html/directives/class-map'
import { styleMap } from 'lit-html/directives/style-map'

/* lit-element classes */
import './info-button'

@customElement('nft-card-front')
export class NftCardFrontTemplate extends LitElement {
  @property({ type: Boolean }) public horizontal!: boolean // invoke in render
  @property({ type: String }) public jinseLink: string = '' // invoke in render
  @property({ type: String }) public name: string = ''
  @property({ type: String }) public description: string = ''
  @property({ type: String }) public imageUrl: string = ''

  @property({ type: String }) public issuerName: string = ''
  @property({ type: String }) public issuerAvatar: string = ''
  @property({ type: String }) public issuerId: string = ''
  @property({ type: String }) public qrcode: string = ''

  static get styles() {
    return css`
      .card-front {
        position: absolute;
        backface-visibility: hidden;
        background: #ffffff;
        border-radius: 5px;
        display: grid;
        grid-template-columns: 1fr 2fr;
        position: relative;
        width: 100%;
        height: 100%;
        transform: translateY(0);
        overflow: hidden;
      }
      .is-vertical {
        grid-template-columns: 100%;
        grid-template-rows: 60% 40%;
      }
      .card-front p {
        margin: 0;
      }

      .asset-image-container {
        border-right: 1px solid #e2e6ef;
        background-size: cover;
        box-sizing: border-box;
      }

      .asset-image {
        background-size: contain;
        background-position: 50%;
        background-repeat: no-repeat;
        height: 100%;
        box-sizing: border-box;
      }

      .is-vertical .asset-image-container {
        border-bottom: 1px solid #e2e6ef;
        border-right: none;
        width: 100%;
      }

      .asset-details-container {
        display: grid;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr;
        padding: 20px;
        align-items: center;
      }
      .asset-detail {
        display: flex;
      }
      .asset-detail .asset-detail-type {
        height: 35px;
        font-size: 12px;
        margin-right: 10px;
      }
      .asset-detail .asset-detail-badge {
        width: 54px;
        height: 30px;
        font-size: 12px;
      }
      .asset-detail-name {
        font-weight: 400;
        text-align: left;
      }
      .asset-detail-price {
        align-items: flex-end;
        font-size: 18px;
        font-weight: 400;
        display: flex;
        flex-flow: row;
        justify-content: flex-end;
        line-height: 15px;
        text-align: right;
        padding: 6px 0;
      }
      .asset-detail-price img {
        margin: 0 4px;
      }
      .asset-detail-price-current img {
        width: 15px;
      }
      .asset-detail-price-previous {
        font-size: 14px;
        color: rgb(130, 130, 130);
        line-height: 10px;
      }
      .asset-detail-price-previous img {
        width: 1ex;
      }
      .asset-detail-price .value {
        margin-left: 5px;
      }
      .asset-detail-price .previous-value {
        font-size: 14px;
        color: #828282;
      }
      .asset-action-buy {
        grid-column-start: 1;
        grid-column-end: 3;
      }
      .asset-action-buy button {
        width: 100%;
        background: #3291e9;
        border-radius: 5px;
        height: 35px;
        color: white;
        font-weight: bold;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: 200ms;
        outline: none;
        border-style: none;
        text-transform: uppercase;
      }
      .asset-action-buy button:hover {
        background: rgb(21, 61, 98);
      }
      .asset-link {
        text-decoration: none;
        color: #222222;
      }
    `
  }

  /**
   * Implement `render` to define a template for your element.
   */
  public render() {
    const issuerUrl = 'https://explorer.jinse.cc/issuer/tokens/' + this.issuerId

    return html`
      <div class="card-front ${classMap({ 'is-vertical': this.horizontal })}">
        ${this.getAssetImageTemplate()}

        <div class="asset-details-container">
          <div class="asset-detail">
            <div class="asset-detail-type">
              <a class="asset-link" href="${issuerUrl}" target="_blank">
                <pill-element
                  .imageUrl=${this.issuerAvatar}
                  .label=${this.issuerName}
                  textColor="#828282"
                  border="1px solid #E2E6EF"
                ></pill-element>
              </a>
            </div>
            <!-- This badge is optional and must be rendered programmatically -->
            <!-- <div class="asset-detail-badge">
              <pill-element
                label="New"
                backgroundColor="#23DC7D"
                textColor="#FFFFFF"
              ></pill-element>
            </div> -->
          </div>
          <div class="spacer"></div>
          <div class="asset-detail-name">
            <a class="asset-link" href="${this.jinseLink}" target="_blank"
              >${this.name}</a
            >
          </div>
          <div class="asset-action-buy">
            ${this.getButtonTemplate()}
          </div>
        </div>
      </div>
    `
  }

  /*
   * EventHandler - Dispatch event allowing parent to handle click event
   * '_event' isn't used here but it's needed to call the handler
   */
  public eventHandler(_event: any, type: string) {
    const buttonEvent = new CustomEvent('button-event', {
      detail: {
        type
      }
    })

    this.dispatchEvent(buttonEvent)
  }

  private getAssetImageTemplate() {
    return html`
      <div class="asset-image-container">
        <a href="${this.jinseLink}" target="_blank">
          <div
            class="asset-image"
            style=${styleMap({
              'background-image': `url(${this.imageUrl})`,
              'background-size': 'contain',
              padding: '0px'
            })}
          ></div>
        </a>
      </div>
    `
  }

  private getButtonTemplate() {
    if (this.qrcode == null) {
      return html`
            <button @click="${(e: any) => this.eventHandler(e, 'view')}">
              ${'view on Mibao ❯'}
            </button>
          `
    }else{
      return html`
            <button @mouseover="${(e: any) => this.eventHandler(e, 'buy')}" @mouseout="${(e: any) => this.eventHandler(e, 'buy')}">
              ${'Buy it! ❯'}
            </button>
          `
    }
  }

  
}
