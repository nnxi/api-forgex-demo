import { useState } from 'react';

const STORAGE = {
  baseUrl: 'afx_base_url',
  token: 'afx_token',
};

function load(key, fallback) {
  return localStorage.getItem(key) ?? fallback;
}

async function callApi(baseUrl, path, options = {}) {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  const headers = { ...(options.headers ?? {}) };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') ?? '';
  let body;

  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, ok: res.ok, body };
}

function Result({ result }) {
  if (!result) return null;

  return (
    <div className="result">
      <div className="status">
        Status: {result.status} {result.ok ? 'OK' : 'Error'}
      </div>
      <pre>{typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}</pre>
    </div>
  );
}

function EndpointPanel({ method, path, title, children, onSend, result, extra }) {
  return (
    <section className="panel">
      <h2>
        <span className={`method ${method.toLowerCase()}`}>{method}</span>
        <span className="path">{path}</span>
      </h2>
      {title && <p className="hint">{title}</p>}
      {children}
      <div className="actions">
        <button type="button" onClick={onSend}>
          요청 보내기
        </button>
        {extra}
      </div>
      <Result result={result} />
    </section>
  );
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState(() => load(STORAGE.baseUrl, 'http://localhost:8080'));
  const [token, setToken] = useState(() => load(STORAGE.token, ''));

  const [healthResult, setHealthResult] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    name: '홍길동',
    email: 'test@example.com',
    nickname: 'testuser',
    password: 'password123',
  });
  const [registerResult, setRegisterResult] = useState(null);

  const [loginForm, setLoginForm] = useState({
    email: 'test@example.com',
    password: 'password123',
  });
  const [loginResult, setLoginResult] = useState(null);

  const [meResult, setMeResult] = useState(null);

  const saveBaseUrl = (value) => {
    setBaseUrl(value);
    localStorage.setItem(STORAGE.baseUrl, value);
  };

  const saveToken = (value) => {
    setToken(value);
    localStorage.setItem(STORAGE.token, value);
  };

  const run = async (setter, path, options) => {
    setter(null);
    try {
      const result = await callApi(baseUrl, path, { ...options, token });
      setter(result);
      return result;
    } catch (err) {
      setter({ status: 0, ok: false, body: { message: err.message } });
    }
  };

  const handleLogin = async () => {
    const result = await run(setLoginResult, '/api/users/login', {
      method: 'POST',
      body: loginForm,
    });
    if (result?.ok && result.body?.data?.token) {
      saveToken(result.body.data.token);
    }
  };

  return (
    <>
      <h1>AFX API Tester</h1>
      <p className="subtitle">백엔드 엔드포인트를 빠르게 시험하는 간단한 UI입니다.</p>

      <section className="panel config-panel">
        <h2>설정</h2>
        <label htmlFor="baseUrl">API Base URL</label>
        <input
          id="baseUrl"
          value={baseUrl}
          onChange={(e) => saveBaseUrl(e.target.value)}
          placeholder="http://localhost:8080"
        />
        <label htmlFor="token">JWT Token (로그인 후 자동 저장)</label>
        <textarea
          id="token"
          value={token}
          onChange={(e) => saveToken(e.target.value)}
          placeholder="Bearer 토큰 (로그인 응답의 data.token)"
          rows={3}
        />
        <button type="button" className="secondary" onClick={() => saveToken('')}>
          토큰 지우기
        </button>
        {token && (
          <p className="token-box">
            현재 토큰: {token.slice(0, 40)}
            {token.length > 40 ? '…' : ''}
          </p>
        )}
      </section>

      <EndpointPanel
        method="GET"
        path="/health"
        title="서버 상태 확인"
        result={healthResult}
        onSend={() => run(setHealthResult, '/health')}
        extra={
          <a
            className="doc-link"
            href={`${baseUrl.replace(/\/$/, '')}/api-docs`}
            target="_blank"
            rel="noreferrer"
          >
            API 문서 열기
          </a>
        }
      />

      <EndpointPanel
        method="POST"
        path="/api/users/register"
        title="회원가입 — name, email, nickname, password"
        result={registerResult}
        onSend={() =>
          run(setRegisterResult, '/api/users/register', {
            method: 'POST',
            body: registerForm,
          })
        }
      >
        <div className="row">
          <div>
            <label>name</label>
            <input
              value={registerForm.name}
              onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label>nickname</label>
            <input
              value={registerForm.nickname}
              onChange={(e) => setRegisterForm((f) => ({ ...f, nickname: e.target.value }))}
            />
          </div>
        </div>
        <label>email</label>
        <input
          type="email"
          value={registerForm.email}
          onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
        />
        <label>password</label>
        <input
          type="password"
          value={registerForm.password}
          onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
        />
      </EndpointPanel>

      <EndpointPanel
        method="POST"
        path="/api/users/login"
        title="로그인 — 성공 시 토큰이 자동 저장됩니다"
        result={loginResult}
        onSend={handleLogin}
      >
        <label>email</label>
        <input
          type="email"
          value={loginForm.email}
          onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
        />
        <label>password</label>
        <input
          type="password"
          value={loginForm.password}
          onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
        />
      </EndpointPanel>

      <EndpointPanel
        method="GET"
        path="/api/users/me"
        title="내 프로필 — Authorization: Bearer {token} 필요"
        result={meResult}
        onSend={() => run(setMeResult, '/api/users/me')}
      />
    </>
  );
}
