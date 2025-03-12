import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, getReferer, payer, program, sleep } from "./config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { presaleDuration } from "./03-create_presale";

// withdraw sol setting
const withdrawSolAmount = new BN(1);
let newReferee1: Keypair;
let newReferee2: Keypair;
describe("presale-contract", () => {
  it("Add Referer1", async () => {
    
    const userPDA = await getUserInfoPDA(payer.publicKey)
    // preparing transaction
    const tx = await program.methods
      .addReferer()
      .accounts({
        buyer: payer.publicKey,
        referer: Keypair.generate().publicKey,
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(
      `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );

    // test result check
    const userState = await program.account.userInfo.fetch(userPDA);
    console.log("userState : ", userState);
  })
  it("Add Referer1", async () => {
    newReferee1 = Keypair.generate();
    console.log(`Requesting airdrop for admin ${newReferee1.publicKey.toBase58()}`);
    // 1 - Request Airdrop
    let signature = await connection.requestAirdrop(newReferee1.publicKey, 10 ** 9);
    // 2 - Fetch the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    // 3 - Confirm transaction success
    await connection.confirmTransaction(
      {
        blockhash,
        lastValidBlockHeight,
        signature,
      },
      "confirmed"
    );
    console.log(
      "user balance : ",
      (await connection.getBalance(newReferee1.publicKey)) / 10 ** 9,
      "SOL"
    );
    const userPDA = await getUserInfoPDA(newReferee1.publicKey)
    // preparing transaction
    const tx = await program.methods
      .addReferer()
      .accounts({
        buyer: newReferee1.publicKey,
        referer: payer.publicKey,
      })
      .signers([newReferee1])
      .transaction();

    tx.feePayer = newReferee1.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    signature = await sendAndConfirmTransaction(connection, tx, [newReferee1]);
    console.log(
      `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );

    // test result check
    const userState = await program.account.userInfo.fetch(userPDA);
    console.log("userState : ", userState);
  })
  it("Add Referer2", async () => {
    newReferee2 = Keypair.generate();
    console.log(`Requesting airdrop for admin ${newReferee2.publicKey.toBase58()}`);
    // 1 - Request Airdrop
    let signature = await connection.requestAirdrop(newReferee2.publicKey, 10 ** 9);
    // 2 - Fetch the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    // 3 - Confirm transaction success
    await connection.confirmTransaction(
      {
        blockhash,
        lastValidBlockHeight,
        signature,
      },
      "confirmed"
    );
    console.log(
      "user balance : ",
      (await connection.getBalance(newReferee2.publicKey)) / 10 ** 9,
      "SOL"
    );
    const userPDA = await getUserInfoPDA(newReferee2.publicKey)
    // preparing transaction
    const tx = await program.methods
      .addReferer()
      .accounts({
        buyer: newReferee2.publicKey,
        referer: newReferee1.publicKey,
      })
      .signers([newReferee2])
      .transaction();

    tx.feePayer = newReferee2.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    signature = await sendAndConfirmTransaction(connection, tx, [newReferee2]);
    console.log(
      `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );

    // test result check
    const userState = await program.account.userInfo.fetch(userPDA);
    console.log("userState : ", userState);
  })

  it("GET", async () => {
    const referer = await getReferer(payer.publicKey)
    // const referer = await getReferer(newReferee2.publicKey)
    console.log("referer : ", referer)
  })

})


