import MobileCardHeader from "../card-universal-components/card-header";
import styles from "./start-scouting.module.css";

export default function MobileStartScoutingCard() {
   return (
      <div className={styles.container}>
         <MobileCardHeader titleText="Start Scouting" tooltipText="Choose a scouting mode from the options below"/>
      </div>
   );
}