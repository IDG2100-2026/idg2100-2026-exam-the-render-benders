import style from './styles/Pagination.module.css';

export default function Pagination({ limit, offset, total, onLimitChange, onOffsetChange }){
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit ) + 1;

    const handlePrevious = () => {
        if (offset >= limit) {
            onOffsetChange(offset - limit);
        }
    };

    const handleNext = () => {
        if (offset + limit < total) {
            onOffsetChange(offset + limit);
        }
    };

    return(
        <div className={style['pagination']}>
            <div className={style['pagination-info']}>
                <span className={style['pagination-text']}>
                    Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
                </span>
            </div>

            <div className={style['pagination-controls']}>
                <button className={style['pagination-btn']} onClick={handlePrevious} disabled={offset === 0}>
                     &lt;- Previous
                </button>
                <span className={style['pagination-page']}>
                    Page {currentPage} of {totalPages}
                </span>

                <button className={style['pagination-btn']} onClick={handleNext} disabled={offset + limit >= total}>
                    Next -&gt;
                </button>
            </div>

            <div className={style['pagination-limit']}>
                <label htmlFor='limit'>Items per page:</label>
                <select id='limit' value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className={style['pagination-select']}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
} 