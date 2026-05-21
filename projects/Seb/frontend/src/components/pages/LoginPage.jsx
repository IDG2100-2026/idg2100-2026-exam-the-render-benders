import LoginForm from '../auth/LoginForm';
import style from './styles/LoginPage.module.css';

export default function LoginPage() {
  return (
    <div className={style["login-page"]}>
      <LoginForm/>
    </div>
  );
}