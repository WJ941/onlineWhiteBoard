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
  return new Blob([uInt8Array], {type: contentType}) 
}
function base64Img2Binary(code){
  var parts = code.split(';base64,')
  var contentType = parts[0].split(':')[1]
  var raw = window.atob(parts[1])
  return raw
  // var rawLength = raw.length
  // var uInt8Array = new Uint8Array(rawLength)
  // for (var i = 0; i < rawLength; ++i) {
  //   uInt8Array[i] = raw.charCodeAt(i)
  // }
  // return new Blob([uInt8Array], {type: contentType}); 
}
function downloadFile(fileName, content){
  var aLink = document.createElement('a')
  var blob = base64Img2Blob(content)

  var evt = new MouseEvent('click')
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob)
  aLink.dispatchEvent(evt)
}
function AjaxGet(url, callback) {
  var httpRequest = new XMLHttpRequest()
  if (!httpRequest) {
    log('Giving up :( Cannot create an XMLHTTP instance')
    return false
  }
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        // var res = JSON.parse(httpRequest.responseText)
        callback(httpRequest.responseText)
      } else {
        log('There was a problem with the request.')
      }
    }
  }
  // httpRequest.open('GET', 'http://localhost:3000/invite')
  httpRequest.open('GET', url)
  httpRequest.send()
}
function copyText(element) {
  window.getSelection().removeAllRanges()
  var range = document.createRange()
  range.selectNode(element)
  window.getSelection().addRange(range)
   try {
     var successful = document.execCommand('copy')
     var msg = successful ? 'successful' : 'unsuccessful'
     log('Copy command was ' + msg)
   } catch(err) {
     log('Oops, unable to copy')
   }
 
   // Remove the selections - NOTE: Should use
   // removeRange(range) when it is supported  
   window.getSelection().removeAllRanges()
}
function IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

function templateReplace(template, data) {
  function getNextPlaceholderIndex() {
    var leftIndex = template.indexOf('{{')
    var rightIndex = template.indexOf('}}')
    if( leftIndex === -1 || rightIndex === -1) {
      return false
    } else {
      return {left: leftIndex, right: rightIndex}
    }
  }
  function setReplace(indexRange) {
    var key = template.slice(indexRange.left + 2, indexRange.right)
    template = template.replace('{{' + key + '}}', data[key])
    beginReplace()
  }
  function beginReplace() {
    var indexRange = getNextPlaceholderIndex()
    if(indexRange) {
      setReplace(indexRange)
    }
  }
  beginReplace()
  return template
}

function escapeHTML (unsafe_str) {
  return unsafe_str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}