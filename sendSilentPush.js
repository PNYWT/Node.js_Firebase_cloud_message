// Document - https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages

const { JWT } = require('google-auth-library');
const axios = require('axios');
const serviceAccount = require('./service_AccountKey.json'); // ต้องอยู่ในโฟลเดอร์เดียวกัน

async function getAccessToken() {
    const client = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const { token } = await client.getAccessToken();
    return token;
}

async function sendSilentPush() {
    const accessToken = await getAccessToken();
    const iosFcmToken = '';
    const androidFcmToken = '';

    const projectId = serviceAccount.project_id;

    for (const token of [iosFcmToken, androidFcmToken]) {
      const message = {
        message: {
          token: token, // ✅ ใช้ token จาก loop
          apns: {
            headers: {
              'apns-priority': '5',
              'apns-push-type': 'alert'
            },
            payload: {
              aps: {
                alert: {
                  title: "มีคำสั่งซื้อใหม่!",
                  body: "แตะเพื่อดูรายละเอียด"
                },
                sound: "default",
                "content-available": 1
              }
            }
          },
          android: {
            priority: 'high',
            notification: {
              title: 'มีคำสั่งซื้อใหม่!',
              body: 'แตะเพื่อดูรายละเอียด',
              sound: 'default'
            }
          },
          data: {
            type: 'event',
            webURL: 'https://www.google.com'
          }
        }
      };
  
      try {
        const response = await axios.post(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          message,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Push sent to ${token}:`, response.data);
      } catch (error) {
        console.error(`❌ Error sending to ${token}:`, error.response?.data || error.message);
      }
    }
  }
  
  sendSilentPush().catch(console.error);