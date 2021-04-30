import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import { BiTimeFive } from 'react-icons/bi';
import { format } from 'date-fns';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  return (
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
          {post.data.content.map(item => {
            return (
              <>
                <h2>{item.heading}</h2>
                {item.body.map(body => {
                  return (
                    <div
                      className={styles.postContent}
                      dangerouslySetInnerHTML={{ __html: body.text }}
                    />
                  );
                })}
              </>
            );
          })}
        </article>
      </section>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 1,
    }
  );

  const paths = posts.results.map(post => `/post/${post.uid}`) || [];

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
  const { first_publication_date, data } = response;

  const { title, author, banner, content } = data;

  const contentFormatted = content.map(item => {
    return {
      heading: item.heading,
      body: RichText.asHtml(item.body),
    };
  });

  return {
    props: {
      post: {
        first_publication_date,
        data: {
          title,
          banner,
          author,
          content: contentFormatted,
        },
      },
    },
  };
};
