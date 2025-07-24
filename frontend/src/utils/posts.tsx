import type { PostsResponse, UserPostsResponse } from './types'
import { queryOptions, useMutation } from '@tanstack/react-query'

import axios from 'redaxios'

export const DEPLOY_URL = import.meta.env.VITE_DEPLOY_URL
export const postsQueryOptions = ({
    currentPage = 1,
    pageSize = 4,
}: { currentPage: number, pageSize: number }
) =>
    queryOptions({
        queryKey: ['posts', currentPage, pageSize],
        queryFn: () =>
            axios
                .get<PostsResponse>(DEPLOY_URL + '/posts?page=' + currentPage + '&limit=' + pageSize)
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
                .get<UserPostsResponse>(DEPLOY_URL + '/users/' + userId + '/posts?page=' + currentPage + '&limit=' + pageSize)
                .then((r) => r.data)
                .catch(() => {
                    throw new Error('Failed to fetch users posts')
                }),
    })



export const useDeletePostMutation = () => {
    return useMutation({
        mutationFn: (postId: string) =>
            axios
                .delete(DEPLOY_URL + '/posts/' + postId)
                .then((r) => r.data)
                .catch(() => {
                    throw new Error('Failed to delete post')
                }),
    });
}
