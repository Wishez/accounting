const gql = require('graphql-tag')

const accountsQuery = gql`
query GetAccountRequest {
  accounts {
    isSuccess
    data {
      id
      name
    }
  }
}
`

const createAccountMutation = gql`
  mutation CreateAccount($payload: CreateAccountPayload!) {
    createAccount(payload: $payload) {
      isSuccess
      data {
        id
        name
      }
    }
  }
`

const transactionTypesQuery = gql`
query GetTransactionsTypes {
  transactionsTypes {
    isSuccess
    data {
      id
      name
    }
  }
}
`

const createTransactionTypeMutation = gql`
  mutation CreateTransactionType($payload: CreateTransactionTypePayload!) {
    createTransactionType(payload: $payload) {
      isSuccess
      data {
        id
        name
      }
    }
  }
`

const createTransactionMutation = gql`
mutation CreateTransaction($payload: CreateTransactionPayload!) {
  createTransaction(payload: $payload) {
    isSuccess
    data {
      id
      account {
        id
      }
      type {
        id
      }
    }
  }
}
`

const authenticateUserMutation = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access
    }
  }
`

module.exports = {
  accountsQuery,
  transactionTypesQuery,
  createAccountMutation,
  createTransactionMutation,
  createTransactionTypeMutation,
  authenticateUserMutation,
}