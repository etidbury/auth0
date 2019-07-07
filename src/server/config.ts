const path = require('path')

let config:any={}

const CONFIG_FILE_DIR='./config/auth0'

try {

    config = require(path.join(process.cwd(),CONFIG_FILE_DIR))

    const requiredVars = [
        'AUTH0_API_AUDIENCE',
        'AUTH0_DOMAIN',
        'AUTH0_CLIENT_ID',
        //'AUTH0_REDIRECT_URL'
    ]

    for (let i=0; i<requiredVars.length; i++){
        const requiredVar=requiredVars[i]
        if (!config[requiredVar]||!config[requiredVar].length) {
            throw new TypeError(`${requiredVar} not specified in ${CONFIG_FILE_DIR}`)
        }
    }
}catch (err){
    throw new Error(`Make sure you have specified ${CONFIG_FILE_DIR} in your project`)
}

export default config

