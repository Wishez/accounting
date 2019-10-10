<template>
  <div v-if="isUserAdmin" class="container">
    <section class="users-section">
      <h1>Пользователи</h1>
      <div class="actions_near litter">
        <base-button :action="toggleUsers" class="action-button" unstyled>{{isDeletedShown ? 'Действующие' : 'Удалённые'}} пользователи</base-button>

        <base-button :action="openUserDialog" class="action-button" unstyled>Создать пользователя</base-button>
    
        <div class="search-field">
          <base-field
            v-model="nameFilterValue"
            name="nameFilter"
            id="nameFilter"
            autocomplete="off"
            placeholder="Иван Васильевич"
            :icon="['fas', 'search']"
          />
        </div>

        <loader v-if="$apollo.queries.profiles.loading || isSearchLoading" />
      </div>

      <ul v-if="$lodash.get(profiles, 'length', 0)" class="users-list">
        <li
          v-for="({ id, email, role, dateJoined }, index) in profiles.slice(0, pageNumber).filter((profile) => searchName ? payloads[profile.id].name.indexOf(searchName) !== -1 : true)"
          :key="index + updateCount"
          class="user-item"
        >
          <h2 @input="(event) => setUserName(event, id)" :contenteditable="isUserAdmin  && user.id !== id">
            {{payloads[id].name}}
          </h2>
          <p>Аккаунт создан: {{new Date(dateJoined) | formatDate('DD MMMM YYYYг.')}}</p>

          <p v-if="!isUserAdmin || user.id === id">Email: {{email}}</p>
          <p v-else>  
            <base-field
              v-model="payloads[id].email"
              labelText="Email: "
              type="email"
              :id="`user_${index}`"
              :name="`user_${index}`"
              isInline
            />
          </p>
          
          <p v-if="user.id !== id" class="roleFieldContainer">
            <base-dropdown
              labelText="Роль:"
              :options="roles"
              :name="`dropdown_${index}`"
              :id="`dropdown_${index}`"
              :defaultValue="roles.find(({ id }) => id === role)"
              @selected="(selection) => validateSelection(id, selection)"
              placeholder="Выберете роль"
              isInline
            />
          </p>
          <p v-else>Ваша роль: {{RolesMap[role]}}</p>

          <p v-if="$lodash.get(payloads[id], 'isError')" class="error">{{errorMessage}}</p>
          <p v-if="$lodash.get(payloads[id], 'isSuccess')">{{successMessage}}</p>

          <div v-if="id !== user.id && isUserAdmin" class="userActions">
            <base-button :action="editUser(id)">Обновить</base-button>
            <base-button :action="deleteUser(id)" unstyled>
              {{isDeletedShown ? 'Восстановить' : 'Удалить'}}
            </base-button>
          </div>
        </li>
      </ul>

      <div ref="pagination" class="pagination litter"></div>
    </section>

  <modal-container :isShown="$store.state.popups[userPopupName]" :onClose="refetchProfieles">
      <user-form />
    </modal-container>
  </div>
  <p v-else class="container">
    У вас недостаточно прав для просмотра этой страницы
  </p>

</template>

<script>
import { mapState } from 'vuex'
import { getProfilesGql, updateProfileGql, deleteProfileGql } from '~/constants/gql'
import { popupsNames } from '~/constants/popups'
import { Roles, RolesMap, roles } from '~/constants/user'
import { ModalContainer, UserForm } from '~/components'
import { pluck, debounceTime, map, of } from 'rxjs/operators'
import { setPagination } from '~/constants/pagination'

const { USER: userPopupName } = popupsNames

