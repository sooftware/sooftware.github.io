// Comment mail notifier for sooftware.github.io (Google Apps Script).
// Runs every minute: drains the Firestore `queue` collection the comment form
// writes to, then mails
//   - the admin about every new comment/reply not written by the admin
//   - the parent comment's author when the admin replies to them.
// Firestore is read with the script owner's credentials (project owner),
// so security rules do not apply here. Run `setup` once to create the trigger.

const PROJECT = 'sooftware';
const ADMIN = 'sh951011@gmail.com';
const SITE = 'https://sooftware.github.io';
const DOCS = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';

function setup() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('processQueue').timeBased().everyMinutes(1).create();
}

function processQueue() {
  const res = request('get', DOCS + '/queue?pageSize=50');
  ((res && res.documents) || []).forEach(doc => {
    try {
      notify(fields(doc));
    } catch (e) {
      console.error(doc.name, e);
    }
    // drop the entry even on failure so a bad item cannot resend mail forever
    request('delete', 'https://firestore.googleapis.com/v1/' + doc.name.split('/').map(encodeURIComponent).join('/'));
  });
}

function notify(q) {
  const post = 'posts/' + encodeURIComponent(q.post);
  const comment = getDoc(post + '/comments/' + q.comment);
  if (!comment) {
    return; // deleted before we got to it
  }
  const author = getDoc(post + '/emails/' + q.comment);
  const fromAdmin = author && author.email === ADMIN;
  const text = bodyOf(post, q.comment, comment);
  const url = SITE + encodeURI(q.slug) + '#comment-' + q.comment;
  const kind = (comment.parentId ? '답글' : '댓글') + (comment.secret ? '(비밀)' : '');

  if (!fromAdmin) {
    send(ADMIN, '[SOOFTWARE] ' + comment.name + '님이 ' + kind + '을 남겼어요', text, url);
  }

  if (fromAdmin && comment.parentId) {
    const parent = getDoc(post + '/comments/' + comment.parentId);
    const parentAuthor = getDoc(post + '/emails/' + comment.parentId);
    if (parent && parentAuthor && parentAuthor.email !== ADMIN) {
      const quote = bodyOf(post, comment.parentId, parent).split('\n').map(l => '> ' + l).join('\n');
      send(parentAuthor.email, '[SOOFTWARE] 남기신 댓글에 답글이 달렸어요', quote + '\n\n' + text, url);
    }
  }
}

function bodyOf(post, id, comment) {
  if (!comment.secret) {
    return comment.body;
  }
  const secret = getDoc(post + '/secrets/' + id);
  return secret ? secret.body : '';
}

function send(to, subject, text, url) {
  MailApp.sendEmail({ to: to, subject: subject, name: 'SOOFTWARE', body: text + '\n\n' + url });
}

function getDoc(path) {
  const doc = request('get', DOCS + '/' + path);
  return doc && fields(doc);
}

function request(method, url) {
  const res = UrlFetchApp.fetch(url, {
    method: method,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': PROJECT },
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code === 404) {
    return null;
  }
  if (code >= 300) {
    throw new Error(method + ' ' + url + ' -> ' + code + ' ' + res.getContentText());
  }
  return JSON.parse(res.getContentText() || '{}');
}

function fields(doc) {
  const out = {};
  Object.keys(doc.fields || {}).forEach(k => {
    const v = doc.fields[k];
    out[k] = 'stringValue' in v ? v.stringValue
      : 'booleanValue' in v ? v.booleanValue
      : 'timestampValue' in v ? v.timestampValue
      : null;
  });
  return out;
}
