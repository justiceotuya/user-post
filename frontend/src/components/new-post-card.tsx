import AddCircle from '@/assets/svg/add-circle.svg';
import { Link } from '@tanstack/react-router';

const NewPostCard = ({ userId }: { userId: string }) => {
    return (
        <Link to="/users/$userId/posts/new" params={{ userId }} className=' rounded-lg p-6  bg-white border-dashed border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex h-full w-full
        items-center justify-center hover:cursor-pointer'>
            <div className='flex flex-col items-center  '>
                <img
                    src={AddCircle}
                    alt="New Post"
                    width={24}
                    height={24}
                    className='mb-1.5'
                />
                <p className='text-gray-500 text-sm'>New Post</p>
            </div>
        </Link>
    )
}

export default NewPostCard
