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

  const remaining = attempts[ip].lockedUntil - now;

  if (remaining > 0) {
    const wait = Math.ceil(remaining / 1000);
    return {
      statusCode: 200,
      headers,
      body: `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <title>⏳ ระบบล็อก</title>
          <meta name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link href="https://fonts.googleapis.com/css2?family=Prompt&display=swap" rel="stylesheet" />
          <style>
            body {
              font-family: 'Prompt', sans-serif;
              background-color: #fff6ec;
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .box {
              background: #fff0eb;
              padding: 2.5rem;
              border-radius: 14px;
              text-align: center;
              box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
              max-width: 400px;
              width: 90%;
            }
            h1 {
              font-size: 1.6rem;
              color: #cc3300;
              margin-bottom: 1rem;
            }
            #countdown {
              font-size: 1.2rem;
              color: #ff6600;
              margin-bottom: 1.2rem;
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
            const unlockAt = Date.now() + (${wait} * 1000);
            function updateCountdown() {
              const diff = unlockAt - Date.now();
              if (diff <= 0) {
                document.getElementById("countdown").textContent = "สามารถเข้าสู่ระบบได้แล้ว 🎉";
                return;
              }
              const m = Math.floor(diff / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              document.getElementById("countdown").textContent =
                "เหลือเวลา: " + String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
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
  }

  return {
    statusCode: 200,
    headers,
    body: `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>รหัสไม่ถูกต้อง</title>
        <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://fonts.googleapis.com/css2?family=Prompt&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Prompt', sans-serif;
            background-color: #fff6ec;
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            background: #fff0eb;
            padding: 2.5rem;
            border-radius: 14px;
            text-align: center;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
            max-width: 400px;
            width: 90%;
          }
          .box h1 {
            font-size: 1.6rem;
            color: #cc3300;
            margin-bottom: 1rem;
          }
          .box p {
            font-size: 1rem;
            color: #444;
            margin-bottom: 1.8rem;
          }
          .btn {
            padding: 0.75rem 2rem;
            background-color: #ff6600;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s ease-in-out;
          }
          .btn:hover {
            background-color: #e65c00;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>❌ รหัสผ่านไม่ถูกต้อง</h1>
          <p>คุณกรอกผิดไปแล้ว <strong>${attempts[ip].failCount} ครั้ง</strong></p>
          <p>ครบ 5 ครั้ง ระบบจะล็อกทันที</p>
          <form method="GET" action="/">
            <button class="btn" type="submit">🔁 ลองใหม่อีกครั้ง</button>
          </form>
        </div>
      </body>
      </html>
    `
  };
};