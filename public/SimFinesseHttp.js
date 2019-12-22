var SimFinesseUrl = '/finesse/api'

async function GetApi(uri){
    const response = await fetch(uri, {
        method : 'GET',
    })
    if(!response.ok) {
        const ret = await response.json()
        alert(`fail ${ret.message}`)
        return null
    }
    if (response.headers.get("content-type").indexOf("application/json") !== -1) {
        return await response.json()
    }
    else if(response.headers.get("content-type").indexOf("xml") !== -1){
        let strXml = await response.text()
        let objXml = parseXml(strXml)
        let strJson = xml2json(objXml, ' ')
        let objJson = JSON.parse(strJson)
        return objJson
    }

    return null
}
async function PutOrPostApi(uri, method, body){
    console.log('body : ', body)
    const response = await fetch(uri, {
        method : method,
        headers : {
            'Accept': 'Application/json',
            'Content-Type': 'Application/json'
        },
        body : body == null ? null : JSON.stringify(body),
    })
    if(!response.ok) {
        const ret = await response.json()
        alert(`fail ${ret.message}`)
        return
    }
    if(response.redirected){
        window.location.href = response.url
        return
    }

}