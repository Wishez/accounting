const Details = require('./scalarTypes').Details

const makeCreateMutation = actionName => (_, { payload }, { dataSources }) => dataSources.accountingAPI[actionName](payload)
const makeUpdateMutation = actionName => (_, { uuid, payload }, { dataSources }) => dataSources.accountingAPI[actionName](uuid, payload)
const makeDeleteMutation = actionName => (_, { uuid }, { dataSources }) => dataSources.accountingAPI[actionName](uuid)
const getList = requestName => (_, { isDeletedShown }, { dataSources }) => dataSources.accountingAPI[requestName](isDeletedShown)
const getItem = (requestName) => (_, variables, { dataSources }) => dataSources.accountingAPI[requestName]({ ...variables })

module.exports = {
    Query: {
        profiles: getList('getProfiles'),
        accounts: getList('getAccounts'),
        transactions: getList('getTransactions'),
        transactionsTypes: getList('getTransactionsTypes'),

        transaction: getItem('getTransaction'),
        account: getItem('getAccount'),
        transactionType: getItem('getTransactionType'),
        profile: getItem('getProfile'),
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
