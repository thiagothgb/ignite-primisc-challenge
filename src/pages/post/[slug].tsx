import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import { BiTimeFive } from 'react-icons/bi';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <Header />
        <main>
          <div>Carregando...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <header className={styles.header}>
          <img src={post.data.banner.url} alt="Banner" />
        </header>
        <section className={`${commonStyles.container} ${styles.container}`}>
          <h1>{post.data.title}</h1>
          <div>
            <time>
              <AiOutlineCalendar />
              {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <BiTimeFive />4 min
            </span>
          </div>
          <article>
            {post.data.content.map((item, index) => {
              return (
                <section key={`${item.heading}-${String(index)}`}>
                  <h2>{item.heading}</h2>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(item.body),
                    }}
                  />
                </section>
              );
            })}
          </article>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 20,
    }
  );

  const paths =
    posts.results.map(post => ({ params: { slug: post.uid } })) || [];

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );
  const { first_publication_date, data, uid } = response;

  const { title, subtitle, author, banner, content } = data;

  const contentFormatted = content.map(item => {
    return {
      heading: item.heading,
      body: item.body,
    };
  });

  return {
    props: {
      post: {
        uid,
        first_publication_date,
        data: {
          title,
          subtitle,
          banner,
          author,
          content: contentFormatted,
        },
      } as Post,
    },
  };
};
