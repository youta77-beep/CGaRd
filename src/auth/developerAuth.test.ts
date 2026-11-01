import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_DEVELOPER_EMAILS,
  DEVELOPER_PASSWORD,
  isAllowedDeveloperEmail,
  verifyDeveloperCredentials,
} from './developerAuth.ts';

test('ALLOWED_DEVELOPER_EMAILS contains only the two authorized emails', () => {
  assert.deepEqual([...ALLOWED_DEVELOPER_EMAILS], [
    'yousufadilelhag77@gmail.com',
    'insung.hw@outlook.com',
  ]);
  assert.equal(DEVELOPER_PASSWORD, ':9sC_YRgQ4whJZa');
});

test('verifyDeveloperCredentials succeeds for both authorized emails with correct password', () => {
  assert.equal(
    verifyDeveloperCredentials('yousufadilelhag77@gmail.com', ':9sC_YRgQ4whJZa'),
    true
  );
  assert.equal(
    verifyDeveloperCredentials('insung.hw@outlook.com', ':9sC_YRgQ4whJZa'),
    true
  );
});

test('verifyDeveloperCredentials supports case-insensitivity and trimming on email', () => {
  assert.equal(
    verifyDeveloperCredentials('  YousufAdilElhag77@Gmail.com  ', ':9sC_YRgQ4whJZa'),
    true
  );
  assert.equal(
    verifyDeveloperCredentials('Insung.Hw@Outlook.com', ':9sC_YRgQ4whJZa'),
    true
  );
});

test('verifyDeveloperCredentials rejects unauthorized emails even with correct password', () => {
  assert.equal(
    verifyDeveloperCredentials('admin@example.com', ':9sC_YRgQ4whJZa'),
    false
  );
  assert.equal(
    verifyDeveloperCredentials('random.developer@gmail.com', ':9sC_YRgQ4whJZa'),
    false
  );
  assert.equal(
    verifyDeveloperCredentials('', ':9sC_YRgQ4whJZa'),
    false
  );
});

test('verifyDeveloperCredentials rejects correct emails with incorrect password', () => {
  assert.equal(
    verifyDeveloperCredentials('yousufadilelhag77@gmail.com', 'wrongpassword'),
    false
  );
  assert.equal(
    verifyDeveloperCredentials('insung.hw@outlook.com', ''),
    false
  );
  assert.equal(
    verifyDeveloperCredentials('insung.hw@outlook.com', ':9sC_YRgQ4whJZa '), // trailing space
    false
  );
});

test('isAllowedDeveloperEmail accurately checks email permission', () => {
  assert.equal(isAllowedDeveloperEmail('yousufadilelhag77@gmail.com'), true);
  assert.equal(isAllowedDeveloperEmail('insung.hw@outlook.com'), true);
  assert.equal(isAllowedDeveloperEmail('someone@gmail.com'), false);
  assert.equal(isAllowedDeveloperEmail(null), false);
  assert.equal(isAllowedDeveloperEmail(''), false);
});
