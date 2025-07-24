import type { UserWithAddress, UsersResponse } from './types'

import axios from 'redaxios'
import { queryOptions } from '@tanstack/react-query'

export const DEPLOY_URL = import.meta.env.VITE_DEPLOY_URL

export const usersQueryOptions = ({
  currentPage = 1,
  pageSize = 4,
}: { currentPage: number, pageSize: number }
) =>
  queryOptions({
    queryKey: ['users', currentPage, pageSize],
    queryFn: () =>
      axios
        .get<UsersResponse>(DEPLOY_URL + '/users?page=' + currentPage + '&limit=' + pageSize)
        .then((r) => r.data)
        .catch(() => {
          throw new Error('Failed to fetch users')
        }),
    select: (data) => ({
      ...data,
      data: [...data.data].sort((a, b) => a.name.localeCompare(b.name)),
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
