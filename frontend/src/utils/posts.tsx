import type { PostsResponse, UserPostsResponse } from './types'
import { queryOptions, useMutation } from '@tanstack/react-query'

import axios from 'redaxios'

export const BASE_URL = 'http://localhost:5003'

export const postsQueryOptions = ({
    currentPage = 1,
    pageSize = 4,
}: { currentPage: number, pageSize: number }
) =>
    queryOptions({
        queryKey: ['posts', currentPage, pageSize],
        queryFn: () =>
            axios
                .get<PostsResponse>(BASE_URL + '/posts?page=' + currentPage + '&limit=' + pageSize)
                .then((r) => r.data)
                .catch(() => {
                    throw new Error('Failed to fetch posts')
                }),
    })


export const userPostsQueryOptions = (
    {
        currentPage = 1,
        pageSize = 4,
        userId = '',
    }: { currentPage: number, pageSize: number, userId: string }
) =>
    queryOptions({
        queryKey: ['posts', currentPage, pageSize, userId],
        queryFn: () =>
            axios
                .get<UserPostsResponse>(BASE_URL + '/users/' + userId + '/posts?page=' + currentPage + '&limit=' + pageSize)
                .then((r) => r.data)
                .catch(() => {
                    throw new Error('Failed to fetch users posts')
                }),
    })



export const useDeletePostMutation = () => {
    return useMutation({
        mutationFn: (postId: string) =>
            axios
                .delete(BASE_URL + '/posts/' + postId)
                .then((r) => r.data)
                .catch(() => {
                    throw new Error('Failed to delete post')
                }),
    });
}
