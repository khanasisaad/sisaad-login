const querystring = require("querystring");

let attempts = {}; // ใช้สำหรับจำ IP แบบชั่วคราวขณะรัน

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  const ip = event.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();

  if (!attempts[ip]) attempts[ip] = { failCount: 0, lockedUntil: 0 };

  if (attempts[ip].lockedUntil > now) {
    const wait = Math.ceil((attempts[ip].lockedUntil - now) / 1000);
    return {
      statusCode: 200,
      headers,
      body: `กรุณารอ ${wait} วินาที`
    };
  }

  const parsedBody = querystring.parse(event.body);
  const password = parsedBody.password;
  const correct = "admin6669";

  if (password === correct) {
    attempts[ip] = { failCount: 0, lockedUntil: 0 };
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: "https://liff.line.me/2007617039-lwJeWZrn"
      },
      body: "redirecting..."
    };
  }

  attempts[ip].failCount++;

  if (attempts[ip].failCount >= 5) {
    attempts[ip].lockedUntil = now + 10 * 60 * 1000;
    return {
      statusCode: 200,
      headers,
      body: "พยายามผิดเกิน 5 ครั้ง ระบบล็อกไว้ 10 นาที"
    };
  }

  return {
    statusCode: 200,
    headers,
    body: `รหัสผ่านไม่ถูกต้อง (${attempts[ip].failCount} ครั้ง)`
  };
};
