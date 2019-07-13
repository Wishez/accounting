const Details = require('./scalarTypes').Details

const makeCreateMutation = actionName => (_, { payload }, { dataSources }) => dataSources.accountingAPI[actionName](payload)
const makeUpdateMutation = actionName => (_, { uuid, payload }, { dataSources }) => dataSources.accountingAPI[actionName](uuid, payload)
const makeDeleteMutation = actionName => (_, { uuid }, { dataSources }) => dataSources.accountingAPI[actionName](uuid)
module.exports = {
    Query: {
        profiles: (_, __, { dataSources }) => dataSources.accountingAPI.getProfiles(),
        accounts: (_, __, { dataSources }) => dataSources.accountingAPI.getAccounts(),
        transactions: (_, __, { dataSources }) => dataSources.accountingAPI.getTransactions(),
        transactionsTypes: (_, __, { dataSources }) => dataSources.accountingAPI.getTransactionsTypes(),

        transaction: (_, { uuid }, { dataSources }) => dataSources.accountingAPI.getTransaction(uuid),
        account: (_, { uuid }, { dataSources }) => dataSources.accountingAPI.getAccount(uuid),
        profile: (_, { email }, { dataSources }) => dataSources.accountingAPI.getProfile(email),
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
