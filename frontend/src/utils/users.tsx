import axios from 'redaxios'
import { queryOptions } from '@tanstack/react-query'

export type User = {
  id: number
  name: string
  email: string
}

export type TPagination = {
currentPage:number
endIndex:number
hasNextPage:boolean
hasPreviousPage:boolean
itemsOnCurrentPage:number
limit:number
nextPage:number | null
offset:number
previousPage:null | number
startIndex:number
totalCount:number
totalPages:number
}
export type UserWithAddress = User & {
  address: {
    street: string
    city: string
    state: string
    zipcode: string
  }
}

export type UsersResponse = {
  data: UserWithAddress[]
  pagination: TPagination
}


export const DEPLOY_URL = 'http://localhost:5003'

export const usersQueryOptions = ({
    currentPage = 1 ,
    pageSize = 4,
    } : { currentPage: number, pageSize: number }
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
