import style from './styles/ErrorMessage.module.css';

export default function ErrorMessage({ message, onDismiss }){
    return(
        <div className={style['error-message']}>
            <div className={style['error-content']}>
                <p className={style['error-text']}>{message}</p>
            </div>
            {onDismiss && (
                <button type='button' className={style['error-close']} onClick={onDismiss}>X</button>
            )}
        </div>
    );
} 