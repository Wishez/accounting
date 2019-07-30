const { gql } = require('apollo-server-express')

const schemaString = gql`
    type Query {
        profiles: ProfielesResponse!
        accounts: AccountsResponse!
        transactions: TransactionsResponse!
        transactionsTypes: TransactionsTypesResponse!

        account(slug: String!): AccountResponse!
        transaction(uuid: String!): TransactionResponse!
        transactionType(slug: String!): TransactionTypeResponse!
        profile(email: String!): ProfileResponse!
    }

    type AccountsResponse {
        isSuccess: Boolean!
        details: Details
        data: [Account]!
    }

    scalar Details

    type ProfielesResponse {
        isSuccess: Boolean!
        details: Details
        data: [User]!
    }

    type TransactionsResponse {
        isSuccess: Boolean!
        details: Details
        data: [Transaction]!
    }

    type Transaction {
        id: ID!
        type: TransactionType!
        category: String!
        branch: String
        note: String
        consumption: Float!
        profit: Float!
        balance: Float!
        date: String!
        order: Int
    }

    type TransactionsTypesResponse {
        isSuccess: Boolean!
        details: Details
        data: [TransactionType]!
    }

    type TransactionTypeResponse {
        isSuccess: Boolean!
        details: Details
        data: TransactionType!
    }

    type AccountResponse {
        isSuccess: Boolean!
        details: Details
        data: Account!
    }

    type ProfileResponse {
        isSuccess: Boolean!
        details: Details
        data: User!
    }

    type TransactionResponse {
        isSuccess: Boolean!
        details: Details
        data: TransactionDetail!
    }

    type User {
        id: ID!
        email: String!
        firstName: String!
        lastName: String
        role(name: RoleName): String!
        dateJoined: String!,
    }

    enum RoleName {
        admin
        user
        viewer
    }

    type Account {
        id: ID!
        name: String!
        slug: String!
        transactions: [Transaction]!
        color: String
    }

    type TransactionAccount {
        id: ID!
        slug: String!
        name: String!
        color: String
    }

    type TransactionDetail {
        id: ID!
        type: TransactionType!
        category: String!
        branch: String
        note: String
        consumption: Float!
        profit: Float!
        balance: Float!
        date: String!
        order: Int
        account: TransactionAccount!
    }

    type TransactionType {
        id: ID!
        name: String!
        color: String
        slug: String!
    }
    
    type Mutation {
        login(email: String!, password: String!): AuthResponse!
        refreshAuth(refreshToken: String!): RefreshAuthResponse!
        verifyAuth(token: String!): VerifyAuthResponse!

        createTransaction(payload: CreateTransactionPayload!): TransactionResponse!
        updateTransaction(uuid: String!, payload: UpdateTransactionPayload!): TransactionResponse!
        deleteTransaction(uuid: String!): DeleteItemResponse!

        createProfile(payload: CreateProfilePayload!): ProfileResponse!
        updateProfile(uuid: String!, payload: UpdateProfilePayload!): ProfileResponse!
        deleteProfile(uuid: String!): DeleteItemResponse!

        createAccount(payload: CreateAccountPayload!): AccountResponse!
        updateAccount(uuid: String!, payload: UpdateAccountPayload!): AccountResponse!
        deleteAccount(uuid: String!): DeleteItemResponse!

        createTransactionType(payload: CreateTransactionTypePayload!): TransactionTypeResponse!
        updateTransactionType(uuid: String!, payload: UpdateTransactionTypePayload!): TransactionTypeResponse!
        deleteTransactionType(uuid: String!): DeleteItemResponse!
    }

    type AuthResponse {
        email: String
        access: String
        refresh: String
        detail: String
    }

    type RefreshAuthResponse {
        email: String
        access: String
        detail: String
    }

    type VerifyAuthResponse {
        email: String
        detail: String
    }

    input CreateTransactionPayload {
        accountId: String!
        transactionTypeId: String!
        balance: Float
        profit: Float,
        consumption: Float,
        order: Int
        branch: String
        note: String
        date: String
        category: String
    }

    input UpdateTransactionPayload {
        transactionTypeId: String
        balance: Float
        profit: Float
        consumption: Float
        order: Int
        branch: String
        note: String
        date: String
        category: String
    }

    type DeleteItemResponse {
        isSuccess: Boolean!
        details: Details
        data: String
    }

    input CreateProfilePayload {
        email: String!
        password: String!
        name: String!
        role: String
    }

    input UpdateProfilePayload {
        email: String
        password: String
        name: String
        role: String
    }

    input CreateAccountPayload {
        slug: String!
        name: String!
        color: String
    }

    input UpdateAccountPayload {
        slug: String
        transactionIds: [String]
        action: String
        name: String
        color: String
    }

    input CreateTransactionTypePayload {
        name: String!
        color: String
        slug: String!
    }

    input UpdateTransactionTypePayload {
        name: String
        color: String
        slug: String
    }
`

module.exports = schemaString
