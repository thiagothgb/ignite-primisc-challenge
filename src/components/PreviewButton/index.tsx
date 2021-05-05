import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';

const PreviewButton: React.FC = () => {
  return (
    <aside className={commonStyles.previewButton}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
};

export default PreviewButton;
