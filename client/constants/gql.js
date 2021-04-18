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
        isDeleted
      }
    }
  }
`

export const getTransactionsTypesGql = gql`
query GetTransactionsTypes($isDeletedShown: Boolean) {
  transactionsTypes(isDeletedShown: $isDeletedShown) {
    isSuccess
    details
    data {
      id
      name
      color
      slug
      isDeleted
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

export const getProfilesGql = gql`
  query GetProfiles($isDeletedShown: Boolean) {
    profiles(isDeletedShown: $isDeletedShown) {
      isSuccess
      details
      data {
        id
        email
        firstName
        lastName
        role
        dateJoined
        isDeleted
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
        isDeleted
      }
    }
  }
`

export const createProfileGql = gql`
  mutation CreateProfile($payload: CreateProfilePayload!) {
    createProfile(payload: $payload) {
      isSuccess
      details
      data {
        id
      }
    }
  }
`

export const updateProfileGql = gql`
mutation UpdateProfile($uuid: String!, $payload: UpdateProfilePayload!) {
  updateProfile(uuid: $uuid, payload: $payload) {
    isSuccess
    details
    data {
      id
      firstName
      lastName
      email
      dateJoined
      role
    }
  }
}
`

export const deleteProfileGql = gql`
mutation DeleteProfile($uuid: String!) {
  deleteProfile(uuid: $uuid) {
    isSuccess
    details
    data
  }
}
`

export const deleteTransactionGql = gql`
mutation DeleteTransaction($uuid: String!) {
  deleteTransaction(uuid: $uuid) {
    isSuccess
    details
    data
  }
}
`

export const deleteTransactionTypeGql = gql`
mutation DeleteTransactionType($uuid: String!) {
  deleteTransactionType(uuid: $uuid) {
    isSuccess
    details
    data
  }
}
`

export const deleteAccountGql = gql`
mutation DeleteAccount($uuid: String!) {
  deleteAccount(uuid: $uuid) {
    isSuccess
    details
    data
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
      slug
      color
    }
    category
    transaction_object
    segment
    note
    consumption
    profit
    balance
    date
    order
    isDeleted
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
query GetAccount($slug: String!, $isDeletedTransactionsShown: Boolean) {
  account(slug: $slug, isDeletedTransactionsShown: $isDeletedTransactionsShown) {
    isSuccess
    details
    data {
      id
      name
      slug
      totalBalance
      totalConsumption
      totalProfit
      transactionsTypes {
        id
        name
        slug
      }
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
query GetAccountRequest($isDeletedShown: Boolean) {
  accounts(isDeletedShown: $isDeletedShown) {
    isSuccess
    data {
      id
      color
      name
      slug
      isDeleted
      totalBalance
      totalConsumption
      totalProfit
      transactionsTypes {
        name
        slug
      }
    }
  }
}
`
