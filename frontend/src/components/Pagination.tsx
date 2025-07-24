import { DOTS, usePagination } from '@/hooks/usePagination';

import Arrow from '@/assets/svg/arrow.svg';
import classnames from 'classnames';

export type PaginationProps = {
    onPageChange: (page: number) => void;
    totalCount: number;
    siblingCount?: number;
    currentPage: number;
    pageSize: number;
};


const Pagination = (props: PaginationProps) => {
    const {
        onPageChange,
        totalCount,
        siblingCount = 1,
        currentPage,
        pageSize,
    } = props;

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    });

    if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
        return null;
    }

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    let lastPage = paginationRange && paginationRange[paginationRange.length - 1];

    return (
        <ul
            className="flex flex-row items-center justify-center gap-2 flex-wrap "
            data-testid="pagination"
        >
            <button
                className={classnames('flex flex-row gap-2 text-gray-600 items-center font-semibold text-sm mr-[10px] lg:mr-[42px] cursor-pointer disabled:opacity-40')}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                type="button"
                onClick={onPrevious}
            >

                <img
                    src={Arrow}
                    alt="Arrow Left"
                    width={20}
                    height={20}
                />
                <span className="">Previous</span>
            </button>
            {paginationRange && paginationRange.map(pageNumber => {
                if (pageNumber === DOTS) {
                    return <li className="w-10 h-10 flex items-center justify-center " key={pageNumber}>&#8230;</li>;
                }

                return (
                    <button
                        key={pageNumber}
                        className={classnames('w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 font-medium cursor-pointer hover:bg-gray-100 ', {
                            "text-[#7F56D9] bg-[#F9F5FF]": pageNumber === currentPage
                        })}
                        onClick={() => onPageChange(pageNumber as number)}
                    >
                        {pageNumber}
                    </button>
                );
            })}


            <button
                className={classnames('flex flex-row gap-2 text-gray-600 items-center font-semibold text-sm ml-[10px] lg:ml-[42px]  cursor-pointer disabled:opacity-40')}
                disabled={currentPage === lastPage}
                aria-label="Previous Page"
                type="button"
                onClick={onNext}
            >
                <span className="">Next</span>

                <img
                    src={Arrow}
                    alt="Arrow Right"
                    width={20}
                    height={20}
                    className='transform rotate-180'
                />
            </button>
        </ul>
    );
};

export default Pagination;
