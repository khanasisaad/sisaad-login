const querystring = require("querystring");

let attempts = {};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  const ip = event.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  if (!attempts[ip]) attempts[ip] = { failCount: 0, lockedUntil: 0 };

  if (attempts[ip].lockedUntil > now) {
    const wait = Math.ceil((attempts[ip].lockedUntil - now) / 1000);
    return { statusCode: 429, headers, body: `กรุณารอ ${wait} วินาที` };
  }

  const parsedBody = querystring.parse(event.body);
  const password = parsedBody.password;
  const correctPassword = "admin6669";

  if (password === correctPassword) {
    attempts[ip] = { failCount: 0, lockedUntil: 0 };
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: "https://liff.line.me/2007617039-lwJeWZrn"
      }
    };
  }

  attempts[ip].failCount++;
  if (attempts[ip].failCount >= 5) {
    attempts[ip].lockedUntil = now + 10 * 60 * 1000;
    return {
      statusCode: 429,
      headers,
      body: "พยายามผิดเกิน 5 ครั้ง ระบบล็อกไว้ 10 นาที"
    };
  }

  return {
  statusCode: 401,
  headers,
  body: `รหัสผ่านไม่ถูกต้อง (${attempts[ip].failCount} ครั้ง)`
};
};
