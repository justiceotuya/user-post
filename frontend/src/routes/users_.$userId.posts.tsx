import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import Arrow from '@/assets/svg/arrow.svg';
import LoadingComponent from '@/components/loading-component'
import NewPostCard from '@/components/new-post-card';
import { NotFound } from '@/components/not-found';
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card';
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { userPostsQueryOptions } from '@/utils/posts'

const pageSize = 10
export const Route = createFileRoute('/users_/$userId/posts')({
    loader: async ({ context, params: { userId } }) => {
        await context.queryClient.ensureQueryData(userPostsQueryOptions({
            currentPage: 1,
            pageSize,
            userId,
        }))
    },
    head: () => ({
        meta: [{ title: 'Users Posts' }],
    }),
    component: UserPostsComponent,
    pendingComponent: () => <LoadingComponent title="Users Posts" />,
    notFoundComponent: () => {
        return <NotFound>User not found</NotFound>
    },
})

function UserPostsComponent() {
    const params = Route.useParams()
    const userId = params.userId as string

    const [currentPage, setCurrentPage] = useState(1);

    const postsQuery = useSuspenseQuery(userPostsQueryOptions({
        currentPage,
        pageSize,
        userId,
    }))

    const posts = postsQuery.data?.data.posts
    const user = postsQuery.data?.data.user
    const email = postsQuery.data?.data.email


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
                    <span className="ml-1">  Back to Users</span>


                </Link>
                <h1 className="text-4xl font-medium text-gray-900 mb-6">{user}</h1>
                <div className='flex justify-between items-center mb-4 text-gray-600'>
                    <p><span>{email.toLowerCase()}</span>    <span className='font-medium'>• {postsQuery.data?.pagination.totalCount || 0} Posts</span></p>
                </div>
                <div className='rounded-xl bg-white  mt-4 '>
                    {/* <div className="overflow-x-auto"> */}
                    <div className="flex ">
                        <ul
                            className="grid gap-[23px] grid-cols-[repeat(auto-fit,minmax(270px,1fr))]"
                        >
                            <NewPostCard />
                            {posts.map((post) => {
                                return (
                                    <PostCard key={post.id} {...post} />
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
