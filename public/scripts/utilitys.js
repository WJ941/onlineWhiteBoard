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
var PIXEL_RATIO = (function () {
  var ctx = document.createElement("canvas").getContext("2d"),
      dpr = window.devicePixelRatio || 1,
      bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
  return dpr / bsr;
})();

createHiDPICanvas = function(w, h, ratio) {
  if (!ratio) { ratio = PIXEL_RATIO; }
  var can = document.createElement("canvas");
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
}

function css( element, property ) {
  return window.getComputedStyle( element, null ).getPropertyValue( property );
}

function base64Img2Blob(code){
  var parts = code.split(';base64,')
  var contentType = parts[0].split(':')[1]
  var raw = window.atob(parts[1])
  var rawLength = raw.length
  var uInt8Array = new Uint8Array(rawLength)
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], {type: contentType}); 
}
function downloadFile(fileName, content){
  var aLink = document.createElement('a')
  var blob = base64Img2Blob(content)

  var evt = new MouseEvent('click')
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob)
  aLink.dispatchEvent(evt)
}