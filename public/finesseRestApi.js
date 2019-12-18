async function GetUri_SetElement(uri, rootDiv){
    let response = await fetch(uri)
    console.log('GetUri_SetElement response.ok:', response.ok)
    if(!response.ok){
        const ret = await response.json()
        console.log(ret)
        alert(`fail ${ret.message}`)
        return
    }
    
    let strXmlDialog = await response.text()
    let objXmlDialog = parseXml(strXmlDialog)
    let strJsonDialog = xml2json(objXmlDialog, ' ')
    let objJsonDialog = JSON.parse(strJsonDialog)
    return objJsonDialog
}

function ElementSettingFromObject(obj, rootDiv){
    console.log('rootDiv : ', rootDiv)
    let currentDiv = document.getElementById(rootDiv)
    console.log('currentDiv : ', currentDiv)
    currentDiv.innerHTML = ''

    let div = document.createElement('div')
    getObjectParam(0, obj, div , '')

    currentDiv.insertAdjacentElement('beforeend', div)
}



async function PostPutDialogUri(uri, method, formObject){
    let xmlFormat = json2xml(formObject, ' ')
    data =JSON.stringify(formObject)
    const response = await fetch(uri, {
        method : method,
        headers : {
            'Accept': 'Application/xmll',
            'Content-Type': 'Application/xml'
        },
        body : xmlFormat,
    })
    if(!response.ok) {
        const ret = await response.json()
        alert(`fail ${ret.message}`)
        return
    }
    alert('success')
    if(response.redirected){
        window.location.href = response.url
    }
}

async function DeleteDialogUri(uri){
    let response = await fetch(uri, {
        method : 'delete',
    })
    if(!response.ok){
        const ret = await response.json()
        alert(`fail ${ret.message}`)
        return
    }
    alert('success')
    if(response.redirected){
        window.location.href = response.url
    } else {
        let currentDiv = document.getElementById('mainDiv')
        currentDiv.innerHTML = ''
    }
}