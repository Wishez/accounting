const { gql } = require('apollo-server-express')

const schemaString = gql`
    type Query {
        me(email: String!, password: String!): User!
        users: [User]!
        accounts: [Account]!
        transactions(name: String): [Transaction]!
        transactionsTypes: [TransactionType]!
    }

    type User {
        id: ID!
        email: String!
        password: String!
        fullName: String!
        role(name: RoleName): String!
    }

    enum RoleName {
        admin
        user
        viewer
    }

    type Account {
        id: ID!
        name: String!
        transactions: [Transaction]!
        color: String
    }

    type TransactionAccount {
        id: ID!
        name: String!
        color: String
    }

    type Transaction {
        id: ID!
        name: String!
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

    type TransactionDetail {
        id: ID!
        name: String!
        type: TransactionType!
        accounts: [TransactionAccount]!
    }

    type TransactionType {
        id: ID!
        name: String!
        color: String
    }
`

module.exports = schemaString
