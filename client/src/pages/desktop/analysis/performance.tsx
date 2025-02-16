import styles from "./styles.module.css";

function PerformancePage() {
    return (
        <div className={styles.container}>
        <div className={styles.header}>
            <div>
               &nbsp;Overall Performance &nbsp;<i className="fa-duotone fa-solid fa-caret-down"></i>
            </div>
        </div>
        <div className={styles.box}>
        <div className={styles.textBox}>
            <div className={styles.text}>
                &nbsp; Best EPA
            </div>
            <div className={styles.text}>
                &nbsp; Best Telop
            </div>
            <div className={styles.text}>
                &nbsp; Best Auto
            </div>
            <div className={styles.text}>
                &nbsp; Best Defense
            </div>   
            <div>

            </div>
        </div>
        <div className={styles.sub}>
            <div>

            </div>
            <div>
                Team 846 &nbsp;<i className="fa-duotone fa-solid fa-caret-down"></i>
            </div>
            <div>
                Team 971 &nbsp;<i className="fa-duotone fa-solid fa-caret-down"></i>
            </div>
            <div>
                Team 649 &nbsp;<i className="fa-duotone fa-solid fa-caret-down"></i>
            </div>
            <div>
                Team 1690 &nbsp;<i className="fa-duotone fa-solid fa-caret-down"></i>
            </div>

        </div>
        </div>

        <div className={styles.box1}>
        <div className={styles.header}>
            &nbsp; Performance by Metric
        </div>
        <div className={styles.container}>
            
        </div>
        </div>
        </div>
        
        
    )
}

export default PerformancePage;