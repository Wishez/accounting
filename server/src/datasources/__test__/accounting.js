const { RESTDataSource } = require('apollo-datasource-rest');

class AccountingAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.ACCOUNTING_API_URL
  }

  async getAccount(uuid) {
    const results = await this.get(`accounts/${uuid}`)
    return results
  }

  async getAccounts() {
    const results = await this.get('accounts/')
    return results
  }

  async createAccount(payload) {
    const { name, color } = payload
    const results = await this.post('accounts/', {
      name,
      color,
    })
    return results
  }
  
  async updateAccount(uuid, payload) {
    const {
      transactionIds,
      action,
      name,
      color,
    } = payload
    const results = await this.put(`accounts/${uuid}`, {
      transactionIds,
      action,
      name,
      color,
    })
    return results
  }

  async deleteAccounts(uuid) {
    const results = await this.delete(`accounts/${uuid}`)
    return results
  }

  async getTransactions() {
    const results = await this.get('transactions/')
    return results
  }

  async getTransaction(uuid) {
    const results = await this.get(`transactions/${uuid}`)
    return results
  }

  async createTransaction(payload) {
    const {
      accoutId,
      transactionTypeId,
      balance,
      profit,
      consumption,
      order,
      branch,
      note,
      date,
      category,
    } = payload
    const results = await this.post('transactions/', {
      accoutId,
      transactionTypeId,
      balance,
      profit,
      consumption,
      order,
      branch,
      note,
      date,
      category,
    })
    return results
  }
  
  async updateTransaction(uuid, payload) {
    const {
      balance,
      profit,
      consumption,
      order,
      branch,
      note,
      date,
      category,
    } = payload
    const results = await this.put(`transactions/${uuid}`, {
      balance,
      profit,
      consumption,
      order,
      branch,
      note,
      date,
      category,
    })
    return results
  }

  async deleteTransaction(uuid) {
    const results = await this.delete(`transactions/${uuid}`)
    return results
  }

  async getTransactionsTypes() {
    const results = await this.get('transactions/types/')
    return results
  }

  async updateTransactionType(uuid, payload) {
    const { name, color } = payload
    const results = await this.put(`transactions/types/${uuid}/`, {
      name,
      color,
    })
    return results
  }

  async deleteTransactionType(uuid) {
    const results = await this.delete(`transactions/types/${uuid}/`)
    return results
  }

  async getProfile(email) {
    const results = await this.get('profile/', { email })
    return results 
  }

  async createProfile(payload) {
    const {
      email,
      password,
      name,
    } = payload
    const results = await this.post('profile/', {
      email,
      password,
      name,
    })
    return results
  }

  async updateProfile(uuid, payload) {
    const {
      email,
      password,
      name,
      role,
    } = payload
    const results = await this.put(`profile/${uuid}/`, {
      email,
      role,
      password,
      name,
    })
    return results
  }

  async deleteUser() {
    const results = await this.delete(`profile/${uuid}/`)
    return results
  }
}

module.exports = AccountingAPI
