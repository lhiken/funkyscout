import Tippy from "@tippyjs/react";
import styles from "./card-header.module.css";

export default function MobileCardHeader({
   titleText,
   tooltipText,
}: {
   titleText: string;
   tooltipText?: string;
}) {
   return (
      <div className={styles.header}>
         {titleText}
         {tooltipText &&
            (
               <Tippy content={tooltipText}>
                  <div
                     style={{
                        color: "var(--text-background)",
                        fontSize: "1.25rem",
                        lineHeight: "1.25rem",
                     }}
                  >
                     <i className="fa-solid fa-book" />
                  </div>
               </Tippy>
            )}
      </div>
   );
}
