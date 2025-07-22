import axios from 'redaxios'
import { queryOptions } from '@tanstack/react-query'

export type User = {
  id: number
  name: string
  email: string
}
export type UserWithAddress = User & {
  address: {
    street: string
    city: string
    state: string
    zipcode: string
  }
}
export const DEPLOY_URL = 'http://localhost:5003'

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: ['users'],
    queryFn: () =>
      axios
        .get<Array<UserWithAddress>>(DEPLOY_URL + '/users?limit=5')
        .then((r) => r.data)
        .catch(() => {
          throw new Error('Failed to fetch users')
        }),
  })

export const userQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['users', id],
    queryFn: () =>
      axios
        .get<UserWithAddress>(DEPLOY_URL + '/users/' + id)
        .then((r) => r.data)
        .catch(() => {
          throw new Error('Failed to fetch user')
        }),
  })
