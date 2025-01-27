import Tippy from '@tippyjs/react'
import styles from './card-header.module.css'

export default function MobileCardHeader ({
   titleText,
   tooltipText
}: {
   titleText: string,
   tooltipText?: string
}) {
   return (
      <div className={styles.header}>
         {titleText}
         {tooltipText && 
            <div style={{color: "var(--text-background)", fontSize: "1.25rem", lineHeight: "1.25rem"}}>
               <Tippy content={tooltipText}>
                  <i className="fa-solid fa-book"/>
               </Tippy>
            </div>
         }
      </div>
   )
}