export default {
  name: "UsersPage",
  components: {
    ModalContainer,
    UserForm,
  },

  apollo: {
    profiles: {
      query: getProfilesGql,

      update({ profiles }) {
        const { isSuccess, data } = profiles || {}
        data.forEach((user) => this.createUserPayloadIfNeeded(user.id, user))
        return isSuccess ? data : []
      },
    }
  },

  data: () => ({
    RolesMap,
    Roles,
    roles,
    payloads: {},
    userPopupName,
    errorMessage: 'Не удалось обновить профиль',
    successMessage: 'Профиль успешно обновлён',
    updateCount: 1,
    searchName: '',
    nameFilterValue: '',
    isDeletedShown: false,
    isSearchLoading: false,
    pageNumber: 5,
  }),

  computed: mapState('auth', ['user', 'isUserAdmin']),

  mounted() {
    setPagination.call(this, 5)
  },

  methods: {
    validateSelection(userId, selection) {
      this.createUserPayloadIfNeeded(userId)

      const userPayload = this.payloads[userId]
      userPayload.role = selection.id
    },

    deleteUser(id) {
      return async () => {
        try {
          const response = await this.$apollo.mutate({
            mutation: deleteProfileGql,
            variables: {
              uuid: id,
            }
          }).then(({ data: responseData }) => {
            const { isSuccess, data } = responseData.deleteProfile || {}
            if (isSuccess) this.refetchProfieles()
            else this.showRequestError(id)
            return data
          })
            .catch(() => this.showRequestError(id))
        } catch (e) {
          this.showRequestError(id)
        }
      }
    },

    editUser(id) {
      return async () => {
        try {
          const response = await this.$apollo.mutate({
            mutation: updateProfileGql,
            variables: {
              uuid: id,
              payload: this.$lodash.omit(this.payloads[id], ['isError', 'isSuccess', 'id'])
            }
          }).then(({ data: responseData }) => {
            const { isSuccess, data } = responseData.updateProfile || {}
            if (isSuccess) this.showSuccess(id)
            else this.showRequestError(id)
            return data
          })
            .catch(() => this.showRequestError(id))
        } catch (e) {
          this.showRequestError(id)
        }
      }
    },

    showSuccess(id) {
      this.createUserPayloadIfNeeded(id)

      const payload = this.payloads[id]
      payload.isSuccess = true
      payload.isError = false
      this.refetchProfieles()
    },

    showRequestError(id) {
      this.createUserPayloadIfNeeded(id)

      const payload = this.payloads[id]
      payload.isError = true
      payload.isSuccess = false
      this.updateCount += 1
    },

    refetchProfieles() {
      this.pageNumber = 5
      this.$apollo.queries.profiles.refetch({
        isDeletedShown: this.isDeletedShown,
      })
      this.updateCount += 1
    },

    createUserPayloadIfNeeded(id, user) {
      if (!this.payloads[id]) {
        const { firstName, lastName, role, email } = user
        const name = 
        this.payloads[id] = {
          name: `${firstName} ${lastName}`,
          email,
          role,
         }
      }
    },

    toggleUsers() {
      this.isDeletedShown = !this.isDeletedShown
      this.refetchProfieles()
    },

    setUserName(event, id) {
      this.payloads[id].name = event.target.innerText.trim()
    },

    openUserDialog() {
      this.$store.dispatch('popups/openPopup', userPopupName)
    },

    setUserEmail(event, id) {
      this.payloads[id].email = event.target.innerText.trim()
    }
  },

  subscriptions() {
    return {
      $searchName: this.$watchAsObservable('nameFilterValue').pipe(
        map((value) => {
          this.isSearchLoading = true
          return value
        }),
        debounceTime(500),
        pluck('newValue'),
        map(value => {
          this.pageNumber = 5
          this.searchName = value
          this.isSearchLoading = false
        })
      ),
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/config/_colors.sass';


p {
  margin: 0 0 .5em;

  &:last-of-type {

    @media (--from-tablet) {
      margin-bottom: 1.25em;
    }
  }
}

.users-section {
  min-height: 400px;
}

.users-list {
  display: flex;
  flex-flow: row wrap;
  margin-left: -.5em;
  margin-right: -.5em;
}

.user-item {
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(#333, .5);
  background-color: white;
  border: 3px dashed $darkGray; 

  @media (--from-tablet) {
    flex-basis: 33%;
    margin: .5em;
  }

  @media (--until-tablet) {
    margin: .5em 0;
  }

  > * {
    @media (--until-tablet) {
      width: 100%;
    }
  }
  
  button {
    margin-top: auto;
  }
}

.userActions {
  width: 100%;
  margin-top: auto;
  display: flex;
  align-items: center;

  @media (--until-tablet) {
    margin-top: 1.5em;
  }

  button {
    margin-top: 0;
    margin-right: 15px;
  }

  button:not(.button) {
    border-bottom: 1px dotted;
  }
}

.search-field {
  margin-left: auto;

  @media (--from-tablet) {
    min-width: 360px;
  }
}
.actions_near {
  display: flex;
  align-items: flex-end;
}
</style>