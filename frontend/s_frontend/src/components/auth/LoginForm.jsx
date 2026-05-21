import style from './styles/LoginForm.module.css';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);

    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        clearError?.();

        if (!username || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setLocalError(err.message || 'Login failed');
        }
    };

    const handleDismissError = () => {
        setLocalError(null);
        clearError?.();
    };

    const handleForgotPassword = () => {
        setLocalError('Password reset is not implemented in this sprint.');
    };

    const displayError = localError || error;

    return (
        <form className={style['login-form']} onSubmit={handleSubmit}>
            <h2 className={style['form-title']}>Login</h2>

            {displayError && (
                <ErrorMessage message={displayError} onDismiss={handleDismissError}/>
            )}

            <div className={style['form-group']}>
                <label htmlFor='username' className={style['form-label']}>
                    Username
                </label>
                <input
                    id='username'
                    type='text'
                    className={style['form-input']}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Enter your username'
                    disabled={loading}
                />
            </div>

            <div className={style['form-group']}>
                <label htmlFor='password' className={style['form-label']}>
                    Password
                </label>
                <input id='password' type='password' className={style['form-input']} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' disabled={loading}/>
            </div>

            <button type='button' className={style['forgot-password']} onClick={handleForgotPassword} disabled={loading}>
                Forgot password?
            </button>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <button type='submit' className={style['form-submit']}>
                    Login
                </button>
            )}

            <p className={style['form-footer']}>
                Don't have an account?{' '}
                <Link to='/register' className={style['form-link']}>
                    Register here
                </Link>
            </p>
        </form>
    );
}