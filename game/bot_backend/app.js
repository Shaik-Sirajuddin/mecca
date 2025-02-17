const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const TOKEN = process.env.BOT_TOKEN;

const botUserName = 'mecca_official_bot'

// let gameUrl = "https://bot.earnwitwat.online/game";
let gameUrl = "https://meccain.netlify.app/";
const imageUrl = "https://raw.githubusercontent.com/mcret2024/tokendata/refs/heads/main/assets/mecca_official_bot.jpg"; // Replace with your desired size

const port = process.env.PORT || 8040;
const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
app.use(cors());
app.use(express.json());

app.use("/assets", express.static(path.join(__dirname, "assets")));
// app.use("/game", express.static(path.join(__dirname, "game")));
// app.use("/game_test", express.static(path.join(__dirname, "game_test")));

/**
 * Search functions
 */
const apiSecurityCode = "joasdf8921kljds";
const apiBaseUrl = `http:localhost:8002`;

async function fetchUserCount() {
  try {
    let data = await fetch(`${apiBaseUrl}/admin/user-count`, {
      method: "GET",
      headers: {
        Authorization: "Gq8H9ZjUcL4LXxLd",
      },
    });
    let res = await data.json();
    return parseInt(res.data.userCount);
  } catch (error) {
    console.log(error);
    return 0;
  }
}

const signUpUser = async (telegramId, referralCode) => {
  try {
    let url = apiBaseUrl + "/auth/login";
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referral_code: referralCode,
        security_code: apiSecurityCode,
        telegram_id: telegramId,
      }),
    });
    let result = await res.json();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
const fetchReferralCount = async (telegramId) => {
  try {
    let url = apiBaseUrl + "/user/referral_count";
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        security_code: apiSecurityCode,
      }),
    });
    let result = await res.json();
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const fetchReferralDetails = async (telegramId) => {
  try {
    let url = apiBaseUrl + "/user/referral_details";
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        security_code: apiSecurityCode,
      }),
    });
    let result = await res.json();
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Matches /start
// Handle /start command
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

bot.setMyCommands([
  { command: "/start", description: "Waken Mecca" },
  { command: "/refcode", description: "Get your invite code" },
  { command: "/refcount", description: "View count of invites" },
  // { command: "/usercount", description: "View count of players" },
]);
bot.onText(/\/usercount/, async (msg) => {
  try {
    let telegramId = msg.from.id;
    let userCount = await fetchUserCount();
    const chatId = msg.chat.id;
    const displayString = `
       Total Players in Game : 🚀 ${userCount} 🚀
      `.trim();
    bot.sendMessage(chatId, displayString);
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/\/refcode/, async (msg) => {
  try {
    let telegramId = msg.from.id;
    let referralDetails = await fetchReferralDetails(telegramId);
    let referralCode =
      referralDetails && referralDetails.referral_code
        ? referralDetails.referral_code
        : "";
    const chatId = msg.chat.id;
    bot
      .sendMessage(
        chatId,
        `
    🚀 **Invite Friends and Earn Extra Plays!** 🚀

    For every 4 friends who play once, you get 1 extra play. 🎮

    **How it works:**
    1️⃣ Share your referral link.
    2️⃣ When your friends play, you earn extra plays. 🚀

    Invite more friends and get to play additonal times! 🏆
    ${
      referralCode
        ? `🔗 *Your Referral Link*:\n https://t.me/${botUserName.replace(/_/g, '\\_')}?start=${referralCode}`
        : "🎮 Try the game to get your unique invite code!"
    }
            `.trim(),
            {
              parse_mode: "Markdown",
            }
          )
      .then(() => {
        bot.sendMessage(
          chatId,
          `**Tap to copy** \n\n \`https://t.me/${botUserName}?start=${referralCode}\``,
          { parse_mode: "MarkdownV2" }
        );
      });
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/\/refoverview/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    let telegramId = msg.from.id;
    let referralDetails = await fetchReferralDetails(telegramId);
    if (!referralDetails || !referralDetails.referee_list) {
      referralDetails.referee_list = [];
    }
    const referredUsersWithNames = referralDetails.referee_list
      .map((user) => user.name)
      .join(", ");

    const displayString = `
      🚀 **Your Referred Friends** 🚀
      You have referred the following users: 
      ${referredUsersWithNames || "No users with names to display."}
      
      (Note: Users without names are not shown.) 
      
      Keep inviting more friends to unlock extra plays! 🎮
      `.trim();
    bot.sendMessage(chatId, displayString);
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/\/refcount/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    let telegramId = msg.from.id;
    let referralCount = await fetchReferralCount(telegramId);
    if (!referralCount) {
      referralCount = {
        total: 0,
        successful: 0,
        unclaimed_rounds: 0,
        claimed_round: 0,
      };
    }

    let userCount = await fetchUserCount();
    
    bot.sendMessage(
      chatId,
      `
🚀 **Your Referral Stats** 🚀

Total Games Played : 🚀 ${referralCount.games_played} 🚀
You've invited **${referralCount.total}** friends so far! 🎉
Out of those, **${referralCount.successful}** have played at least one game. 🏅

Thanks to your referrals, you've unlocked

**${Math.floor(
        referralCount.additional_rounds
      )}** additional round(s) to play ! 🎮
Claimed Additional Round(s) : ${referralCount.claimed_rounds}
UnPlayed Additional Round(s) : ${referralCount.unclaimed_rounds}

The more successful invites, the more extra plays you can earn! 🚀
Keep inviting and get to play additional times! 🏆
`.trim()
    );
  } catch (error) {
    console.log(error);
  }
});
bot.onText(/\/start(.*)/, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const referralCode = match[1];
    if (referralCode) {
      signUpUser(msg.from.id, referralCode.toString().trim());
    }
    let userCount = await fetchUserCount();
    console.log(referralCode);
    // Send the image first
    bot
      .sendPhoto(chatId, imageUrl, {})
      .then(() => {
        // Send the message with the inline button
        bot.sendMessage(
          chatId,
          `
         TAP to PLAY !\n\n👉It all starts at your fingertips. Let's go!\n\n🚀 ${userCount} 🚀 Players 
         `,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "👉 Play",
                    web_app: {
                      url: gameUrl,
                    },
                  },
                ],
              ],
              // keyboard : [
              //   [
              //     {
              //       text: "Play",
              //       web_app: {
              //         url: gameUrl,
              //       },
              //     },
              //   ],
              // ],
              // resize_keyboard: true,  // Adjusts the keyboard size
              // one_time_keyboard: true,
            },
          }
        );
      })
      .catch((err) => {
        console.error("Error sending photo:", err);
      });
  } catch (error) {
    console.log(error);
    console.log("Bot start request");
  }
});
// Bind server to port
app.listen(port, function listen() {
  console.log(`Server is listening at http://localhost:${port}`);
});
