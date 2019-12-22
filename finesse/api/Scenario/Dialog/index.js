const express = require('express')
const router = express.Router()
const asyncFile = require('../../../../file/asyncFile')
const parser_x2j = require('../../../../utils/parser-x2j')
const parser_j2x = require('../../../../utils/parser-j2x')
const expressAsyncHandler = require('express-async-handler')
const FinesseMemory = require('../../../../memory');
const _path = require('path')


async function getFolderList(path){
    let userList = []
    var { err, filelist } = await asyncFile.readdir(path)
    if(err) return err
    for(idx in filelist){
        let filePath = `${path}/${filelist[idx]}`
        var {err, stats} = await asyncFile.lstat(filePath)
        if(err) continue
        if(!stats.isDirectory()) continue
        userList.push(filelist[idx])
    }
    return userList
}
async function getFileList(basePath, folderName){
    let fileList = {
        folder : folderName,
        fileNames : [ ],
    }

    var { err, filelist } = await asyncFile.readdir(`${basePath}/${folderName}`)
    if(err) return err
    for(idx in filelist){
        let filePath = `${basePath}/${folderName}/${filelist[idx]}`
        var {err, stats} = await asyncFile.lstat(filePath)
        if(err) continue
        if(stats.isDirectory()) continue
        fileList.fileNames.push({
            name : _path.basename(filelist[idx], _path.extname(filelist[idx])),
            ext : _path.extname(filelist[idx]),
        })
    }
    return fileList
}
async function getScenarioList(url){
    let userList = await getFolderList(url)
    let userFilesList = []
    for(idx in userList){
        userFiles = await getFileList(url, userList[idx])
        userFilesList.push(userFiles)
    }
    return userFilesList
}

router.get('/', expressAsyncHandler( async (req, res) => {

    var { err, data } = await asyncFile.select(`./finesse/api/Scenario/default.json`)
    if(err) return res.status(500).send({ message: 'no exist dialog' })
    let scenario_default = JSON.parse(data)

    let scenario_dialogid_agt = scenario_default.Default.Scenario_DialogId_Agt
    let scenario_dialogid_mgr = scenario_default.Default.Scenario_DialogId_Mgr
    let scenario_result = []
    let List = await getScenarioList(`.${req.originalUrl}`)
    console.log('list', List)
    let nCnt = 0
    for(idx in List){
        console.log(List[idx])
        let DialogId = List[idx]['folder']
        if(DialogId == scenario_dialogid_agt || DialogId == scenario_dialogid_mgr){
            if(DialogId == scenario_dialogid_agt){
                scenario_result.push( { 
                    Scenario_DialogId_Agt : DialogId,
                    Events : []
                })
                for(cnt in List[idx]['fileNames']){
                    scenario_result[nCnt].Events.push({
                        name : List[idx]['fileNames'][cnt].name // event name
                    })
                }
                nCnt += 1
            }
            else if(DialogId == scenario_dialogid_mgr){
                scenario_result.push( { 
                    Scenario_DialogId_Mgr : DialogId,
                    Events : []
                })
                for(cnt in List[idx]['fileNames']){
                    scenario_result[nCnt].Events.push({
                        name : List[idx]['fileNames'][cnt].name // event name
                    })
                }
                nCnt += 1
            }
        }
    }

    let response = JSON.stringify(scenario_result, null, 4)
    return res.contentType('application/json').send(response)

}))


router.get('/:id', expressAsyncHandler( async (req, res) => {
    let List = await getScenarioList(`.${req.originalUrl}`)
    console.log('list')
    
    var {err, filelist} = await asyncFile.readdir(`.${req.originalUrl}`)
    if(err)
        return res.status(500).send({ message: 'no exist dialog' })
    
    var {err, data} = await asyncFile.select(`.${req.originalUrl}.xml`)
    res.contentType('application/xml').send(data)

}))


router.get('/:id/*', expressAsyncHandler( async (req, res) => {
    var {err, data} = await asyncFile.select(`.${req.originalUrl}.xml`)
    if(err)
        return res.status(500).send({ message: 'no exist dialog' })
    res.contentType('application/xml').send(data)

}))

router.put('/:id/*', expressAsyncHandler( async (req, res) => {
    let xml = parser_j2x.parse(req.body)
    console.log(xml)
    var {err} = await asyncFile.update(`.${req.originalUrl}.xml`, xml)
    if(err) return res.status(500).send({ message: 'update fail' })
    return res.send(200)

}))


module.exports = router;
