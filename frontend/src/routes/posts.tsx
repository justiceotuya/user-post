import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { postsQueryOptions, useDeletePostMutation } from '@/utils/posts'

import Arrow from '@/assets/svg/arrow.svg';
import LoadingComponent from '@/components/loading-component'
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card';
import { queryClient } from '@/router';
import toast from 'react-hot-toast';
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

const pageSize = 10
export const Route = createFileRoute('/posts')({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(postsQueryOptions({
            currentPage: 1,
            pageSize
        }))
    },
    head: () => ({
        meta: [{ title: 'Posts' }],
    }),
    component: PostsComponent,
    pendingComponent: () => <LoadingComponent title="Posts" />
})

export function PostsComponent() {
    const [currentPage, setCurrentPage] = useState(1);

    const postsQuery = useSuspenseQuery(postsQueryOptions({
        currentPage,
        pageSize
    }))

    const posts = postsQuery.data?.data

    const { mutate: deletePost } = useDeletePostMutation()

    const handleDeletePost = (id: string) => {
        toast.promise(
            new Promise<void>((resolve, reject) => {
                deletePost(id, {
                    onSuccess: () => {
                        //invalidate the posts query to refetch the posts
                        queryClient.invalidateQueries({
                            queryKey: ['posts']
                        });

                        resolve()
                    },
                    onError: (error) => reject(error),
                });
            }),
            {
                loading: 'Waiting...',
                success: 'Post deleted successfully',
                error: (err: any) => `Failed to delete post`,
            }
        );
    }


    return (
        <main>
            <div className='max-w-[856px] mx-auto my-10 lg:mt-32 px-4 w-full lg:px-0'>
                <Link
                    to="/"
                    className=" py-1 text-gray-600 font-semibold text-sm hover:opacity-55 flex flex-row mb-4  w-fit"
                >
                    <img
                        src={Arrow}
                        alt="Arrow Right"
                        width={20}
                        height={20}
                    />
                    <span className="ml-1">  Back to Posts</span>


                </Link>
                <h1 className="text-6xl font-medium text-gray-900 mb-6">Posts</h1>
                <div className='flex justify-between items-center mb-4 text-gray-600'>
                    <p><span>All Posts</span>    <span className='font-medium'>• {postsQuery.data?.pagination.totalCount || 0} Posts</span></p>
                </div>
                <div className='rounded-xl bg-white  mt-4 '>
                    {/* <div className="overflow-x-auto"> */}
                    <div className="flex ">
                        <ul
                            className="grid gap-[23px] grid-cols-[repeat(auto-fit,minmax(270px,1fr))]"
                        >
                            {posts.map((post) => {
                                return (
                                    <PostCard key={post.id} {...post} handleDeletePost={handleDeletePost} />
                                )
                            })}
                        </ul>
                        <hr />
                        <Outlet />
                    </div>
                </div>
                {/* </div> */}
                <div className='flex justify-end items-end mt-6'>

                    <Pagination
                        currentPage={currentPage}
                        totalCount={postsQuery.data?.pagination.totalCount || 0}
                        pageSize={pageSize}
                        onPageChange={page => setCurrentPage(page)}
                    />
                </div>
            </div>
        </main >
    )
}
