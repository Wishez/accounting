import gql from 'graphql-tag'

export const getTransactionTypeGql = gql`
  query GetTransactionType($slug: String!) {
    transactionType(slug: $slug) {
      isSuccess
      details
      data {
        id
        name
        color
        slug
      }
    }
  }
`

export const getTransactionsTypesGql = gql`
query GetTransactionsTypes{
  transactionsTypes {
    isSuccess
    details
    data {
      id
      name
      color
      slug
    }
  }
}
` 

export const createTransactionTypeGql = gql`
  mutation CreateTransactionType($payload: CreateTransactionTypePayload!) {
    createTransactionType(payload: $payload) {
      isSuccess
      details
      data {
        id
        name
        color
      }
    }
  }
`

export const getProfileGql = gql`
  query GetUser($email: String!) {
    profile(email: $email) {
      isSuccess
      details
      data {
        id
        email
        firstName
        lastName
        role
        dateJoined
      }
    }
  }
`

export const updateTransactionGql = gql`
mutation UpdateTransaction($uuid: String!, $payload: UpdateTransactionPayload!) {
  updateTransaction(uuid: $uuid, payload: $payload) {
    isSuccess
    details
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

export const createTransactionGql = gql`
mutation CreateTransaction($payload: CreateTransactionPayload!) {
  createTransaction(payload: $payload) {
    isSuccess
    details
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

const transactionTile = gql`
  fragment TransactionTile on Transaction {
    id
    type {
      id
      name
    }
    category
    branch
    note
    consumption
    profit
    balance
    date
    order
  }
`

export const getTransactionGql = gql`
query GetTransaction($uuid: String!) {
  transaction(uuid: $uuid) {
    isSuccess
    details
    data {
      ...TransactionTile
      account
    }
  }
}

${transactionTile}
`

export const updateTransactionTypeGql = gql`
  mutation UpdateTransactionType($uuid: String!, $payload: UpdateTransactionTypePayload!) {
    updateTransactionType(uuid: $uuid, payload: $payload) {
      isSuccess
      details
      data {
        id
        name
        color
      }
    }
  }
`

export const getAccountGql = gql`
query GetAccount($slug: String!) {
  account(slug: $slug) {
    isSuccess
    details
    data {
      id
      name
      slug
      transactions {
        ...TransactionTile
      }
    }
  }
}

${transactionTile}
`

export const createAccountGql = gql`
  mutation CreateAccount($payload: CreateAccountPayload!) {
    createAccount(payload: $payload) {
      isSuccess
      details
      data {
        id
      }
    }
  }
`

export const updateAccountGql = gql`
  mutation UpdateAccount($uuid: String!, $payload: UpdateAccountPayload!) {
    updateAccount(uuid: $uuid, payload: $payload) {
      isSuccess
      details
      data {
        id
      }
    }
  }
`

export const verifyTokenGql = gql`
mutation VerifyUser($token: String!) {
  verifyAuth(token: $token) {
    email
    detail
  }     
}
`

export const authenticateUserGql = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      email
      access
      refresh
      detail
    }
  }
`

export const getAccountsRequestGql = gql`
query {
  accounts {
    data {
      id
      color
      name
      slug
      transactions {
        type {
          id
          name
          slug
        }
      }
    }
  }
}
`
