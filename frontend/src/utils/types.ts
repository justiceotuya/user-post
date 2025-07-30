export type User = {
  id: string
  name: string
  email: string
  username: string
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
  addresses: {
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

export type PostType = {
  id: string;
  title: string;
    body: string;
    created_at: string;
    user: string;
    email: string;
}

export type PostsResponse = {
  posts: PostType[]
  pagination: TPagination
}

export type UserPostsResponse  = {
  data: {
    user: string;
    email: string;
    posts: PostType[];
  };
  pagination: TPagination;
}
