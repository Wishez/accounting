const get = require('lodash/get')

module.exports = async ({ req }) => {
    const accessToken = get(req.cookies, 'access_token')
    // const validateTokenResponse = await 
    if (accessToken) return { user: null }
    // get User from DB
    return {}
}
