import styles from "./card.module.css";

function InfoCard({
   title,
   contents,
   icon,
}: {
   title: string;
   contents: {
      title: string;
      content: string;
   }[];
   icon: JSX.Element;
}) {
   return (
      <div
         className={`${styles.teamCard} ${
            title == "Team Record" && styles.hide
         }`}
      >
         <div className={styles.cardHeader}>
            {title}{" "}
            <div className={styles.icon}>
               {icon}
            </div>
         </div>
         <div className={styles.cardContent}>
            <div className={styles.cardValue}>
               <div style={{ color: "var(--text-secondary)" }}>
                  {contents[0].title}
               </div>
               <div style={{ fontSize: "1.2rem" }}>
                  {contents[0].content}
               </div>
            </div>
            <div
               className={styles.cardValue}
            >
               <div
                  style={{
                     color: "var(--text-secondary)",
                  }}
               >
                  {contents[1].title}
               </div>
               <div style={{ fontSize: "1.2rem" }}>
                  {contents[1].content}
               </div>
            </div>
            <div
               className={styles.cardValue}
               style={{ width: "unset" }}
            >
               <div style={{ color: "var(--text-secondary)" }}>
                  {contents[2].title}
               </div>
               <div style={{ fontSize: "1.2rem" }}>
                  {contents[2].content}
               </div>
            </div>
         </div>
      </div>
   );
}

export default InfoCard;
