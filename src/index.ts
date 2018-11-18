import Auth0Lock from 'auth0-lock'
// import gql from 'graphql-tag'



//@ts-ignore
const {
    AUTH0_API_AUDIENCE,
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_CALLBACK_URL
} = process.env

const _initLock = ()=>{
    return new Auth0Lock(AUTH0_CLIENT_ID as any, AUTH0_DOMAIN as any, {
        oidcConformant: true,
        autoclose: true,
        auth: {
            sso: false,
            redirectUrl: AUTH0_CALLBACK_URL,
            responseType: 'token id_token',
            audience: AUTH0_API_AUDIENCE,
            params: {
                scope: 'openid profile email user_metadata app_metadata picture'
            }
        },
    })
}

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
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('id_token', idToken)
        localStorage.setItem('expires_at', expiresAt)
    
    }else{
        throw new TypeError('Invalid response from Auth0 client')
    }
  
}

export const getAccessToken = ()=>{
    
    if (!isAuthenticated()){
        return false
    }

    const accessTokenStore = localStorage.getItem('access_token')

    return accessTokenStore
}
export const authorizeViaPopup = async ()=>{

    const _lock = _initLock()

    //@ts-ignore
    const { idToken,accessToken,expiresIn } = await new Promise((resolve,reject)=>{
        // Add a callback for Lock's `authenticated` event
        _lock.on('authenticated', ({ idToken,accessToken,expiresIn })=>{
            resolve({ idToken,accessToken,expiresIn })
        })
        // Add a callback for Lock's `authorization_error` event
        _lock.on('authorization_error', err => {
            console.error(err)
            alert(`Error: ${err.error}. Check the console for further details.`)
            reject(err)
            // this.cb(data)
        })

        _lock.show()
    })

    _setSession({ idToken,accessToken,expiresIn })

    return { idToken,accessToken }
  
}

export const logout = (redirectTo)=>{

    //@ts-ignore
    if (!process.browser) {
        throw new Error('logout() needs to be called client-side')
    }
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')

    if (redirectTo && redirectTo.length){
        window.location.href = redirectTo
    }else{
        window.location.reload()
    }
    
}

export const isAuthenticated = ()=>{
    // Check whether the current time is past the
    // access token's expiry time
    //@ts-ignore
    if (!process.browser){
        return false
    }

    const expiresAtStore=localStorage.getItem('expires_at')

    const expiresAt = expiresAtStore?JSON.parse(expiresAtStore):0

    return new Date().getTime() < expiresAt
}