import { useEffect, useState } from "react";
import styles from "./setup.module.css";
import initializeMobileCache from "../../../../lib/mobile-cache-handler/init";
import throwNotification from "../../../../components/app/toast/toast";
import { useLocation } from "wouter";

export default function MobileSetupPage() {
   const [loadingProgress, setLoadingProgress] = useState(
      "Initializing database...",
   );
   const [, navigate] = useLocation();

   useEffect(() => {
      const timeout = setTimeout(() => {
         throwNotification("error", "Try again later...");
         navigate("/");
      }, 30000);

      initializeMobileCache(setLoadingProgress).then(() => {
         clearTimeout(timeout);
         navigate("/");
      });

      return () => clearTimeout(timeout);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            Setting things up...
         </div>
         <div className="loader loader--style3" title="2">
            <svg
               className={styles.svgLoader}
               version="1.1"
               id="loader-1"
               xmlns="http://www.w3.org/2000/svg"
               x="0px"
               y="0px"
               width="40px"
               height="40px"
               viewBox="0 0 50 50"
            >
               <path
                  className={styles.svgLoader}
                  fill="#000"
                  d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
               >
                  <animateTransform
                     attributeType="xml"
                     attributeName="transform"
                     type="rotate"
                     from="0 25 25"
                     to="360 25 25"
                     dur="2s"
                     repeatCount="indefinite"
                  />
               </path>
            </svg>
         </div>
         <div className={styles.progressText}>
            {loadingProgress}
         </div>
      </div>
   );
}
