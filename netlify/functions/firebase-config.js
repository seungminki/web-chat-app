// 로컬 직접 실행 시 .env 로드 및 HTTP 서버 구동
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const http = require('http');

  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    });
  } catch (e) {
    console.warn('.env 파일을 찾을 수 없습니다.');
  }

  const PORT = process.env.PORT;
  http.createServer(async (req, res) => {
    const result = await exports.handler({ httpMethod: req.method, headers: req.headers }, {});
    res.writeHead(result.statusCode, result.headers);
    res.end(result.body);
  }).listen(PORT, () => {
    console.log(`로컬 서버 실행 중: http://localhost:${PORT}`);
  });
}

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // GET 요청만 허용
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    
    // 디버깅: 환경변수 확인 (민감정보 제외)
    console.log('Environment check:', {
      hasApiKey: !!process.env.FIREBASE_API_KEY,
      hasAuthDomain: !!process.env.FIREBASE_AUTH_DOMAIN,
      hasDatabase: !!process.env.FIREBASE_DATABASE_URL,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasStorage: !!process.env.FIREBASE_STORAGE_BUCKET
    });

    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    };

    // 환경변수가 설정되지 않았는지 확인
    if (!firebaseConfig.apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Firebase configuration not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(firebaseConfig)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};