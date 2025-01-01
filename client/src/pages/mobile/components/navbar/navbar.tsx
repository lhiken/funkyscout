import styles from './navbar.module.css'
import { useLocation } from "wouter";

export default function MobileNavbar() {
    const [location, setLoation] = useLocation();

    return (
        <div className={styles.container}>
            navbar navbar navbar
        </div>
    )
}