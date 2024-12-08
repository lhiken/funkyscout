import { Dispatch, SetStateAction } from "react";
import styles from "./styles.module.css";

function RoundInput({
   value,
   setValue,
   placeholder,
   type,
   style,
   cornerStyle,
   icon,
   iconActive,
}: {
   value: string;
   setValue: Dispatch<SetStateAction<string>>;
   placeholder: string;
   type: "password" | "text";
   style?: React.CSSProperties;
   cornerStyle?: "round" | "sharp";
   icon?: JSX.Element;
   iconActive?: boolean;
}) {
   return (
      <div className={styles.inputWrapper}>
         <input
            name={placeholder + "Input"}
            type={type}
            value={value}
            onChange={(input) => setValue(input.target.value)}
            className={`${styles.input} ${
               cornerStyle == "round" ? styles.round : styles.sharp
            }`}
            style={style}
            placeholder={placeholder}
            autoComplete="off"
         />
         <span
            className={`${styles.icon} ${
               iconActive ? styles.active : styles.inactive
            }`}
         >
            {icon}
         </span>
      </div>
   );
}

export default RoundInput;
