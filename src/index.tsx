// import gql from 'graphql-tag'
import * as Cookies from 'js-cookie'

//@ts-ignore
const {
    AUTH0_API_AUDIENCE,
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_REDIRECT_URL
} = process.env



const isBrowser=typeof window!=="undefined"

const _getCookies = (ctx:any={})=>{

    const isBrowser = typeof window!=="undefined"

    //@ts-ignore
    if (!isBrowser) {
        // server
        if (!ctx||!ctx.req||!ctx.req.headers) return {} // for Static export feature of Next.js

        const cookies = ctx.req.headers.cookie
        if (!cookies) return {}

        return require('cookie').parse(cookies)
    } else {
        // browser
        return require('component-cookie')();
    }

}
export const checkIsAuthenticated = (ctx?:any)=>{

  
    //@ts-ignore
    // if (!process.browser){
    //     return false
    // }

    // if ( process.browser && window.location.hash && 
    //     window.location.hash.length && 
    //     window.location.hash.indexOf('access_token') >-1 &&
    //     window.location.hash.indexOf('id_token') > -1
    //     ){
    //     //todo: check expires at in hash
    //     return true
    // }

    const cookies = _getCookies(ctx)

    // const expiresAtStore=localStorage.getItem('expires_at')
    const expiresAtStore=cookies&&cookies.expires_at

    const expiresAt = expiresAtStore?JSON.parse(expiresAtStore):0

    //todo: check tokens set 

    return new Date().getTime() < expiresAt
}



const _initLock=(optionalParams={})=>{

    const redirectURL=AUTH0_REDIRECT_URL
    
    const Auth0Lock = require('auth0-lock').default

    const lock = new Auth0Lock(
        AUTH0_CLIENT_ID as any, 
        AUTH0_DOMAIN as any, 
        Object.assign({
            oidcConformant: true,
            autoclose: true,
            auth: {
                redirect:!!redirectURL,
                //redirect:false,
                //sso: false,
                sso:true,
                redirectUrl: redirectURL,
                //responseType: 'token id_token',
                responseType: 'token id_token',
                audience: AUTH0_API_AUDIENCE,
                params: {
                    scope: 'openid profile email user_metadata app_metadata picture'
                }
            },
            optionalParams
        })
    )

    lock.on('authenticated', ({ idToken,accessToken,expiresIn })=>{
        _setSession({ idToken,accessToken,expiresIn })
    })

    return lock
}

// const _initLock = ({ redirectURL=AUTH0_REDIRECT_URL })=>{

//     return 
// }
//_initLock({})
// const AUTHENTICATE = gql`
//     mutation authenticate($idToken: String!) {
//         authenticate(idToken: $idToken) {
//             id
//             name
//             email
//         }
//     }
// `

// const _signinOrCreateAccount = async ({ accessToken, idToken, expiresAt })=>{

//     if (!process.browser){
//         throw new Error('signinOrCreateAccount(...) needs to be called client-side')
//     }

//     const res = await this.apolloClient
//         .mutate({
//             mutation: AUTHENTICATE,
//             variables: { idToken }
//         }).catch((err)=>{
//             console.log('Sign in or create account error: ', err)
//             throw err
//         })
 
//     if (window.location.href.includes('callback')) {
//         window.location.href = '/'
//     } else {
//         window.location.reload()
//     }
// }

const _setSession = ({ accessToken,idToken,expiresIn })=>{

    //@ts-ignore
    if (!process.browser){
        throw new Error('setSession(...) needs to be called client-side')
    }
    
    if (accessToken && idToken) {
        // Set the time that the access token will expire at
        let expiresAt = JSON.stringify(
            expiresIn * 1000 + new Date().getTime()
        )
        
        // localStorage.setItem('access_token', accessToken)
        // localStorage.setItem('id_token', idToken)
        // localStorage.setItem('expires_at', expiresAt)

        const expiresAtUnix = parseInt(expiresAt)
        
        Cookies.set('access_token', accessToken, { expires: new Date(expiresAtUnix)});
        Cookies.set('id_token', accessToken, { expires: new Date(expiresAtUnix)});
        Cookies.set('expires_at', expiresAt, { expires: new Date(expiresAtUnix)});

    
    }else{
        throw new TypeError('Invalid response from Auth0 client')
    }
  
}

export const getAccessToken = (ctx?:any)=>{

    const cookies = _getCookies(ctx)

    return cookies&&cookies.access_token||''
}
export const authorizeViaPopup = async (optionalParams={})=>{

    // const _lock = _initLock({redirectURL})

    const _lock = _initLock(optionalParams)

    return new Promise((resolve,reject)=>{
        // Add a callback for Lock's `authenticated` event
        _lock.on('authenticated', ({ idToken,accessToken,expiresIn,idTokenPayload })=>{
            _setSession({ idToken,accessToken,expiresIn })

            resolve({ idToken,accessToken,expiresIn,idTokenPayload })

        })
        // Add a callback for Lock's `authorization_error` event
        _lock.on('authorization_error', err => {
            console.error(err)
            reject(err)
            // this.cb(data)
        })

        _lock.show()
          
    })

  
}

export const logout = (redirectTo)=>{



    //@ts-ignore
    if (!isBrowser) {
        throw new Error('logout() needs to be called client-side')
    }
    // Clear access token and ID token from local storage
    // localStorage.removeItem('access_token')
    // localStorage.removeItem('id_token')
    // localStorage.removeItem('expires_at')

    Cookies.remove('user_id')
    Cookies.remove('access_token')
    Cookies.remove('id_token')
    Cookies.remove('expires_at')

    if (redirectTo && redirectTo.length){
        window.location.href = redirectTo
    }else{
        window.location.reload()
    }
    
}

export const getUserInfo = (accessToken)=>{
    const _lock = _initLock()
   
    return new Promise((resolve,reject)=>{

        return _lock.getUserInfo(accessToken, (error, profile) =>{
            if (error) {
              // Handle error
              reject(error)
              return;
            }
            
            resolve(profile)

        })

    });
}

export const dateAddDay = (days) => {
    const result = new Date();
    result.setDate(result.getDate() + days)
    return result;
}

export const setUserId = (userId:string)=>{

    //@ts-ignore
    if (!isBrowser) {
        throw new Error('setUserId() needs to be called client-side')
    }

    // localStorage.setItem('access_token', accessToken)
    // localStorage.setItem('id_token', idToken)
    // localStorage.setItem('expires_at', expiresAt)
    Cookies.set('user_id', userId, { expires: dateAddDay(5)})
}

export const getUserId = (ctx?:any)=>{
    

    const cookies = _getCookies(ctx)

    // localStorage.setItem('access_token', accessToken)
    // localStorage.setItem('id_token', idToken)
    // localStorage.setItem('expires_at', expiresAt)
    return cookies && cookies.user_id

}

// export const Authenticated = ({children})=> {
//     return isAuthenticated() ? children : ""
// }
// export const NotAuthenticated = ({children})=>{
//     return !isAuthenticated() ? children : ""
// }