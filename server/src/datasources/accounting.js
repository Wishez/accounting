const { RESTDataSource } = require('apollo-datasource-rest');
const env = require('../env')
const isArray = require('lodash/isArray')
const pick = require('lodash/pick')

const getTime = (item, dateFieldName) => new Date(item[dateFieldName]).getTime()
const sortByDate = (items, dateFieldName) => {
  if (!dateFieldName) return items

  return items.sort((a, b) => {
    const differance = getTime(b, dateFieldName) - getTime(a, dateFieldName)
    if (differance === 0) return a.order - b.order

    return differance
  })
}

class AccountingAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = env.TEST_ACCOUNTING_API_URL || env.ACCOUNTING_API_URL
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
      transactionType,
      is_deleted = false,
    } = transaction
    return {
      id: uuid,
      type: AccountingAPI.reduceTransactionType(transactionType),
      isDeleted: is_deleted,
      ...pick(transaction, [
        'transaction_object', 'segment', 'category', 'note', 'profit',
        'balance', 'date', 'order', 'consumption',
      ]),
    }
  }

  static reduceTransactionType(transactionType) {
    if (!transactionType.uuid) return null

    const { uuid, is_deleted = false } = transactionType
    return {
      id: uuid,
      isDeleted: is_deleted,
      ...pick(transactionType, [
        'name', 'color', 'slug',
      ]),
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
    const result = await this.post('accounts/', { 
      payload: {
        ...pick(payload, [ 
          'name', 'color', 'slug',
        ]),
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
    const result = await this.put(`accounts/${uuid}/`, {
      ...pick(payload, [ 
        'transactionIds', 'action', 'name',
        'color', 'slug',
      ]),
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
    } = payload
    const result = await this.post('transactions/', {
      accountId,
      transactionTypeId,
      payload: {
        ...pick(payload, [ 
          'balance', 'profit', 'consumption', 'order', 'note', 'date', 'category', 'slug',
          'transaction_object', 'segment',
        ]),
      },
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransaction)
  }
  
  async updateTransaction(uuid, payload) {
    const result = await this.put(`transactions/${uuid}/`, {
      ...pick(payload, [ 
        'balance', 'profit', 'consumption', 'order', 'note', 'date', 'category', 'slug',
        'transaction_object', 'segment',
,      ]),
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
    const result = await this.post(`transactions/types/`, {
      payload: {
        ...pick(payload, [ 
          'name', 'color', 'slug',
  ,      ]),
      }
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceTransactionType)
  }

  async updateTransactionType(uuid, payload) {
    const result = await this.put(`transactions/types/${uuid}/`, {
      ...pick(payload, [ 
        'name', 'color', 'slug',
,      ]),
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
    const { uuid, name, date_joined, is_deleted = false } = profile
    const [firstName, middleName, lastName] = name.split(' ')
  
    const hasNotMiddleName = !lastName
    return {
      id: uuid,
      firstName: `${firstName} ${hasNotMiddleName ? '' : middleName}`,
      lastName: hasNotMiddleName ? middleName : lastName,
      dateJoined: date_joined,
      isDeleted: is_deleted,
      ...pick(profile, [ 
        'email', 'role',
,      ]),
    }
  }

  async createProfile(payload) {
    const result = await this.post('profile/', {
      payload: {
        ...pick(payload, [ 
          'email', 'password', 'name', 'role',
  ,      ]),
      },
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceProfile)
  }

  async updateProfile(uuid, payload) {
    const result = await this.put(`profile/${uuid}/`, {
      ...pick(payload, [ 
        'email', 'password', 'name', 'role',
,      ]),
    })
    return AccountingAPI.getItemResponse(result, AccountingAPI.reduceProfile)
  }

  async deleteProfile(uuid) {
    const result = await this.patch(`profile/${uuid}/`)
    return AccountingAPI.getDeleteItemResponse(result)
  }
}

module.exports = AccountingAPI
