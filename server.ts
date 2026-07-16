/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Local helper to clean phone numbers on the server side
function cleanPhoneNumberServer(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('03')) {
    digits = '92' + digits.slice(1);
  } else if (digits.startsWith('0092')) {
    digits = digits.slice(2);
  }
  // Pakistan numbers missing prefix but are 10 digits starting with 3
  if (digits.length === 10 && digits.startsWith('3')) {
    digits = '92' + digits;
  }
  return digits;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // Proxy Endpoint to dispatch WhatsApp requests securely from the backend (bypassing browser CORS blocks)
  app.post("/api/send-whatsapp", async (req, res) => {
    try {
      const { to, message, settings } = req.body;

      if (!settings || !settings.enableWhatsappApi) {
        return res.status(400).json({ success: false, error: "WhatsApp API is disabled in settings." });
      }

      const cleanNum = cleanPhoneNumberServer(to);
      if (!cleanNum) {
        return res.status(400).json({ success: false, error: "Invalid recipient phone number." });
      }

      const gateway = settings.whatsappApiGateway || "ultramsg";
      const instanceId = (settings.whatsappApiInstanceId || "").trim();
      const token = (settings.whatsappApiToken || "").trim();

      if (!instanceId && gateway !== "custom") {
        return res.status(400).json({ success: false, error: "WhatsApp Gateway Instance ID is missing in settings." });
      }
      if (!token && gateway !== "custom") {
        return res.status(400).json({ success: false, error: "WhatsApp Gateway API Token is missing in settings." });
      }

      let url = "";
      let method = "POST";
      let headers: Record<string, string> = {};
      let body: any = null;

      if (gateway === "ultramsg") {
        url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        
        // Ultramsg parses x-www-form-urlencoded perfectly, which is extremely robust!
        const params = new URLSearchParams();
        params.append("token", token);
        params.append("to", cleanNum);
        params.append("body", message);
        body = params.toString();
      } else if (gateway === "greenapi") {
        url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          chatId: `${cleanNum}@c.us`,
          message: message
        });
      } else if (gateway === "custom") {
        url = instanceId;
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          to: cleanNum,
          message: message,
          token: token
        });
      } else {
        return res.status(400).json({ success: false, error: `Unsupported gateway: ${gateway}` });
      }

      console.log(`[WhatsApp Proxy] Dispatching via gateway "${gateway}" to phone "${cleanNum}"...`);

      const response = await fetch(url, {
        method,
        headers,
        body
      });

      const responseText = await response.text();
      console.log(`[WhatsApp Proxy Response] Status: ${response.status}. Body: ${responseText}`);

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: `Gateway error (HTTP ${response.status}): ${responseText}`
        });
      }

      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      return res.json({ success: true, data: responseData });

    } catch (err: any) {
      console.error("[WhatsApp Proxy Error]", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Internal server error during WhatsApp API dispatch"
      });
    }
  });

  // Serve Frontend depending on Environment
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mounting Vite middleware in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving static production files from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
