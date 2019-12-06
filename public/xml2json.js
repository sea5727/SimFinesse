/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/

function parseXml(xml) {
   var dom = null;
   if (window.DOMParser) {
      try { 
         dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
      } 
      catch (e) { dom = null; }
   }
   else if (window.ActiveXObject) {
      try {
         dom = new ActiveXObject('Microsoft.XMLDOM');
         dom.async = false;
         if (!dom.loadXML(xml)) // parse error ..

            window.alert(dom.parseError.reason + dom.parseError.srcText);
      } 
      catch (e) { dom = null; }
   }
   else
      alert("cannot parse xml string!");
   return dom;
}


function xml2json(xml, tab) {
    var X = {
       toObj: function(xml) {
          var o = {};
          if (xml.nodeType==1) {   // element node ..
             if (xml.attributes.length)   // element with attributes  ..
                for (var i=0; i<xml.attributes.length; i++)
                   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
             if (xml.firstChild) { // element has child nodes ..
                var textChild=0, cdataChild=0, hasElementChild=false;
                for (var n=xml.firstChild; n; n=n.nextSibling) {
                   if (n.nodeType==1) hasElementChild = true;
                   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                   else if (n.nodeType==4) cdataChild++; // cdata section node
                }
                if (hasElementChild) {
                   if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                      X.removeWhite(xml);
                      for (var n=xml.firstChild; n; n=n.nextSibling) {
                         if (n.nodeType == 3)  // text node
                            o["#text"] = X.escape(n.nodeValue);
                         else if (n.nodeType == 4)  // cdata node
                            o["#cdata"] = X.escape(n.nodeValue);
                         else if (o[n.nodeName]) {  // multiple occurence of element ..
                            if (o[n.nodeName] instanceof Array)
                               o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                            else
                               o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                         }
                         else  // first occurence of element..
                            o[n.nodeName] = X.toObj(n);
                      }
                   }
                   else { // mixed content
                      if (!xml.attributes.length)
                         o = X.escape(X.innerXml(xml));
                      else
                         o["#text"] = X.escape(X.innerXml(xml));
                   }
                }
                else if (textChild) { // pure text
                   if (!xml.attributes.length)
                      o = X.escape(X.innerXml(xml));
                   else
                      o["#text"] = X.escape(X.innerXml(xml));
                }
                else if (cdataChild) { // cdata
                   if (cdataChild > 1)
                      o = X.escape(X.innerXml(xml));
                   else
                      for (var n=xml.firstChild; n; n=n.nextSibling)
                         o["#cdata"] = X.escape(n.nodeValue);
                }
             }
             if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          else if (xml.nodeType==9) { // document.node
             o = X.toObj(xml.documentElement);
          }
          else
             alert("unhandled node type: " + xml.nodeType);
          return o;
       },
       toJson: function(o, name, ind) {
          var json = name ? ("\""+name+"\"") : "";
          if (o instanceof Array) {
             for (var i=0,n=o.length; i<n; i++)
                o[i] = X.toJson(o[i], "", ind+"\t");
             json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
          }
          else if (o == null)
             json += (name&&":") + "null";
          else if (typeof(o) == "object") {
             var arr = [];
             for (var m in o)
                arr[arr.length] = X.toJson(o[m], m, ind+"\t");
             json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
          }
          else if (typeof(o) == "string")
             json += (name&&":") + "\"" + o.toString() + "\"";
          else
             json += (name&&":") + o.toString();
          return json;
       },
       innerXml: function(node) {
          var s = ""
          if ("innerHTML" in node)
             s = node.innerHTML;
          else {
             var asXml = function(n) {
                var s = "";
                if (n.nodeType == 1) {
                   s += "<" + n.nodeName;
                   for (var i=0; i<n.attributes.length;i++)
                      s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                   if (n.firstChild) {
                      s += ">";
                      for (var c=n.firstChild; c; c=c.nextSibling)
                         s += asXml(c);
                      s += "</"+n.nodeName+">";
                   }
                   else
                      s += "/>";
                }
                else if (n.nodeType == 3)
                   s += n.nodeValue;
                else if (n.nodeType == 4)
                   s += "<![CDATA[" + n.nodeValue + "]]>";
                return s;
             };
             for (var c=node.firstChild; c; c=c.nextSibling)
                s += asXml(c);
          }
          return s;
       },
       escape: function(txt) {
          return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
       },
       removeWhite: function(e) {
          e.normalize();
          for (var n = e.firstChild; n; ) {
             if (n.nodeType == 3) {  // text node
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                   var nxt = n.nextSibling;
                   e.removeChild(n);
                   n = nxt;
                }
                else
                   n = n.nextSibling;
             }
             else if (n.nodeType == 1) {  // element node
                X.removeWhite(n);
                n = n.nextSibling;
             }
             else                      // any other node
                n = n.nextSibling;
          }
          return e;
       }
    };
    if (xml.nodeType == 9) // document node
       xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
 }


