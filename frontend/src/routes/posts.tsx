import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import Arrow from '@/assets/svg/arrow.svg';
import LoadingComponent from '@/components/loading-component'
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card';
import { postsQueryOptions } from '@/utils/posts'
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

function PostsComponent() {
    const [currentPage, setCurrentPage] = useState(1);

    const postsQuery = useSuspenseQuery(postsQueryOptions({
        currentPage,
        pageSize
    }))

    const posts = postsQuery.data?.data


    return (
        <main>
            <div className='max-w-[856px] mx-auto my-10 lg:mt-32 px-4 w-full lg:px-0'>
                <Link
                    to="/"
                    className=" py-1 text-gray-600 font-semibold text-sm hover:opacity-55 flex flex-row mb-4"
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
                <div className='rounded-xl bg-white  mt-4 '>
                    {/* <div className="overflow-x-auto"> */}
                    <div className="flex ">
                        <ul
                            className="grid gap-[23px]"
                            style={{
                                gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                            }}
                        // className='flex flex-col gap-4 w-full'
                        >
                            {posts.map((post) => {
                                return (
                                    // <li key={post.id} className="whitespace-nowrap">
                                    //     <Link
                                    //         to="/posts/$postId"
                                    //         params={{
                                    //             postId: post.id,
                                    //         }}
                                    //         className="block py-1 text-blue-800 hover:text-blue-600"
                                    //         activeProps={{ className: 'text-black font-bold' }}
                                    //     >
                                    //         <div>{post.title.substring(0, 20)}</div>
                                    //     </Link>
                                    // </li>
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
        </main>
    )
}
