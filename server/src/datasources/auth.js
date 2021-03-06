const { RESTDataSource } = require('apollo-datasource-rest')
const jwt = require('jsonwebtoken')
const get = require('lodash/get')
const env = require('../env')
const axios = require('axios')

console.log(env)
const getParsedToken = (token) => jwt.decode(token, {complete: true})
class AuthAPI extends RESTDataSource {
    constructor() {
        super()
        this.baseURL = env.TEST_AUTH_API_URL || env.AUTH_API_URL
    }

    async auth(email, password) {
        const result = await this.post('', { email, password })
        const { access, refresh, detail } = result
        return { access, refresh, detail, email }
    }

    async refresh(refreshToken) {
        const result = await this.post('refresh/', { refresh: refreshToken })
        const { access, detail } = result
        const email = get(getParsedToken(access), 'payload.email')
        return { access, detail, email }
    }

    async verify(token) {
        const result = await this.post('verify/', { token })
        const email = get(getParsedToken(token), 'payload.email')
        const { detail } = result
        return { detail, email }
    }
}


const verifyToken = async (token) => await axios.post(env.AUTH_API_URL + 'verify/', { token })
    .then((response) => ({
        detail: response.data.detail,
        email: get(getParsedToken(token), 'payload.email'),
    }))


module.exports = {
    api: AuthAPI,
    verifyToken,
}
