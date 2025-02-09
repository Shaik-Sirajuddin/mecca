import * as borsh from "@coral-xyz/borsh";
import { BN } from "@coral-xyz/anchor";

import {
  connection,
  fetchAppState,
  fetchAppStore,
  fetchUserDataFromNode,
  fetchUserStoreFromNode,
  getUserDataAcc,
  getUserStoreAcc,
} from "./web3";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { RewardSchema } from "../schema/reward";
import { multilevelProgramId, payerAcc } from "../constants";
import { secretKey } from "../key";
const wallet = Keypair.fromSecretKey(secretKey);

//write test scripts

const getMigrateUserInstruction = (
  address: PublicKey,
  directReferred: number
) => {
  let userDataAcc = getUserDataAcc(address);
  const schema = borsh.struct([borsh.u64("direct_referred")]);
  let instruction_data = Buffer.alloc(200);
  schema.encode(
    {
      direct_referred: new BN(directReferred.toString()),
    },
    instruction_data
  );
  instruction_data = instruction_data.subarray(
    0,
    schema.getSpan(instruction_data)
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey("9tFmeBvKhr3PhgdUYYSUuVZTzSrFDB5GzkD8H2DnmMhG"),
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: address,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: userDataAcc,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: multilevelProgramId,
    data: Buffer.concat([Buffer.from(new Uint8Array([7])), instruction_data]),
  });
  return instruction;
};
const bulkMigrate = async (
  userList: { user: PublicKey; directReferred: number }[]
) => {
  try {
    let tx = new Transaction();
    for (let i = 0; i < userList.length; i++) {
      tx.add(
        getMigrateUserInstruction(userList[i].user, userList[i].directReferred)
      );
    }
    let res = await sendAndConfirmTransaction(connection, tx, [wallet]);
    console.log(res);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
async function migrateUsers() {
  try {
    let userList = [
      "CU8FEsNciDWaQKPFyWSem9WAFsMhpY8ntBYKJ1BiqoSB",
      "3faFoneHdLu5ADGkMG54aQ7AYoYM2zngeFQYaQCHTcNu",
      "7Dt3VwtHEwMXLVq5JJfdg4S8K9oeKPorASiT15zGxJhP",
      "Cpro4mCeYwgPHwZBHxpZ175NgGeoNhBAWsDX5VR9mP2m",
      "61JXhXxeXqRW3ZF9dxANFwSpEK3zjhXA1h1yLcnoWyi4",
      "CkHUZdEb8M93uKWFvKrTQWoYwUj5vWHDXrULyXTGm9p9",
      "A9Ai4wSr28XjooiKNgc53cv8ubEfQnhMLvvV9nABKAhV",
      "B9wpwcS5jEgvWutipyVJq79L8YoTq4w4bb12sCcC6piK",
      "MR8FoPedmRqNsZ13ahth8cLWj3TeBmqPgQGVjLKzcVc",
      "DtzdAVSs3nVToSj4iRJumpip8nS3cWfnZ7DoiS1ad6TR",
      "5hAjPjM5oSd3GRWVtASiAqvGjfGFcskF9oBFYnyHhyip",
      "F5viSSsYZcmeMHiDCsS7m24MbsgpQniyLqqgjRZuj3BK",
      "9qPCFSWXLXukkLsVngUdhyM9GVTDqjff9QrFAuXebFTB",
      "8iXQeJd4wFso9YSxY7EUNzdfjt8Mi4vDPwJPPhT4YxLN",
      "AutSGHp8aaiGmtCYL1KsncDtACdxSFSA2yjcUZqod82o",
      "EQygjwCzNJBRXFpzYNQ82J3goeySYEySg2FtadauL1E3",
      "4ccQLDaUukc8qymmkpXMRpKeaEmf9JWLv8tnRhqqr6KD",
      "2Ct7Vsmdmt4aPsrquUFV35cFiUN54VcmPjoSddisYKe1",
      "1zXQcT44dUuesFtuY34nPZj57XDeZfE6aoLYGjjQmmT",
      "ERxgEqGrLd8H7Up1wqzNUcLBNGCtPJeHUZAxUSKHLyfM",
      "3QNXo5SZCYBPMTS9C7xK5KVdcJWA7j2PYyJZpGDEmKRo",
      "BEHKdRfqBM43e9gQ4vjCCRJN9g4wbg1PX4x1LEh3heBd",
      "5rTagVEe6kPLLjUSJAU8iUUsvni3vsaLYAMj2MFoPqte",
      "81k958D8EQALPXior1WQWnkwDSKQirPiXB4eVQKKA1yg",
      "7PHDU5CqkiE14dF5sbYVAAQZ7Ch2soxYid8728Ku1B9",
      "FzuQh2jxhufKe7XN1hra8xcg9ik8impEPR7Tt2zWzude",
      "EezBJWsCcQzHe2Ynh5HRgn11N1Hg92Tp5cvvSoLwg8SW",
      "J15YLppTFRk3N5Qjb4Kke7GxUcdT89mqHshPscAhEdZL",
      "HSo9NYkknJ62n7AqL1ucU7U5vXgM9EAcWk2ShtxoFNN1",
      "DV8eLwVapH2ebtVSxfMWxqfBZE2Agrhcs3g1Yiq3iFZk",
      "DodDqkckuxyzRsrWYzRroeNFxtjUKHMY29wxPzBHQx9",
      "2EGNYmCwtGXE6RmYocXmj4i7fhcKJUsduBKrRAejaRYR",
      "7YBa1sBpTYF7Cx1qUL1qHFh4ZfePeQjGCcwGJ2fBQzHJ",
      "GZgva4fyzdHFvTod9GeixhkrFTX74AknUEpz6wh1YETH",
      "B4s5RRXWFSsQrjpYRQTTg6P25mCvPgoowecmusqWCfyi",
      "738895oy1tPGagNVCzHGeZuyGGdyRxnHnPJGF3NLQg3e",
      "A9JsmMMk9HzCinuR222mA73JFMoZ6qLZiYbufcr7USGM",
      "FFhchZhvYUkThYWQBMT1k6aK6QBPFU4TnvMJdFoe4Qvi",
      "taoitNCDLzrE5eHvp9Gi6WjzYEQjE6zAum1gkEzL86w",
      "8jXY4D4EpsZf2bBaar5r1SvL56gzcFU4RfELF1QFon29",
      "3Zy63N1z34gtrNUeFzPb2DoetaEvxaANsD3v2UhdGRg1",
      "n79UaQVAaqAsq3J8SQ2N85zZWzJs6tURMi5mbn7nTZQ",
      "H6KRZHcXETeW9HueGsyREyu3J376Mna9Ah3DhM3g88yQ",
      "4qUHsS59DzUJGVk8ocumjAzwiTihZmdtnYFjWrcJKVqv",
      "2QtzFZv39BbWf62o9oomKE36XqEidq3L665o65mijQ6b",
      "JC7NeQ8fRZ6DboDrBXkQ7YuSmErCYi39Jjn9V27viFbS",
      "CVQWxcrBEc79eCYwEDpPSw8D6xKWRnC6RS3de1bjU3Pf",
      "GWWt8yqwxyC46j8z83HQrDgoqyFV18V7TVa93uC2wNSo",
      "8gaiZtdCrovFQ2sCq2kUqVSC458GPB6Xu2GhA8dLnW4r",
      "3q4PizXkrYKeeTi9pWxyEML5kZAePcka7pZV4u1awskB",
      "4LqEAkm36GHJEh1qkuoiaPoaLYn9TPxPLizhocGFE1cu",
      "5Gm2SAYtmz6274JMJh9jP9jFXju9cPZZoCwBAcWN4MhL",
      "G3MVdsBzapbk7noAQUrajP1S4GhNYEBex8P59ZeqGhfJ",
      "5eGDzMPDupEPV7dRsGCBpSUNE15PgFDhLz5VD1tMAqeU",
      "CxV4jUFXoUHX3i2vkRmaJxwa2MKCiL3tYQuNShymhoFt",
      "9t8rGCrnAnqvJou7B8pL9aK7x6zo4Vc4eTGrdQiiGCFr",
      "4nA2VUe3imTyaeFA7vjrrGiEVZxA2ocuBqKhpwswHdGG",
      "5VNi4K67TvbwNTU46DR7byw1Fp2tJFxEeS4KwsiHsm9m",
      "DaEKXRaAYEWn1w66Fi4MXdcREvYR1jBprFktaWtXCwHS",
      "EJnVDFMiB6oaazAfogVVzaMki74xK476Bg4CVgJcqR7N",
      "Ep5EG5KWTwfQ2NZd2pdGo91C8SxYV1HnQaNz1F4BMMvs",
      "CAPFpabk5tyhVPf6GH3qfCBzQcDXZU871VpooqRrE7ga",
      "CX579YWjZNT1hpD7oV1J9qyyvZ9iUQ6kKu4zhJgLXTB3",
      "3EycKeC1pMkQWrkeXKWJUsqkL842AWLRiugontEgWgJx",
      "i8UkPHy4WKMxt37xF6tdBZGkD3w8U6oz2TJiDqGXnT2",
      "2wopFKys5D85wj4bCqFEbtykNCmSC8v4twK5vv4qhJfZ",
      "ESmCUP8K7jAKwVnoHh3UNMLW7JzuHg7djHpdLnAJmmUa",
      "GqqAh1x5eSCFaLCbvQMiTVT4vNocPsxBGbyLsgMGw9Cn",
      "D28JPFfvEZ8d9kXzBVBzwb3YNLrxXhfaSFDEMb16wzcf",
      "BbicGSsKjj4vus5fmu3u3XGWcta1jrbEpqT4Jd7Lb4PK",
      "4oAPmx3Sz3pAZSegFbQY1Hk5MqhW2LcxrnQQWWENzjgN",
      "7oWYGTGQWDDvpT77Q3KzDuXu74kTbwBgxuEcktEGB2tU",
    ];

    const directReferralMap = new Map([
      ["81k958D8EQALPXior1WQWnkwDSKQirPiXB4eVQKKA1yg", 4],
      ["Cpro4mCeYwgPHwZBHxpZ175NgGeoNhBAWsDX5VR9mP2m", 1],
      ["F5viSSsYZcmeMHiDCsS7m24MbsgpQniyLqqgjRZuj3BK", 1],
      ["G3MVdsBzapbk7noAQUrajP1S4GhNYEBex8P59ZeqGhfJ", 2],
      ["61JXhXxeXqRW3ZF9dxANFwSpEK3zjhXA1h1yLcnoWyi4", 1],
      ["3EycKeC1pMkQWrkeXKWJUsqkL842AWLRiugontEgWgJx", 3],
      ["CAPFpabk5tyhVPf6GH3qfCBzQcDXZU871VpooqRrE7ga", 1],
      ["4LqEAkm36GHJEh1qkuoiaPoaLYn9TPxPLizhocGFE1cu", 1],
      ["7PHDU5CqkiE14dF5sbYVAAQZ7Ch2soxYid8728Ku1B9", 2],
      ["HSo9NYkknJ62n7AqL1ucU7U5vXgM9EAcWk2ShtxoFNN1", 2],
      ["JC7NeQ8fRZ6DboDrBXkQ7YuSmErCYi39Jjn9V27viFbS", 4],
      ["7YBa1sBpTYF7Cx1qUL1qHFh4ZfePeQjGCcwGJ2fBQzHJ", 2],
      ["EJnVDFMiB6oaazAfogVVzaMki74xK476Bg4CVgJcqR7N", 2],
      ["CxV4jUFXoUHX3i2vkRmaJxwa2MKCiL3tYQuNShymhoFt", 4],
      ["BEHKdRfqBM43e9gQ4vjCCRJN9g4wbg1PX4x1LEh3heBd", 1],
      ["EezBJWsCcQzHe2Ynh5HRgn11N1Hg92Tp5cvvSoLwg8SW", 2],
      ["5rTagVEe6kPLLjUSJAU8iUUsvni3vsaLYAMj2MFoPqte", 1],
      ["FzuQh2jxhufKe7XN1hra8xcg9ik8impEPR7Tt2zWzude", 1],
      ["J15YLppTFRk3N5Qjb4Kke7GxUcdT89mqHshPscAhEdZL", 1],
      ["4nA2VUe3imTyaeFA7vjrrGiEVZxA2ocuBqKhpwswHdGG", 4],
      ["ESmCUP8K7jAKwVnoHh3UNMLW7JzuHg7djHpdLnAJmmUa", 7],
      ["5eGDzMPDupEPV7dRsGCBpSUNE15PgFDhLz5VD1tMAqeU", 2],
      ["5VNi4K67TvbwNTU46DR7byw1Fp2tJFxEeS4KwsiHsm9m", 2],
      ["2QtzFZv39BbWf62o9oomKE36XqEidq3L665o65mijQ6b", 1],
      ["FFhchZhvYUkThYWQBMT1k6aK6QBPFU4TnvMJdFoe4Qvi", 1],
      ["CX579YWjZNT1hpD7oV1J9qyyvZ9iUQ6kKu4zhJgLXTB3", 4],
      ["n79UaQVAaqAsq3J8SQ2N85zZWzJs6tURMi5mbn7nTZQ", 1],
      ["5Gm2SAYtmz6274JMJh9jP9jFXju9cPZZoCwBAcWN4MhL", 2],
      ["2wopFKys5D85wj4bCqFEbtykNCmSC8v4twK5vv4qhJfZ", 2],
      ["DaEKXRaAYEWn1w66Fi4MXdcREvYR1jBprFktaWtXCwHS", 2],
      ["i8UkPHy4WKMxt37xF6tdBZGkD3w8U6oz2TJiDqGXnT2", 2],
      ["GqqAh1x5eSCFaLCbvQMiTVT4vNocPsxBGbyLsgMGw9Cn", 1],
      ["D28JPFfvEZ8d9kXzBVBzwb3YNLrxXhfaSFDEMb16wzcf", 1],
      ["BbicGSsKjj4vus5fmu3u3XGWcta1jrbEpqT4Jd7Lb4PK", 1],
      ["4oAPmx3Sz3pAZSegFbQY1Hk5MqhW2LcxrnQQWWENzjgN", 2],
      ["7oWYGTGQWDDvpT77Q3KzDuXu74kTbwBgxuEcktEGB2tU", 1],
    ]);
    // console.log(directReferralMap);
    let i = 0;
    while (true) {
      let j = Math.min(6, userList.length - i);
      let users: { user: PublicKey; directReferred: number }[] = [];
      while (j--) {
        let direct_referred = directReferralMap.get(userList[i]) ?? 0;
        users.push({
          user: new PublicKey(userList[i]),
          directReferred: direct_referred,
        });
        i++;
      }
      let res = await bulkMigrate(users);
      console.log(i, res);
      if (i == userList.length) break;
    }
  } catch (error) {
    console.log(error);
  }
}
export async function test() {
  let tx = await connection.getTransaction(
    "29mcpJGtGBR5D535Nu72axL7KC5AjXNQaPgLcfpK5bvhTGaYsT8V5GCGqSdym5QxyyDNAhT16dQkrb8GbxhEUgbM",
    {
      commitment: "confirmed",
    }
  );

  //@ts-expect-error this
  let returnData = tx?.meta.returnData.data;

  //temp
  const schema = borsh.struct([
    borsh.publicKey("address"),
    borsh.vec(RewardSchema, "rewards"),
  ]);
  let buffer = Buffer.from(returnData[0], "base64");
  console.log(returnData[0], buffer);
  console.log(tx?.meta)

  const parsedData = schema.decode(buffer);
  console.log(parsedData);
}
