import type { UserWithAddress, UsersResponse } from './types'

import axios from 'redaxios'
import config from '@/config/env';
import { queryOptions } from '@tanstack/react-query'

// export const DEPLOY_URL = import.meta.env.VITE_DEPLOY_URL
const API_BASE = config.api.baseUrl;

export const usersQueryOptions = ({
  currentPage = 1,
  pageSize = 4,
}: { currentPage: number, pageSize: number }
) =>
  queryOptions({
    queryKey: ['users', currentPage, pageSize],
    queryFn: () =>
      axios
        .get<UsersResponse>(API_BASE + '/users?page=' + currentPage + '&limit=' + pageSize)
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
        .get<UserWithAddress>(API_BASE + '/users/' + id)
        .then((r) => r.data)
        .catch(() => {
          throw new Error('Failed to fetch user')
        }),
  })
