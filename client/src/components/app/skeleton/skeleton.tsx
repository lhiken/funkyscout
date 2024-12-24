import styles from "./skeleton.module.css";

export default function Skeleton({ style }: { style: React.CSSProperties }) {
   return <div className={styles.skeleton} style={style} />;
}
