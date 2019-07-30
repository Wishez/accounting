const Details = require('./scalarTypes').Details

const makeCreateMutation = actionName => (_, { payload }, { dataSources }) => dataSources.accountingAPI[actionName](payload)
const makeUpdateMutation = actionName => (_, { uuid, payload }, { dataSources }) => dataSources.accountingAPI[actionName](uuid, payload)
const makeDeleteMutation = actionName => (_, { uuid }, { dataSources }) => dataSources.accountingAPI[actionName](uuid)
const getList = requestName => (_, __, { dataSources }) => dataSources.accountingAPI[requestName]()
const getItem = (requestName, itemKey) => (_, variables, { dataSources }) => dataSources.accountingAPI[requestName](variables[itemKey])

module.exports = {
    Query: {
        profiles: getList('getProfiles'),
        accounts: getList('getAccounts'),
        transactions: getList('getTransactions'),
        transactionsTypes: getList('getTransactionsTypes'),

        transaction: getItem('getTransaction', 'uuid'),
        account: getItem('getAccount', 'slug'),
        transactionType: getItem('getTransactionType', 'slug'),
        profile: getItem('getProfile', 'email'),
    },

    Mutation: {
        login: (_, { email, password }, { dataSources }) => dataSources.authAPI.auth(email, password),
        refreshAuth: (_, { refreshToken }, { dataSources }) => dataSources.authAPI.refresh(refreshToken),
        verifyAuth: (_, { token }, { dataSources }) => dataSources.authAPI.verify(token),

        createTransaction: makeCreateMutation('createTransaction'),
        updateTransaction: makeUpdateMutation('updateTransaction'),
        deleteTransaction: makeDeleteMutation('deleteTransaction'),

        createProfile: makeCreateMutation('createProfile'),
        updateProfile: makeUpdateMutation('updateProfile'),
        deleteProfile: makeDeleteMutation('deleteProfile'),

        createAccount: makeCreateMutation('createAccount'),
        updateAccount: makeUpdateMutation('updateAccount'),
        deleteAccount: makeDeleteMutation('deleteAccount'),

        createTransactionType: makeCreateMutation('createTransactionType'),
        updateTransactionType: makeUpdateMutation('updateTransactionType'),
        deleteTransactionType: makeDeleteMutation('deleteTransactionType'),
    },

    Details,
}
