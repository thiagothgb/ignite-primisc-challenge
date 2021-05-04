import { GetStaticProps } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [next_page, setNextPage] = useState<string | undefined>(
    postsPagination.next_page || undefined
  );
  const [posts, setPosts] = useState<Post[]>(postsPagination.results || []);
  const [loadingMore, setLoadingMore] = useState(false);

  async function handleOnLoadMorePosts(): Promise<void> {
    try {
      setLoadingMore(true);
      await fetch(next_page, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
      })
        .then(res => res.json())
        .then(data => {
          setNextPage(data.next_page);

          const newPosts = data.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: post.first_publication_date,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          });

          setPosts(current => [...current, ...newPosts]);
        });
    } catch (error) {
      console.log(error);
      window.alert('Não foi possível carregar mais posts');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <Head>
        <title>Space traveling</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        {posts.map(post => {
          return (
            <div className={styles.post} key={post.uid}>
              <Link key={post.uid} href={`post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                </a>
              </Link>
              <p>{post.data.subtitle}</p>
              <div className={styles.postInfo}>
                <time>
                  <AiOutlineCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd LLL yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </div>
          );
        })}
        {next_page && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={handleOnLoadMorePosts}
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais posts'}
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts || [],
      },
    },
  };
};
