const { RESTDataSource } = require('apollo-datasource-rest');
const config = require('../env')
const isArray = require('lodash/isArray')

class AccountingAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = config.ACCOUNTING_API_URL
  }

  async getAccount(uuid) {
    const result = await this.get(`accounts/${uuid}/`)
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceAccount)
  }

  static reduceAccount(account) {
    if (!account.uuid) return null

    return {
      ...AccountingAPI.reduceTransactionAccount(account),
      transactions: account.transactions.map(AccountingAPI.reduceAccountTransaction),
    }
  }

  static reduceAccountTransaction(transaction) {
    if (!transaction.uuid) return null

    const { 
      uuid,
      category,
      branch,
      profit,
      comsumption,
      balance,
      date,
      order,
      note,
      transactionType,
    } = transaction
    return {
      id: uuid,
      type: AccountingAPI.reduceTransactionType(transactionType),
      category,
      branch,
      note,
      profit,
      balance,
      date,
      order,
      comsumption,
    }
  }

  static reduceTransactionType(transactionType) {
    if (!transactionType.uuid) return null

    const { color, name, uuid } = transactionType
    return {
      id: uuid,
      color,
      name,
    }
  }

  async getAccounts() {
    const results = await this.get('accounts/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceAccount)
  }

  static getListResponse(results, reduce) {
    const isSuccess = isArray(results)
    return {
      isSuccess,
      details: isArray ? null : results,
      data: results.map(reduce),
    }
  }

  async createAccount(payload) {
    const { name, color } = payload
    const result = await this.post('accounts/', { name, color })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceAccount)
  }

  static getItemResponse(result, reduce) {
    const entity = reduce(result)
    const isSuccess = Boolean(entity)
    return {
      isSuccess,
      details: isSuccess
        ? null
        : result,
      data: entity,
    }
  }
  
  async updateAccount(uuid, payload) {
    const {
      transactionIds,
      action,
      name,
      color,
    } = payload
    const result = await this.put(`accounts/${uuid}/`, {
      transactionIds,
      action,
      name,
      color,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceAccount)
  }

  async deleteAccounts(uuid) {
    const result = await this.delete(`accounts/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }

  static getDeleteItemResponse(result) {
    const isSuccess = !result
    return {
      isSuccess,
      details: isSuccess ? null : result,
      data: null,
    }
  }

  async getTransactions() {
    const results = await this.get('transactions/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceTransaction)
  }
  
  static reduceTransaction(transaction) {
    if (!transaction.uuid) return null
  
    return {
      ...AccountingAPI.reduceAccountTransaction(transaction),
      account: AccountingAPI.reduceTransactionAccount(transaction.account),
    }
  }

  static reduceTransactionAccount(account) {
    if (!account.uuid) return null

    const { color, uuid, name } = account
    return {
      id: uuid,
      color,
      name,
    }
  }

  async getTransaction(uuid) {
    const result = await this.get(`transactions/${uuid}/`)
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
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
    const result = await this.post('transactions/', {
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
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
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
    const result = await this.put(`transactions/${uuid}/`, {
      balance,
      profit,
      consumption,
      order,
      branch,
      note,
      date,
      category,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
  }

  async deleteTransaction(uuid) {
    const result = await this.delete(`transactions/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }

  async getTransactionsTypes() {
    const results = await this.get('transactions/types/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceTransactionType)
  }

  async updateTransactionType(uuid, payload) {
    const { name, color } = payload
    const result = await this.put(`transactions/types/${uuid}/`, {
      name,
      color,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransactionType)
  }

  async deleteTransactionType(uuid) {
    const result = await this.delete(`transactions/types/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }

  async getProfile(email) {
    const result = await this.get('profile/', { email })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceProfile)
  }

  async getProfiles() {
    const results = await this.get('profiles/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceProfile)
  }

  static reduceProfile(profile) {
    if (!profile.uuid) return null
    const { uuid, name, email, role, data_joined } = profile
    const [firstName, middleName, lastName] = name.split(' ')
    console.log(name, firstName, middleName)
    const hasNotMiddleName = !lastName
    return {
      id: uuid,
      firstName: `${firstName} ${hasNotMiddleName ? '' : middleName}`,
      lastName: hasNotMiddleName ? middleName : lastName,
      dateJoined: data_joined,
      email,
      role,
    }
  }

  async createProfile(payload) {
    const {
      email,
      password,
      name,
      role,
    } = payload
    const result = await this.post('profile/', {
      email,
      password,
      name,
      role,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceProfile)
  }

  async updateProfile(uuid, payload) {
    const {
      email,
      password,
      name,
      role,
    } = payload
    const result = await this.put(`profile/${uuid}/`, {
      email,
      role,
      password,
      name,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceProfile)
  }

  async deleteProfile() {
    const result = await this.delete(`profile/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }
}

module.exports = new AccountingAPI()