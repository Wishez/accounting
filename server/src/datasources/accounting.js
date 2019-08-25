const { RESTDataSource } = require('apollo-datasource-rest');
const env = require('../env')
const isArray = require('lodash/isArray')

const getTime = (item, dateFieldName) => new Date(item[dateFieldName]).getTime()
const sortByDate = (items, dateFieldName) => {
  if (!dateFieldName) return items

  return items.sort((a, b) => {
    const differance = getTime(b, dateFieldName) - getTime(a, dateFieldName)
    if (differance === 0) return b.order - a.order

    return differance
  })
}

class AccountingAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = env.ACCOUNTING_API_URL
  }

  willSendRequest(request) {
    if (this.context.isAuth) request.headers.set('Authorization', `Bearer ${this.context.token}`);
  }

  async getAccount({ slug, isDeletedTransactionsShown }) {
    const result = await this.get(`account/${slug}/`)
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceAccount, isDeletedTransactionsShown)
  }

  static reduceAccount(account, isDeletedTransactionsShown) {
    if (!account.uuid) return null

    const transactions = []
    account.transactions.forEach((transaction) => {
      const { is_deleted } = transaction
      if (isDeletedTransactionsShown === true ? is_deleted : !is_deleted) {
        transactions.push(AccountingAPI.reduceAccountTransaction(transaction))
      }
    })
    return {
      ...AccountingAPI.reduceTransactionAccount(account),
      transactions: sortByDate(transactions, 'date'),
    }
  }

  static reduceAccountTransaction(transaction) {
    if (!transaction.uuid) return null

    const { 
      uuid,
      category,
      branch,
      profit,
      consumption,
      balance,
      date,
      order,
      note,
      transactionType,
      is_deleted = false,
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
      consumption,
      isDeleted: is_deleted,
    }
  }

  static reduceTransactionType(transactionType) {
    if (!transactionType.uuid) return null

    const { color, name, uuid, slug, is_deleted = false } = transactionType
    return {
      id: uuid,
      color,
      name,
      slug,
      isDeleted: is_deleted,
    }
  }

  async getAccounts(isDeletedShown) {
    const results = await this.get('accounts/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceAccount, undefined, isDeletedShown)
  }

  static getListResponse(results, reduce, dateFieldName, isDeletedShown) {
    const isSuccess = isArray(results)
    const data = results.filter(({ is_deleted }) => isDeletedShown ? is_deleted : !is_deleted).map(reduce)
    return {
      isSuccess,
      details: isArray ? null : results,
      data: data ? sortByDate(data, dateFieldName) : null,
    }
  }

  async createAccount(payload) {
    const { name, color, slug } = payload
    const result = await this.post('accounts/', { 
      payload: {
        name,
        color,
        slug,
     },
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceAccount)
  }

  static getItemResponse(result, reduce, isDeletedTransactionsShown) {
    const entity = reduce(result, isDeletedTransactionsShown)
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
      slug,
    } = payload
    const result = await this.put(`accounts/${uuid}/`, {
      transactionIds,
      action,
      name,
      color,
      slug,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceAccount)
  }

  async deleteAccount(uuid) {
    const result = await this.patch(`accounts/${uuid}/`)
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

  async getTransactions(isDeletedShown) {
    const results = await this.get('transactions/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceTransaction, undefined, isDeletedShown)
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
    const { color, uuid, name, slug, is_deleted = false } = account
    return {
      id: uuid,
      slug,
      color,
      name,
      isDeleted: is_deleted,
    }
  }

  async getTransaction({ uuid }) {
    const result = await this.get(`transactions/${uuid}/`)
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
  }

  async createTransaction(payload) {
    const {
      accountId,
      transactionTypeId,
      balance,
      profit,
      consumption,
      order,
      branch,
      note,
      date,
      category,
      slug,
    } = payload
    const result = await this.post('transactions/', {
      accountId,
      transactionTypeId,
      payload: {
        balance,
        profit,
        consumption,
        order,
        branch,
        note,
        date,
        category,
        slug,
      },
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
  }
  
  async updateTransaction(uuid, payload) {
    const {
      slug,
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
      slug,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
  }

  async deleteTransaction(uuid) {
    const result = await this.patch(`transactions/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }

  async getTransactionsTypes(isDeletedShown) {
    const results = await this.get('transactions/types/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceTransactionType, undefined, isDeletedShown)
  }

  async createTransactionType(payload) {
    const { name, color, slug } = payload
    const result = await this.post(`transactions/types/`, {
      payload: {
        name,
        color,
        slug,
      }
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransactionType)
  }

  async updateTransactionType(uuid, payload) {
    const { name, color, slug } = payload
    const result = await this.put(`transactions/types/${uuid}/`, {
      name,
      color,
      slug,
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransactionType)
  }

  async deleteTransactionType(uuid) {
    const result = await this.patch(`transactions/types/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }

  async getProfile({ email }) {
    const result = await this.get('profile/', { email })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceProfile)
  }

  async getTransactionType({ slug }) {
    const result = await this.get(`transactions/type/${slug}/`)
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransactionType)
  }

  async getProfiles(isDeletedShown) {
    const results = await this.get('profiles/')
    return AccountingAPI.getListResponse(results, AccountingAPI.reduceProfile, 'dateJoined', isDeletedShown)
  }

  static reduceProfile(profile) {
    if (!profile.uuid) return null
    const { uuid, name, email, role, date_joined, is_deleted = false } = profile
    const [firstName, middleName, lastName] = name.split(' ')
  
    const hasNotMiddleName = !lastName
    return {
      id: uuid,
      firstName: `${firstName} ${hasNotMiddleName ? '' : middleName}`,
      lastName: hasNotMiddleName ? middleName : lastName,
      dateJoined: date_joined,
      isDeleted: is_deleted,
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
      payload: {
        email,
        password,
        name,
        role,
      },
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

  async deleteProfile(uuid) {
    const result = await this.patch(`profile/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }
}

module.exports = AccountingAPI
