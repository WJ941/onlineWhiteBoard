class ColorManager {
  constructor() {
    this.colorPicker = sel('#id-color-picker')
    this.colorRadios = selAll('input[name="color"]')
    this.colorIcon = sel('#id-color-icon')
    this._curColor = Array.prototype.find.call( this.colorRadios, e => e.checked == true) || 'black'
    this._subscribers = []
    this.colorIcon.style.color = this._curColor
    this.init()
  }
  static instance(...args) {
    this.i = this.i || new this(...args)
    return this.i
  }
  addSubscriber(subscriber) {
    this._subscribers.push(subscriber)
  }
  get curColor() {
    return this._curColor 
  }
  set curColor(newValue) {
    this._curColor  = newValue
    this.informSubscribers(newValue)
    this.colorIcon.style.color = newValue
  }
  informSubscribers(newValue) {
    this._subscribers.forEach( s => s(newValue))
  }
  init() {
    for(var i = 0; i < this.colorRadios.length; i++) {
      var radio = this.colorRadios[i]
      addListener(radio, 'click', event => {
        this.curColor  = event.target.value
      })
    }
    addListener(this.colorPicker, 'input', event => {
        this.curColor = event.target.value
      }
    )
  }
}