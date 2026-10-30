import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { colors } from '../styles/colors';
import config from '../website-config';

import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseModules {
  auth: typeof import('firebase/auth');
  firestore: typeof import('firebase/firestore');
  authInstance: Auth;
  db: Firestore;
}

interface Comment {
  id: string;
  uid: string;
  name: string;
  photoURL: string | null;
  // '' for secret comments; the text lives in posts/{post}/secrets/{id}
  body: string;
  parentId: string | null;
  secret: boolean;
  createdAt: Date | null;
}

const MAX_LENGTH = 2000;

// Firebase is loaded lazily in the browser only, so SSR never touches it.
const loadFirebase = async (): Promise<FirebaseModules> => {
  const [{ initializeApp, getApps }, auth, firestore] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  const { apiKey, authDomain, projectId, appId } = config.firebase!;
  const app = getApps()[0] ?? initializeApp({ apiKey, authDomain, projectId, appId });
  return { auth, firestore, authInstance: auth.getAuth(app), db: firestore.getFirestore(app) };
};

// "/kv-cache/" -> "kv-cache"; Firestore doc ids cannot contain "/".
const postKey = (slug: string) => slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '__') || 'index';

export const Comments: React.FC<{ slug: string }> = ({ slug }) => {
  const fb = useRef<FirebaseModules | null>(null);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [secretBodies, setSecretBodies] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean(user?.email && user.email === config.firebase?.adminEmail);

  useEffect(() => {
    let unsubAuth = () => {};
    let unsubComments = () => {};
    let cancelled = false;

    loadFirebase().then(modules => {
      if (cancelled) {
        return;
      }
      fb.current = modules;
      setReady(true);
      const { auth, firestore, authInstance, db } = modules;
      unsubAuth = auth.onAuthStateChanged(authInstance, setUser);
      unsubComments = firestore.onSnapshot(
        firestore.query(postRef(firestore, db, slug, 'comments'), firestore.orderBy('createdAt', 'asc')),
        snapshot => {
          setComments(snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              uid: data.uid,
              name: data.name,
              photoURL: data.photoURL ?? null,
              body: data.body,
              parentId: data.parentId ?? null,
              secret: data.secret === true,
              createdAt: data.createdAt?.toDate() ?? null,
            };
          }));
          setLoading(false);
        },
        () => {
          setError('댓글을 불러오지 못했어요.');
          setLoading(false);
        },
      );
    }).catch(() => {
      setError('댓글을 불러오지 못했어요.');
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubAuth();
      unsubComments();
    };
  }, [slug]);

  // Secret texts the current user may read: everything for the admin,
  // otherwise only the ones listing this user as a reader.
  useEffect(() => {
    if (!ready || !fb.current || !user) {
      setSecretBodies({});
      return;
    }
    const { firestore, db } = fb.current;
    const secrets = postRef(firestore, db, slug, 'secrets');
    return firestore.onSnapshot(
      isAdmin ? secrets : firestore.query(secrets, firestore.where('readers', 'array-contains', user.uid)),
      snapshot => {
        setSecretBodies(Object.fromEntries(snapshot.docs.map(doc => [doc.id, doc.data().body as string])));
      },
      () => setSecretBodies({}),
    );
  }, [ready, user, isAdmin, slug]);

  const signIn = async () => {
    if (!fb.current) {
      return;
    }
    const { auth, authInstance } = fb.current;
    setError(null);
    try {
      await auth.signInWithPopup(authInstance, new auth.GoogleAuthProvider());
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError('로그인에 실패했어요.');
      }
    }
  };

  const signOut = () => fb.current && fb.current.auth.signOut(fb.current.authInstance);

  // Writes the comment together with its secret text, the author's email and
  // a notifier queue entry; firestore.rules requires them in one batch.
  const submit = async (text: string, secret: boolean, parent: Comment | null) => {
    if (!fb.current || !user) {
      return false;
    }
    const { firestore, db } = fb.current;
    const key = postKey(slug);
    const ref = firestore.doc(postRef(firestore, db, slug, 'comments'));
    const batch = firestore.writeBatch(db);
    batch.set(ref, {
      uid: user.uid,
      name: user.displayName ?? '익명',
      photoURL: user.photoURL ?? null,
      body: secret ? '' : text,
      parentId: parent?.id ?? null,
      secret,
      createdAt: firestore.serverTimestamp(),
    });
    if (secret) {
      batch.set(firestore.doc(postRef(firestore, db, slug, 'secrets'), ref.id), {
        uid: user.uid,
        body: text,
        readers: parent && parent.uid !== user.uid ? [user.uid, parent.uid] : [user.uid],
      });
    }
    batch.set(firestore.doc(postRef(firestore, db, slug, 'emails'), ref.id), {
      uid: user.uid,
      email: user.email,
    });
    batch.set(firestore.doc(db, 'queue', `${key}__${ref.id}`), {
      post: key,
      comment: ref.id,
      slug,
      createdAt: firestore.serverTimestamp(),
    });

    setError(null);
    try {
      await batch.commit();
      return true;
    } catch {
      setError('댓글을 등록하지 못했어요.');
      return false;
    }
  };

  const remove = async (c: Comment) => {
    if (!fb.current) {
      return;
    }
    const { firestore, db } = fb.current;
    const batch = firestore.writeBatch(db);
    batch.delete(firestore.doc(postRef(firestore, db, slug, 'comments'), c.id));
    if (c.secret) {
      batch.delete(firestore.doc(postRef(firestore, db, slug, 'secrets'), c.id));
    }
    batch.delete(firestore.doc(postRef(firestore, db, slug, 'emails'), c.id));
    try {
      await batch.commit();
    } catch {
      setError('댓글을 삭제하지 못했어요.');
    }
  };

  // Threads in time order; replies whose parent was deleted hang under a placeholder.
  const ids = new Set(comments.map(c => c.id));
  const threads = [
    ...comments.filter(c => !c.parentId).map(c => ({ id: c.id, root: c as Comment | null, at: c.createdAt })),
    ...[...new Set(comments.filter(c => c.parentId && !ids.has(c.parentId)).map(c => c.parentId!))].map(id => ({
      id,
      root: null,
      at: comments.find(c => c.parentId === id)!.createdAt,
    })),
  ].sort((a, b) => (a.at?.getTime() ?? Infinity) - (b.at?.getTime() ?? Infinity));

  const renderComment = (c: Comment, isReply: boolean) => {
    const text = c.secret ? secretBodies[c.id] : c.body;
    return (
      <li key={c.id} id={`comment-${c.id}`} className={isReply ? 'comment-reply' : undefined}>
        <Avatar src={c.photoURL} name={c.name} />
        <div className="comment-main">
          <div className="comment-meta">
            <strong>{c.name}</strong>
            {c.secret && <span className="comment-secret">비밀</span>}
            {c.createdAt && (
              <time dateTime={c.createdAt.toISOString()}>
                {formatDistanceToNow(c.createdAt, { addSuffix: true, locale: ko })}
              </time>
            )}
            <span className="comment-tools">
              {user && !isReply && (
                <button type="button" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
                  답글
                </button>
              )}
              {(user?.uid === c.uid || isAdmin) && (
                <button type="button" onClick={() => remove(c)}>
                  삭제
                </button>
              )}
            </span>
          </div>
          {text === undefined ? (
            <p className="comment-body comment-locked">🔒 비밀 댓글입니다.</p>
          ) : (
            <p className="comment-body">{text}</p>
          )}
        </div>
      </li>
    );
  };

  return (
    <CommentsSection>
      <h2>댓글 {comments.length > 0 && <span>{comments.length}</span>}</h2>

      {loading ? (
        <p className="comments-empty">불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="comments-empty">첫 댓글을 남겨주세요.</p>
      ) : (
        <ul>
          {threads.map(({ id, root }) => (
            <React.Fragment key={id}>
              {root ? (
                renderComment(root, false)
              ) : (
                <li>
                  <p className="comment-body comment-locked">삭제된 댓글입니다.</p>
                </li>
              )}
              {comments.filter(c => c.parentId === id).map(c => renderComment(c, true))}
              {user && root && replyTo === id && (
                <li className="comment-reply comment-reply-form">
                  <CommentForm
                    autoFocus
                    placeholder={`${root.name}님에게 답글`}
                    defaultSecret={root.secret}
                    onCancel={() => setReplyTo(null)}
                    onSubmit={async (text, secret) => {
                      const ok = await submit(text, secret, root);
                      if (ok) {
                        setReplyTo(null);
                      }
                      return ok;
                    }}
                  />
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}

      {user ? (
        <CommentForm
          placeholder="댓글을 입력하세요"
          onSubmit={(text, secret) => submit(text, secret, null)}
          footer={(
            <span className="comment-user">
              {user.displayName}
              <button type="button" onClick={signOut}>로그아웃</button>
            </span>
          )}
        />
      ) : (
        <button type="button" className="comment-login" disabled={loading} onClick={signIn}>
          Google로 로그인하고 댓글 쓰기
        </button>
      )}

      {error && <p className="comment-error">{error}</p>}
    </CommentsSection>
  );
};

const CommentForm: React.FC<{
  placeholder: string;
  defaultSecret?: boolean;
  autoFocus?: boolean;
  footer?: React.ReactNode;
  onCancel?: () => void;
  onSubmit: (text: string, secret: boolean) => Promise<boolean>;
}> = ({ placeholder, defaultSecret = false, autoFocus, footer, onCancel, onSubmit }) => {
  const [body, setBody] = useState('');
  const [secret, setSecret] = useState(defaultSecret);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || submitting) {
      return;
    }
    setSubmitting(true);
    if (await onSubmit(text, secret)) {
      setBody('');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit}>
      <textarea
        value={body}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        onChange={e => setBody(e.target.value)}
      />
      <div className="comment-actions">
        {footer ?? <span />}
        <span className="comment-buttons">
          <label className="comment-secret-toggle">
            <input type="checkbox" checked={secret} onChange={e => setSecret(e.target.checked)} />
            비밀댓글
          </label>
          {onCancel && (
            <button type="button" className="comment-cancel" onClick={onCancel}>취소</button>
          )}
          <button type="submit" className="comment-submit" disabled={!body.trim() || submitting}>
            {submitting ? '등록 중…' : '등록'}
          </button>
        </span>
      </div>
    </form>
  );
};

const postRef = (
  firestore: FirebaseModules['firestore'],
  db: Firestore,
  slug: string,
  sub: 'comments' | 'secrets' | 'emails',
) => firestore.collection(db, 'posts', postKey(slug), sub);

const Avatar: React.FC<{ src: string | null; name: string }> = ({ src, name }) =>
  src ? (
    <img className="comment-avatar" src={src} alt="" referrerPolicy="no-referrer" />
  ) : (
    <span className="comment-avatar">{name.slice(0, 1)}</span>
  );

const CommentsSection = styled.section`
  margin: 0 auto;
  padding-top: 48px;
  max-width: 700px;
  border-top: 1px solid ${colors.line};

  h2 {
    margin: 0 0 24px;
    color: ${colors.text};
    font-size: 2rem;
    font-weight: 700;
  }

  h2 span {
    color: ${colors.accent};
  }

  ul {
    margin: 0 0 32px;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    gap: 12px;
    margin: 0;
    padding: 16px 0;
    border-bottom: 1px solid ${colors.line};
  }

  .comment-reply {
    padding-left: 48px;
  }

  .comment-reply-form form {
    flex: 1;
  }

  .comment-avatar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${colors.surface};
    color: ${colors.subtle};
    font-size: 1.4rem;
    object-fit: cover;
  }

  .comment-main {
    flex: 1;
    min-width: 0;
  }

  .comment-meta {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 1.4rem;
  }

  .comment-meta strong {
    color: ${colors.text};
  }

  .comment-meta time {
    color: ${colors.faint};
    font-size: 1.3rem;
  }

  .comment-secret {
    padding: 1px 6px;
    border-radius: 4px;
    background: ${colors.surface};
    color: ${colors.subtle};
    font-size: 1.2rem;
  }

  .comment-body {
    margin: 4px 0 0;
    color: ${colors.body};
    font-size: 1.5rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-locked {
    color: ${colors.faint};
  }

  .comments-empty {
    margin: 0 0 32px;
    color: ${colors.faint};
    font-size: 1.5rem;
  }

  button {
    border: 0;
    background: none;
    cursor: pointer;
    font: inherit;
  }

  .comment-tools button,
  .comment-user button,
  .comment-cancel {
    padding: 0;
    color: ${colors.faint};
    font-size: 1.3rem;
  }

  .comment-tools {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid ${colors.line};
    border-radius: 8px;
    background: #fff;
    color: ${colors.text};
    font: inherit;
    font-size: 1.5rem;
    line-height: 1.6;
    resize: vertical;
  }

  textarea:focus {
    outline: none;
    border-color: ${colors.accent};
  }

  .comment-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  .comment-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .comment-secret-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${colors.subtle};
    font-size: 1.4rem;
    cursor: pointer;
  }

  .comment-secret-toggle input {
    margin: 0;
    accent-color: ${colors.accent};
  }

  .comment-user {
    display: flex;
    gap: 8px;
    color: ${colors.subtle};
    font-size: 1.4rem;
  }

  .comment-submit,
  .comment-login {
    padding: 8px 16px;
    border-radius: 8px;
    background: ${colors.accent};
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
  }

  .comment-submit:disabled,
  .comment-login:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .comment-error {
    margin: 12px 0 0;
    color: ${colors.red};
    font-size: 1.4rem;
  }

  @media (prefers-color-scheme: dark) {
    border-top-color: ${colors.darkLine};

    h2,
    .comment-meta strong {
      color: ${colors.darkText};
    }

    h2 span {
      color: ${colors.darkAccent};
    }

    li {
      border-bottom-color: ${colors.darkLine};
    }

    .comment-body {
      color: ${colors.darkBody};
    }

    .comment-meta time,
    .comments-empty,
    .comment-tools button,
    .comment-cancel,
    .comment-locked,
    .comment-secret-toggle,
    .comment-user,
    .comment-user button {
      color: ${colors.darkSubtle};
    }

    .comment-avatar,
    .comment-secret {
      background: ${colors.darkSurface};
      color: ${colors.darkSubtle};
    }

    textarea {
      border-color: ${colors.darkLine};
      background: ${colors.darkSurface};
      color: ${colors.darkText};
    }

    textarea:focus {
      border-color: ${colors.darkAccent};
    }

    .comment-submit,
    .comment-login {
      background: ${colors.darkAccent};
      color: ${colors.darkgrey};
    }
  }
`;
