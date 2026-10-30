import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';

import { colors } from '../styles/colors';
import { loadFirebase, postKey } from '../utils/firebase';

import type { User } from 'firebase/auth';

// Likes need no login: the first click signs the browser in anonymously, so
// each browser holds one like per post (posts/{post}/likes/{uid}).
export const PostLike: React.FC<{ slug: string }> = ({ slug }) => {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubAuth = () => {};

    loadFirebase().then(({ auth, firestore, authInstance, db }) => {
      if (cancelled) {
        return;
      }
      const likes = firestore.collection(db, 'posts', postKey(slug), 'likes');
      firestore.getCountFromServer(likes)
        .then(snapshot => !cancelled && setCount(snapshot.data().count))
        .catch(() => {});
      unsubAuth = auth.onAuthStateChanged(authInstance, async u => {
        setUser(u);
        if (!u) {
          setLiked(false);
          return;
        }
        try {
          const mine = await firestore.getDoc(firestore.doc(likes, u.uid));
          if (!cancelled) {
            setLiked(mine.exists());
          }
        } catch {
          // keep the button usable even if the lookup fails
        }
      });
    }).catch(() => {});

    return () => {
      cancelled = true;
      unsubAuth();
    };
  }, [slug]);

  const toggle = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const { auth, firestore, authInstance, db } = await loadFirebase();
      const uid = user?.uid ?? (await auth.signInAnonymously(authInstance)).user.uid;
      const ref = firestore.doc(db, 'posts', postKey(slug), 'likes', uid);
      if (liked) {
        await firestore.deleteDoc(ref);
        setLiked(false);
        setCount(c => Math.max(0, (c ?? 1) - 1));
      } else {
        await firestore.setDoc(ref, { createdAt: firestore.serverTimestamp() });
        setLiked(true);
        setCount(c => (c ?? 0) + 1);
      }
    } catch {
      // ignore; the state stays as it was
    } finally {
      setBusy(false);
    }
  };

  return (
    <LikeSection>
      <button
        type="button"
        className={liked ? 'liked' : undefined}
        aria-pressed={liked}
        aria-label={liked ? '좋아요 취소' : '좋아요'}
        disabled={busy}
        onClick={toggle}
      >
        <HeartIcon filled={liked} />
        {count !== null && count > 0 && <span>{count}</span>}
      </button>
    </LikeSection>
  );
};

export const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const LikeSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px auto 48px;
  max-width: 700px;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border: 1px solid ${colors.line};
    border-radius: 999px;
    background: none;
    color: ${colors.subtle};
    font: inherit;
    font-size: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  }

  button span {
    font-size: 1.5rem;
    font-variant-numeric: tabular-nums;
  }

  button:hover,
  button.liked {
    border-color: ${colors.pink};
    color: ${colors.pink};
  }

  button:active {
    transform: scale(0.94);
  }

  button:disabled {
    cursor: default;
  }

  @media (prefers-color-scheme: dark) {
    button {
      border-color: ${colors.darkLine};
      color: ${colors.darkSubtle};
    }

    button:hover,
    button.liked {
      border-color: ${colors.pink};
      color: ${colors.pink};
    }
  }
`;
