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