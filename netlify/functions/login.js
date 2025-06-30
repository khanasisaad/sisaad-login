const querystring = require("querystring");

let attempts = {};

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  const ip = event.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();

  if (!attempts[ip]) {
    attempts[ip] = { failCount: 0, lockedUntil: 0 };
  }

  const wait = Math.ceil((attempts[ip].lockedUntil - now) / 1000);

  if (attempts[ip].lockedUntil > now) {
    return {
      statusCode: 200,
      headers,
      body: `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <title>⏳ ระบบล็อก</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="https://fonts.googleapis.com/css2?family=Prompt&display=swap" rel="stylesheet" />
          <style>
            body {
              font-family: 'Prompt', sans-serif;
              background-color: #fff6ec;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .box {
              background: #fff0eb;
              padding: 2.5rem;
              border-radius: 14px;
              text-align: center;
              box-shadow: 0 6px 18px rgba(0,0,0,0.08);
            }
            h1 {
              color: #cc3300;
              font-size: 1.8rem;
              margin-bottom: 1rem;
            }
            #countdown {
              font-size: 1.4rem;
              color: #ff6600;
              margin-bottom: 1rem;
            }
            a {
              text-decoration: none;
              color: #ff6600;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>🚫 ระบบล็อกไว้ 10 นาที</h1>
            <p>กรุณารอสักครู่เพื่อความปลอดภัย</p>
            <div id="countdown">เหลือเวลา: --:--</div>
            <a href="/">🔁 กลับหน้าล็อกอิน</a>
          </div>

          <script>
            const remaining = ${wait} * 1000;
            const unlockAt = Date.now() + remaining;

            function updateCountdown() {
              const now = Date.now();
              const diff = unlockAt - now;
              if (diff <= 0) {
                document.getElementById("countdown").textContent = "สามารถเข้าสู่ระบบได้แล้ว 🎉";
                return;
              }
              const m = Math.floor(diff / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              document.getElementById("countdown").textContent = "เหลือเวลา: " + String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
              setTimeout(updateCountdown, 1000);
            }

            updateCountdown();
          </script>
        </body>
        </html>
      `
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
      body: `
        <html>
          <body style="font-family: Prompt, sans-serif; background:#fff6ec; text-align:center; padding:4rem;">
            <h2 style="color:tomato;">🚫 ผิดเกิน 5 ครั้ง</h2>
            <p>ระบบจะล็อกไว้ 10 นาทีเพื่อความปลอดภัย</p>
            <a href="/" style="color:#ff6600;">🔁 กลับหน้าล็อกอิน</a>
          </body>
        </html>
      `
    };
  }

  return {
    statusCode: 200,
    headers,
    body: `
      <html>
        <body style="font-family: Prompt, sans-serif; background:#fff6ec; text-align:center; padding:4rem;">
          <h2 style="color:tomato;">❌ รหัสผ่านไม่ถูกต้อง</h2>
          <p>คุณกรอกผิดไปแล้ว ${attempts[ip].failCount} ครั้ง</p>
          <p>ครบ 5 ครั้ง ระบบจะล็อกทันที</p>
          <a href="/" style="color:#ff6600;">🔁 ลองใหม่อีกครั้ง</a>
        </body>
      </html>
    `
  };
};
