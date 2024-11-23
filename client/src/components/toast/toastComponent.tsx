import { AnimatePresence, motion } from "motion/react";
import styles from "./toast.module.css";

const Notification = (
   { type, message, isVisible }: {
      type: string;
      message: string;
      isVisible: boolean;
   },
) => {
   return (
      <div id={styles.notificationRoot}>
         <AnimatePresence>
            {isVisible && (
               <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  id={styles.notificationContainer}
                  className={type}
               >
                  <div id={styles.notificationIcon} className={styles[type]}>
                     {type == "success"
                        ? <i className="fa-regular fa-circle-check" />
                        : type == "error"
                        ? <i className="fa-regular fa-circle-xmark" />
                        : type == "info"
                        ? <i className="fa-solid fa-circle-info" />
                        : type == "undo"
                        ? <i className="fa-solid fa-rotate-left" />
                        : <i className="fa-regular fa-message" />}
                  </div>
                  <div
                     id={styles.notificationSeperator}
                     className={styles[type]}
                  />
                  <div id={styles.notificationMessage} className={styles[type]}>
                     {message}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default Notification;
