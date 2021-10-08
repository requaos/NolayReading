import { customElement, html, LitElement, property } from 'lit-element'

/* lit-element classes */
//import './info-button-nolay'

@customElement('nolay-card-front')
export class NftCardFrontTemplate extends LitElement {
  @property({ type: String }) public message: string = ''
  @property({ type: String }) public page_display: string = "5"

  /**
   * Implement `render` to define a template for your element.
   */
  public render() {
    return this.getButtonTemplate();
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

  private getButtonTemplate() {
    if(this.page_display == "5"){
      return html`<div class="page" style="filter: blur(${this.page_display}px);" @mouseover="${(e: any) => this.eventHandler(e, 'buy')}" @mouseout="${(e: any) => this.eventHandler(e, 'buy')}" @click="${(e: any) => this.eventHandler(e, 'proof')}">
              <p style="width: 300px;word-wrap:break-word;">${this.message}</p>
            </div>`
    }else{
      return html`<div class="page" style="filter: blur(${this.page_display}px);" @mouseover="${(e: any) => this.eventHandler(e, 'buy')}" @mouseout="${(e: any) => this.eventHandler(e, 'buy')}" @click="${(e: any) => this.eventHandler(e, 'proof')}">
              <p>${this.message}</p>
            </div>`
    }
    
  }
}
