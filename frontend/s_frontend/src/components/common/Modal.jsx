import style from './styles/Modal.module.css';

export default function Modal({ isOpen, title = 'DUMMY TITLE', children, onClose, onConfirm, confirmText = 'Confirm' }) {
    if (!isOpen) return null;

    return(
        <div className={style['modal-overlay']} onClick={onClose}>
            <div className={style['modal-content']} onClick={(e) => e.stopPropagation()}>
                <div className={style['modal-header']}>
                    <h2 className={style['modal-title']}>{title}</h2>
                    <button className={style['modal-close']} onClick={onClose}>X</button>
                </div>

                <div className={style['modal-body']}>
                    {children}
                </div>

                <div className={style['modal-footer']}>
                    <button className={style['modal-btn', 'modal-btn-cancel']} onClick={onClose}>
                        Cancel
                    </button>
                    {onConfirm && (
                        <button className={style['modal-btn', 'modal-btn-confirm']} onConfirm={onConfirm}>
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 