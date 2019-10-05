const cyrillicToTranslit = require('cyrillic-to-translit-js')
const translitCompiler = cyrillicToTranslit()
const transliteText = (value, delimiters) => translitCompiler.transform(value.toLowerCase(), delimiters) 

let token = ''
const getContext = () => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

const {
  accountsQuery,
  transactionTypesQuery,
  createTransactionTypeMutation,
  createAccountMutation,
  createTransactionMutation,
  authenticateUserMutation
} = require('./gql')
const GraphqlClient = require('./graphqlClient.js')
const client = new GraphqlClient()
const getAccounts = () => client.query({
  query: accountsQuery,
  requestName: 'accounts',
  context: getContext(),
})
const getTransactionTypes = () => client.query({
  query: transactionTypesQuery,
  requestName: 'transactionsTypes',
  context: getContext(),
})

const { ADMIN_USER_PASSWORD, ADMIN_USER_EMAIL } = require('../env')
const login = () => client.client.mutate({
  mutation: authenticateUserMutation,
  variables: {
    email: ADMIN_USER_EMAIL,
    password: ADMIN_USER_PASSWORD,
  },
})

const get = require('lodash/get')
const getCreatedTransactionId = async (accountId, transactionTypeId, payload) => {
  const createdTransactionType = await client.mutate({
    mutation: createTransactionMutation,
    requestName: 'createTransaction',
    variables: {
      payload: {
        accountId,
        transactionTypeId,
        ...payload,
      },
    },
    context: getContext(),
  })

  return get(createdTransactionType, 'id')
}

const getCreatedTransactionTypeId = async (transactionTypeName, items) => {
  const transactionTypeId = get(items.find(({ name }) => name === transactionTypeName), 'id')
  if (transactionTypeId) return transactionTypeId

  const createdTransactionType = await client.mutate({
    mutation: createTransactionTypeMutation,
    requestName: 'createTransactionType',
    variables: {
      payload: {
        name: transactionTypeName,
        slug: transliteText(transactionTypeName.replace(/[\\\(\)]/g, '-'), '-'),
      },
    },
    context: getContext(),
  })
  items.push(createdTransactionType)
  return get(createdTransactionType, 'id')
}

const getCreatedAccountId = async (accountName, items) => {
  const accountId = get(items.find(({ name }) => name === accountName), 'id')
  if (accountId) return accountId

  const createdAccount = await client.mutate({
    mutation: createAccountMutation,
    requestName: 'createAccount',
    variables: {
      payload: {
        name: accountName,
        slug: transliteText(accountName.replace(/[\\\(\)]/g, '-'), '-'),
      },
    },
    context: getContext(),
  })
  items.push(createdAccount)
  return get(createdAccount, 'id')
}

const mapValues = require('lodash/mapValues')
const omit = require('lodash/omit')
const findLastKey = require('lodash/findLastKey')
const moment = require('moment')
const { cells } = require('./constants/transactions')

const createTransactionsFromSheet = async ({ sheet, accounts, transactionTypes, year }) => {
  const cellRegExp = /\w\d+/
  const lastCell = findLastKey(sheet, (value, key) => cellRegExp.test(key))
  
  const rowsQuantity = lastCell.replace(/\D/g, '')
  const createdTransactions = []
  for (let row = 1; row <= rowsQuantity; row++) {
    const getCellFromRow = (cellName, key) => getSheetCell(sheet, cellName, row, key)
    const profit = getCellFromRow('profit')
    const consumption = getCellFromRow('consumption')
    const accountName = getCellFromRow('account')
    const transactionTypeName = getCellFromRow('operation_type')
    const date = moment(`${getCellFromRow('date', 'w')} ${year}`, 'D MMM YYYY')
    const balance = getCellFromRow('balance')
    if (!balance || !(profit || consumption) || !accountName || !transactionTypeName || !date.isValid()) continue;

    const payload = {
      ...mapValues(
        omit(cells, [
          'account', 'profit', 'consumption', 'operation_type', 'date', 'balance'
        ]),
        (_, key) => {
          const value = getCellFromRow(key)
          const { type: Type } = cells[key]
          return value === undefined ? value : Type(value)
        },
      ),
      profit,
      consumption,
      balance,
      date: date.format('YYYY-MM-DD'),
    }
    const accountId = await getCreatedAccountId(accountName, accounts)
      .then(result => result)
    const transactionTypeId = await getCreatedTransactionTypeId(transactionTypeName, transactionTypes)
      .then(result => result)
    const transactionId = await getCreatedTransactionId(accountId, transactionTypeId, payload)
      .then(result => result)

    createdTransactions.push(transactionId)
  }

  return createdTransactions
}

function getFloatIfNumberValue(value) {
  const cellNumber = Number(value)
  return Number.isNaN(cellNumber) ? unescape(value) : Math.abs(cellNumber.toFixed(2))
}

function getSheetCell(sheet, cellName, row, type = 'v') {
  const cell = sheet[`${cells[cellName].position}${row}`]
  if (typeof cell !== 'object') return

  return getFloatIfNumberValue(cell[type])
}

const xls = require('xlsx')
const createTransactionsFromSheets = async (fileName, accessToken) => {
  token = accessToken || await login().then(({ data }) => data.login.access)
  const accounts = await getAccounts()
  const transactionTypes = await getTransactionTypes()
  
  const workbook = xls.readFile(`${__dirname}/../../files/${fileName}.xls`)
  const sheetNames = workbook.SheetNames
  const sheets = workbook.Sheets
  
  sheetNames.forEach((sheetName) => {
    const [month, year] = sheetName.split(' ') 
    if (/^\d{4,4}$/.test(year)) {
      createTransactionsFromSheet({
        sheet: sheets[sheetName],
        accounts,
        transactionTypes,
        year,
      })
    } 
  })
}

module.exports = createTransactionsFromSheets
