const querystring = require("querystring");

let attempts = {}; // memory-based blocklist

exports.handler = async (event) => {
  const ip = event.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();

  if (!attempts[ip]) {
    attempts[ip] = { failCount: 0, lockedUntil: 0 };
  }

  if (attempts[ip].lockedUntil > now) {
    const wait = Math.ceil((attempts[ip].lockedUntil - now) / 1000);
    return {
      statusCode: 429,
      body: `คุณล็อกอินผิดหลายครั้ง กรุณารอ ${wait} วินาที`,
    };
  }

  const parsedBody = querystring.parse(event.body);
  const password = parsedBody.password;
  const correctPassword = "adminstaffsisaad2025";

  if (password === correctPassword) {
    attempts[ip] = { failCount: 0, lockedUntil: 0 };
    return {
      statusCode: 302,
      headers: {
        Location: "https://liff.line.me/2007617039-lwJeWZrn"
      }
    };
  }

  attempts[ip].failCount++;

  if (attempts[ip].failCount >= 5) {
    attempts[ip].lockedUntil = now + 10 * 60 * 1000;
    return {
      statusCode: 429,
      body: "พยายามล็อกอินผิดเกิน 5 ครั้ง ระบบถูกล็อก 10 นาที"
    };
  }

  return {
    statusCode: 401,
    body: `รหัสผ่านผิด (${attempts[ip].failCount} ครั้ง)`
  };
};
