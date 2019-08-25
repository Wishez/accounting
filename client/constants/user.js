import { getProfileGql } from '~/constants/gql'

export const Roles = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
}

export const RolesMap = {
  [Roles.ADMIN]: 'Командир',
  [Roles.USER]: 'Рядовой',
  [Roles.VIEWER]: 'Наблюдатель',
}

export const roles = Object.values(Roles).map(roleId => ({
  id: roleId,
  name: RolesMap[roleId],
}))

export async function fetechUserProfile(email) {
  const { commit } = this.$store
  commit('auth/setLoggedInState', true)

  const profileResponse = await this.$apollo.query({
    query: getProfileGql,
    variables: { email },
  }).then(({ data }) => data.profile.data)
    .catch((e) => console.log('Не получилось запросить данные аккаунта', e.message))
  if (this.$lodash.get(profileResponse, 'id')) {
    commit('auth/setCurrentProfile', profileResponse)
    commit('auth/setAdminPrivilege', profileResponse.role === Roles.ADMIN)
  } else this.$router.push('/logout')
}
