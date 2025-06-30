const querystring = require("querystring");

let attempts = {}; // จำ IP ที่พยายามผิด

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

  if (attempts[ip].lockedUntil > now) {
    const wait = Math.ceil((attempts[ip].lockedUntil - now) / 1000);
    return {
      statusCode: 200,
      headers,
      body: `
        <html>
          <body style="font-family: Prompt, sans-serif; background:#fff6ec; text-align:center; padding:4rem;">
            <h2 style="color:tomato;">⏳ ระบบล็อกไว้ 10 นาที</h2>
            <p>กรุณารออีก ${wait} วินาที</p>
            <a href="/" style="color:#ff6600;">🔁 กลับหน้าล็อกอิน</a>
          </body>
        </html>
      `
    };
  }

  const parsedBody = querystring.parse(event.body);
  const password = parsedBody.password;
  const correct = "admin6669"; // เปลี่ยนได้ตามต้องการ

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

  // ใส่ผิด ➤ เพิ่มครั้ง
  attempts[ip].failCount++;

  if (attempts[ip].failCount >= 5) {
    attempts[ip].lockedUntil = now + 10 * 60 * 1000; // 10 นาที
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

  // แจ้งรหัสผิด (ยังไม่เกิน 5 ครั้ง)
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
    <h1>🚫 พยายามผิดเกิน 5 ครั้ง</h1>
    <p>ระบบล็อกไว้ 10 นาทีเพื่อความปลอดภัย</p>
    <div id="countdown">เหลือเวลา: --:--</div>
    <a href="/">🔁 กลับหน้าล็อกอิน</a>
  </div>

  <script>
    // 👇 ตั้งเวลาเป้าหมาย (เช่น 10 นาทีจากตอนโดนบล็อก)
    const unlockAt = new Date().getTime() + 10 * 60 * 1000;

    function updateCountdown() {
      const now = new Date().getTime();
      const remaining = unlockAt - now;

      if (remaining <= 0) {
        document.getElementById("countdown").textContent = "สามารถเข้าสู่ระบบได้แล้ว 🎉";
        return;
      }

      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      document.getElementById("countdown").textContent = `เหลือเวลา: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      setTimeout(updateCountdown, 1000);
    }

    updateCountdown();
  </script>
</body>
</html>

    `
  };
};
