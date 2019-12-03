isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};
isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

getObjectParams = function(level, obj){
    let blank = ' '
    for(let b = 0 ; b < level ; b++ ){
        blank += '        '
    }
    for(let i in obj){
        if(isObject(obj[i])){
            if(isArray(obj)){
                console.log(`${blank}{`)
            }
            else {
                console.log(`${blank}${i}{`)
            }
            getObjectParams(level + 1, obj[i])
            console.log(`${blank}},`)
        }
        else if(isArray(obj[i])){
            console.log(`${blank}${i} [`)
            getObjectParams(level + 1, obj[i])
            console.log(`${blank}],`)
        }
        else {
            console.log(`${blank}${i} : ${obj[i]},`)
        }
    }
}

module.exports = {
    getObjectParams : getObjectParams
}