// utilitys 
var sel = el => document.querySelector(el)
var selAll = el => document.querySelectorAll(el)
var log = console.log.bind(console)
var addListener = function(target, type, handler) {
  if(target.addEventListener) {
    target.addEventListener(type, handler, false)
  } else if(target.attachEvent) {
    target.attachEvent("on" + type, handler)
  } else {
    target["on" + type] = handler
  }
}