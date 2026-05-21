import style from "./styles/spinner.module.css";
import spinner from "@/assets/spinner.svg";

export default function LoadingSpinner(){
    return(
        <div>
            <p className={style["spinner"]}>
                <img className={style["spinner-image"]} src={spinner} alt="Loading spinner"/>
            </p>
        </div>
    );
} 