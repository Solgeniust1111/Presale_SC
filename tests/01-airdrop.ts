import { payer } from "./config";

describe("presale-contract", () => {
  it("Airdrop to user wallet", async () => {
    console.log("Admin address is ", payer.publicKey.toBase58());
    // console.log(`Requesting airdrop for admin ${payer.publicKey.toBase58()}`);
    // // 1 - Request Airdrop
    // const signature = await connection.requestAirdrop(payer.publicKey, 10 ** 9);
    // // 2 - Fetch the latest blockhash
    // const { blockhash, lastValidBlockHeight } =
    //   await connection.getLatestBlockhash();
    // // 3 - Confirm transaction success
    // await connection.confirmTransaction(
    //   {
    //     blockhash,
    //     lastValidBlockHeight,
    //     signature,
    //   },
    //   "finalized"
    // );
    // console.log(
    //   "user balance : ",
    //   (await connection.getBalance(payer.publicKey)) / 10 ** 9,
    //   "SOL"
    // );
  });
})