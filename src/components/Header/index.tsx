import styles from './header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <img src="/images/Vector.png" alt="" />
        <img src="/images/spacetraveling.png" alt="Spacetraveling" />
        <img src="/images/dot.png" alt="" />
      </div>
    </header>
  );
}
