import React, { useEffect, useState } from 'react';

import { loadFirebase, postKey } from '../utils/firebase';
import config from '../website-config';
import { HeartIcon } from './PostLike';

// Like / comment counts for a post card; each one shows only when above zero.
export const PostStats: React.FC<{ slug: string }> = ({ slug }) => {
  const [counts, setCounts] = useState({ likes: 0, comments: 0 });

  useEffect(() => {
    if (!config.firebase) {
      return;
    }
    let cancelled = false;
    loadFirebase().then(async ({ firestore, db }) => {
      const count = async (sub: 'likes' | 'comments') =>
        (await firestore.getCountFromServer(firestore.collection(db, 'posts', postKey(slug), sub))).data().count;
      const [likes, comments] = await Promise.all([count('likes'), count('comments')]);
      if (!cancelled) {
        setCounts({ likes, comments });
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      {counts.likes > 0 && (
        <>
          <span>&middot;</span>
          <span className="post-card-stat" aria-label={`좋아요 ${counts.likes}개`}>
            <HeartIcon /> {counts.likes}
          </span>
        </>
      )}
      {counts.comments > 0 && (
        <>
          <span>&middot;</span>
          <span className="post-card-stat" aria-label={`댓글 ${counts.comments}개`}>
            <CommentIcon /> {counts.comments}
          </span>
        </>
      )}
    </>
  );
};

const CommentIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      d="M4 5.5h16v10H9l-5 4v-14z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);
