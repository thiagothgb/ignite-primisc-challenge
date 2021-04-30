import Link from 'next/link';
import styles from './header.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a className={styles.container}>
          <img src="/images/logo.png" alt="logo" />
        </a>
      </Link>
    </header>
  );
}

export default Header;
