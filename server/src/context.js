const get = require('lodash/get')
const verifyToken = require('./datasources/auth').verifyToken

module.exports = async ({ req }) => {
    const accessToken = get(req.headers, 'authorization', '').split(' ')[1]
    const validateTokenResponse = accessToken ? await verifyToken(accessToken) : {}
    const { email, detail } = validateTokenResponse || {}
    const isAuth = Boolean(email)
    return { 
        message: isAuth ? null : detail,
        token: accessToken,
        isAuth,
        email,
    }
}
