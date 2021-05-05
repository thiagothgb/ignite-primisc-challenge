import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
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
import Comments from '../../components/Comments';
import PreviewButton from '../../components/PreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  prevpost?: Post;
  nextpost?: Post;
  preview: boolean;
}

export default function Post({ post, prevpost, nextpost, preview }: PostProps) {
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
          {post.last_publication_date && (
            <i className={styles.edited}>
              {format(
                new Date(post.last_publication_date),
                "'* editado em 'dd MMM yyyy', às 'HH:mm",
                {
                  locale: ptBR,
                }
              )}
            </i>
          )}
          <article className={styles.article}>
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

        <div className={`${commonStyles.container} ${styles.postActions}`}>
          <hr />
          <div>
            <aside>
              {prevpost && (
                <>
                  <span>{prevpost.data.title}</span>
                  <b>
                    <Link href={`/post/${prevpost.uid}`}>
                      <a>Post anterior </a>
                    </Link>
                  </b>
                </>
              )}
            </aside>
            <aside>
              {nextpost && (
                <>
                  <span>{nextpost.data.title}</span>
                  <b>
                    <Link href={`/post/${nextpost.uid}`}>
                      <a>Próximo post </a>
                    </Link>
                  </b>
                </>
              )}
            </aside>
          </div>
          <Comments />
          {preview && <PreviewButton />}
        </div>
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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(params.slug), {
    ref: previewData?.ref ?? null,
  });

  const prevpost = (
    await prismic.query(Prismic.Predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    })
  ).results[0];

  const nextpost = (
    await prismic.query(Prismic.Predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  const { first_publication_date, last_publication_date, data, uid } = response;

  const { title, subtitle, author, banner, content } = data;

  const contentFormatted = content.map(item => {
    return {
      heading: item.heading,
      body: item.body,
    };
  });

  return {
    props: {
      preview,
      post: {
        uid,
        first_publication_date,
        last_publication_date,
        data: {
          title,
          subtitle,
          banner,
          author,
          content: contentFormatted,
        },
      } as Post,
      prevpost: prevpost ? (prevpost as Post) : null,
      nextpost: nextpost ? (nextpost as Post) : null,
    },
  };
};
