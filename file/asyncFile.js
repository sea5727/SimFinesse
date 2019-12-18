const fs = require('fs').promises;

exports.select = async function(path){
    let data = undefined
    let err = undefined
    try{
        data = await fs.readFile(path, 'utf-8')
    }
    catch(exception){
        err = exception
    }
    finally{
        return { 
            err : err,
            data : data,
        }
    }
}

exports.update = async function(path, data){
    let err = undefined
    try{
        await fs.writeFile(path, data)
    }
    catch(exception){
        err = exception
    }
    finally{
        return {
            err : err
        }
    }
    
}

exports.delete = async function(path){
    let err = undefined
    try{
        await fs.unlink(path)
    }
    catch(exception){
        err = exception
    }
    finally{
        return{
            err : err
        }
    }
}
exports.exists = async function (path) {
    let err = undefined
    try{
        err = await fs.access(path, fs.F_OK)
    }
    catch(exception){
        err = exception
    }
    finally{
        return {
            err : err,
        }
    }
}

exports.readdir = async function(path){
    var err = null
    var filelist = null
    try{
        filelist = await fs.readdir(path)
        return { err,  filelist }
    }
    catch(exception){
        return { exception,  filelist }
    }
    
}

