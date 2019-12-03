function inputObjData(level, obj){
    let blank = ' '
    for(let b = 0 ; b < level ; b++ ){
        blank += '        '
    }
    for(let i in obj){
        if(obj[i].constructor == Object){
            if(obj.constructor == Array){
                console.log(`${blank}{`)
            }
            else {
                console.log(`${blank}${i}{`)
            }
            inputObjData(level + 1, obj[i])
            console.log(`${blank}},`)
        }
        else if(obj[i].constructor == Array){
            console.log(`${blank}${i} [`)
            inputObjData(level + 1, obj[i])
            console.log(`${blank}],`)
        }
        else {
            console.log(`${blank}${i} : ${obj[i]},`)
        }
    }
}
testObj = {
    data1 : 'Value1',
    data2 : {
        data2of1 : 'value2',
        data2of2 : 'value3',
    },
    data3 : 'value4',
    data4 : [ 
        {
            "name": "callVariable1",
            "value": "821343114______________________"
        },
        {
            "name": "callVariable2",
            "value": "4213"
        },
        {
            "name": "callVariable3",
            "value": "123______________________"
        },
    ]
}
inputObjData(0, testObj)




let http_server = require('./http_server')
let xmpp_server = require('./xmpp_server')

http_server(3000)
xmpp_server(5222)
