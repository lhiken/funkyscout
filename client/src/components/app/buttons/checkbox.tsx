import { Dispatch } from "react";
import styles from "./styles.module.css";

function Checkbox({
   enabled,
   setEnabled,
}: { enabled: boolean; setEnabled?: Dispatch<boolean> }) {
   return (
      <div
         className={`${styles.checkbox} ${enabled ? styles.active : styles.inactive}`}
         onClick={() => setEnabled && setEnabled(!enabled)}
      />
   );
}

export default Checkbox;
