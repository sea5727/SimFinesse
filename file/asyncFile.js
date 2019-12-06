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
        ret = await fs.writeFile(path, data)
        console.log(ret)
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

