import * as yup from "yup";

import { Modal } from './modal'
import { Route as UsersPost } from '@/routes/users_.$userId.posts'
import { queryClient } from '@/router';
import toast from 'react-hot-toast';
import { useCreatePostMutation } from '@/utils/posts';
import { useForm } from "react-hook-form";
import { useNavigate } from '@tanstack/react-router'
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
    postTitle: yup.string().trim().min(10, 'Post content Must be 10 characters or more').max(100, 'Post content Must be 100 characters or less').required('Post title is required'),
    postContent: yup.string().trim().min(10, 'Post content Must be 10 characters or more').max(1000, 'Post content Must be 1000 characters or less').required('Post content is required'),
}).required('All fields are required');

export function NewPostModal() {
    const navigate = useNavigate()
    const params = UsersPost.useParams()
    const userId = params.userId as string

        const { mutate: createPost } = useCreatePostMutation()

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            postTitle: '',
            postContent: '',
        },

    });

    const onSubmit = (data : {postTitle: string, postContent: string}) => {
        const postData = {
            title: data.postTitle,
            body: data.postContent,
            user_id:userId,
        }

        toast.promise(
            new Promise<void>((resolve, reject) => {
                createPost(postData, {
                    onSuccess: () => {
                        //invalidate the posts query to refetch the posts
                        queryClient.invalidateQueries({
                            queryKey: ['posts']
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['posts', userId]
                        });

                        resolve()
                          navigate({
                                to: UsersPost.to,
                                params: { userId },
                            })
                    },
                    onError: (error) => reject(error),
                });
            }),
            {
                loading: 'Creating post...',
                success: 'Post Created successfully',
                error: (err: any) => `Failed to create post`,
            }
        );
    }



    return (
        <Modal
            onOpenChange={(open) => {
                if (!open) {
                    navigate({
                        to: UsersPost.to,
                        params: { userId },
                    })
                }
            }}
        >
            <div className="bg-gray-100   rounded-lg w-[95vw] max-w-[697px] p-6 shadow-2xl">
                <p className='text-gray-900 text-4xl font-medium mb-6'>New Post</p>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="flex flex-col">
                        <label htmlFor="postContent" className="text-gray-600 text-lg font-medium mb-2.5">Post Title</label>
                        <input defaultValue="test" {...register("postTitle")} className='border border-gray-200 rounded-md p-2 h-10 text-sm px-4' />
                        {errors.postTitle?.message && <p className="text-red-500 text-xs mt-1">{errors.postTitle.message}</p>}
                    </div>


                    <div className="flex flex-col">
                        <label htmlFor="postContent" className="text-gray-600 text-lg font-medium mb-2.5">Post Content</label>
                        <textarea {...register("postContent")} className='border border-gray-200 rounded-md p-2 h-[179px] text-sm px-4'></textarea>
                        {/* errors will return when field validation fails  */}
                        {errors.postContent?.message && <p className="text-red-500 text-xs mt-1">{errors.postContent.message}</p>}
                    </div>

                    <div className='flex justify-end gap-2 mt-4'>

                        <button type="button" className='border border-gray-200 h-10 px-4 rounded-sm text-sm' onClick={() => {
                            navigate({
                                to: UsersPost.to,
                                params: { userId },
                            })
                        }}>Cancel</button>
                        <button type="submit" className='border border-gray-700 h-10 px-4 rounded-sm text-sm bg-gray-700 text-white'>Publish</button>
                    </div>

                </form>
            </div>
        </Modal>
    )
}
