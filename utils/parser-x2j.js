const parser = require('fast-xml-parser');

const he = require('he');

var x2j_options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: true,
    attrValueProcessor: a => he.decode(String(a), { isAttributeValue: true }),//default is a=>a
    tagValueProcessor: a => he.decode(String(a)) //default is a=>a
};

var parse2 = function(xmlData){
    // Intermediate obj
    var tObj = parser.getTraversalObj(xmlData,x2j_options);
    var jsonObj = parser.convertToJson(tObj,x2j_options);
    return jsonObj
}

var parse = function (xmlData) {
    return parser.parse(xmlData, x2j_options);
}

var validate = function (xmlData) {
    return parser.validate(xmlData);
}


module.exports = {
    parser: parser,
    parse: parse,
    parse2 : parse2,
    validate: validate
}