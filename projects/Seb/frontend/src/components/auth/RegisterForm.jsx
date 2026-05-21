import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import style from './styles/RegisterForm.module.css';

const MIN_AGE = 18;
const MAX_AGE = 80;

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        passwordRepeat: '',
        dob: '',
        email: '',
        termsAccepted: false
    });

    const [localError, setLocalError] = useState(null);
    const { register, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        clearError?.();

        if (
            !formData.username ||
            !formData.password ||
            !formData.passwordRepeat ||
            !formData.dob ||
            !formData.email
        ) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.passwordRepeat) {
            setLocalError('Passwords do not match');
            return;
        }

        const age = calculateAge(formData.dob);

        if (age < MIN_AGE) {
            setLocalError('You must be at least 18 years old');
            return;
        }

        if (age > MAX_AGE) {
            setLocalError('Please enter a valid date of birth');
            return;
        }

        if (!formData.termsAccepted) {
            setLocalError('You must accept the terms and conditions');
            return;
        }

        try {
            await register({
                username: formData.username,
                password: formData.password,
                age,
                email: formData.email,
                userType: 'registered'
            });

            navigate('/');
        } catch (err) {
            setLocalError(err.message || 'Registration failed');
        }
    };

    const handleDismissError = () => {
        setLocalError(null);
        clearError?.();
    };

    const displayError = localError || error;

    const maxDate = new Date(
        new Date().getFullYear() - MIN_AGE,
        new Date().getMonth(),
        new Date().getDate()
    )
        .toISOString()
        .split('T')[0];

    const minDate = new Date(
        new Date().getFullYear() - MAX_AGE,
        new Date().getMonth(),
        new Date().getDate()
    )
        .toISOString()
        .split('T')[0];

    return (
        <form className={style['register-form']} onSubmit={handleSubmit}>
            <h2 className={style['form-title']}>Register</h2>

            {displayError && (
                <ErrorMessage
                    message={displayError}
                    onDismiss={handleDismissError}
                />
            )}

            <div className={style['form-group']}>
                <label htmlFor='username' className={style['form-label']}>
                    Username
                </label>
                <input
                    id='username'
                    type='text'
                    name='username'
                    className={style['form-input']}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder='Choose a username'
                    disabled={loading}
                />
            </div>

            <div className={style['form-group']}>
                <label htmlFor='email' className={style['form-label']}>
                    Email
                </label>
                <input
                    id='email'
                    type='email'
                    name='email'
                    className={style['form-input']}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Enter your email'
                    disabled={loading}
                />
            </div>

            <div className={style['form-group']}>
                <label htmlFor='dob' className={style['form-label']}>
                    Date of Birth
                </label>
                <input
                    id='dob'
                    type='date'
                    name='dob'
                    className={style['form-input']}
                    value={formData.dob}
                    onChange={handleChange}
                    min={minDate}
                    max={maxDate}
                    disabled={loading}
                />
            </div>

            <div className={style['form-group']}>
                <label htmlFor='password' className={style['form-label']}>
                    Password
                </label>
                <input
                    id='password'
                    type='password'
                    name='password'
                    className={style['form-input']}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='Create a password'
                    disabled={loading}
                />
            </div>

            <div className={style['form-group']}>
                <label htmlFor='passwordRepeat' className={style['form-label']}>
                    Confirm Password
                </label>
                <input
                    id='passwordRepeat'
                    type='password'
                    name='passwordRepeat'
                    className={style['form-input']}
                    value={formData.passwordRepeat}
                    onChange={handleChange}
                    placeholder='Repeat your password'
                    disabled={loading}
                />
            </div>

            <div className={style['form-group']}>
                <input
                    id='termsAccepted'
                    type='checkbox'
                    name='termsAccepted'
                    className={style['form-checkbox']}
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    disabled={loading}
                />
                <label htmlFor='termsAccepted' className={style['form-label']}>
                    I agree to the{' '}
                    <Link to='/terms' className={style['form-link']}>
                        Terms and Conditions
                    </Link>
                </label>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <button type='submit' className={style['form-submit']}>
                    Register
                </button>
            )}

            <p className={style['form-footer']}>
                Already have an account?{' '}
                <Link to='/login' className={style['form-link']}>
                    Login here
                </Link>
            </p>
        </form>
    );
}