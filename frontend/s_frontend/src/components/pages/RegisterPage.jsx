import RegisterForm from '../auth/RegisterForm';
import style from './styles/RegisterPage.module.css';

export default function RegisterPage() {
  return (
    <div className={style["register-page"]}>
      <RegisterForm />
    </div>
  );
}