function getObjectParam(level, obj, dialogDiv, parentName) {
   var blank = ' '
   var br = ''
   for (let i = 0; i < level; i++) {
      br += '&nbsp;&nbsp;&nbsp;'
      blank += '   '
   }
   for (let param in obj) {
      if ((!!obj[param]) && (obj[param].constructor === Object)) {
         if ((!!obj) && (obj.constructor === Array)) {
            dialogDiv.innerHTML += br
            var newContent = document.createTextNode(`{`)
            dialogDiv.appendChild(newContent)
            dialogDiv.appendChild(document.createElement('br'))
            //console.log(`${blank}}`)
         }
         else {
            dialogDiv.innerHTML += br
            var newContent = document.createTextNode(`${param}{`)
            dialogDiv.appendChild(newContent)
            dialogDiv.appendChild(document.createElement('br'))
            //console.log(`${blank}${param}{`)
         }
         if(parentName.length == 0){
            getObjectParam(level + 1, obj[param], dialogDiv, `${param}`)
         }
         else {
            //getObjectParam(level + 1, obj[param], dialogDiv, `${parentName}`)
            getObjectParam(level + 1, obj[param], dialogDiv, `${parentName}[${param}]`)
         }
         
         dialogDiv.innerHTML += br
         var newContent = document.createTextNode(`},`)
         dialogDiv.appendChild(newContent)
         dialogDiv.appendChild(document.createElement('br'))
         //console.log(`${blank}},`)
      }
      else if ((!!obj[param]) && (obj[param].constructor === Array)) {
         let arrayDiv = document.createElement('div')
         arrayDiv.setAttribute('id', `${parentName}[${param}]`)
         // arrayDiv.innerHTML('test')
         var newContent = document.createTextNode(`${param} [`)
         let plusBtn = document.createElement('input')
         plusBtn.setAttribute('type' , 'button')
         plusBtn.setAttribute('name', `${param}_plusBtn`)
         plusBtn.setAttribute('onclick', `plusBtn('${parentName}[${param}]')`)
         plusBtn.setAttribute('value', '+')
         let minusBtn = document.createElement('input')
         minusBtn.setAttribute('type' , 'button')
         minusBtn.setAttribute('name', `${param}_minusBtn`)
         minusBtn.setAttribute('onclick', `minusBtn(${param}_minusBtn)`)
         minusBtn.setAttribute('value', '-')

         dialogDiv.innerHTML += br
         dialogDiv.appendChild(newContent)
         dialogDiv.appendChild(plusBtn)
         dialogDiv.appendChild(minusBtn)
         dialogDiv.appendChild(arrayDiv)
         dialogDiv.appendChild(document.createElement('br'))
         //console.log(`${blank}${param} [`)
         if(parentName.length == 0){
            getObjectParam(level + 1, obj[param], dialogDiv, `${param}`)
         }
         else {
            getObjectParam(level + 1, obj[param], dialogDiv, `${parentName}[${param}]`)
         }
         dialogDiv.innerHTML += br
         var newContent = document.createTextNode(` ],`)
         dialogDiv.appendChild(newContent)
         dialogDiv.appendChild(document.createElement('br'))
         //console.log(`${blank}],`)
      }
      else {
         dialogDiv.innerHTML += br
         var newContent = document.createTextNode(`${param} : `)
         var input = document.createElement('input')
         input.type = 'text'
         if(parentName.length  == 0){
            input.setAttribute('name', `${param}`)
            input.setAttribute('id', `${param}`)
         }
         else{
            input.setAttribute('name', `${parentName}[${param}]`)
            input.setAttribute('id', `${parentName}[${param}]`)
         }
         //if(obj[param] == 'null'){
         if(typeof obj[param] == 'object' || obj[param] == 'null'){
            // input.setAttribute('value', null)
         }
         else {
            input.setAttribute('value', `${obj[param]}`)
         }

         input.setAttribute('size', `50`)
         dialogDiv.appendChild(newContent)
         dialogDiv.appendChild(input)
         dialogDiv.appendChild(document.createElement('br'))
         //console.log(`${blank}${param} : ${obj[param]},`)
      }
   }
}
