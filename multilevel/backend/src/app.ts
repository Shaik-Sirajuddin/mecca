import * as dotenv from "dotenv";
import server from "./config/server";
import { redisConnect } from "./config/redis";
import { setUpCron } from "./services/cronjobs";
import { makeConnection } from "./config/connection";
import MUserData from "./models/user_data";
import { UserData } from "./schema/user_data";

dotenv.config();
const port = 3050;

server.listen(port, () => {
  console.log(`server listening at ${port}`);
});

makeConnection().then(async (res) => {
  redisConnect().then(() => {
    setUpCron();
  });
});

const extractUserData = async()=>{
  const { rows: users, count } = await MUserData.findAndCountAll({
    where: {},
    order: [["createdAt", "DESC"]],
  });
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let userData = new UserData(JSON.parse(user.dataValues.data).data);
    await MUserData.update({
      code : userData.id
    } , {
      where : {
        id : user.dataValues.id
      }
    })    
  }
}
// extractUserData()