import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer, program } from "./config";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA } from "./pda";
import { mint, USDC, USDT } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";

export const softCapAmount = new BN(300000).mul(new BN(LAMPORTS_PER_SOL));
export const hardCapAmount = new BN(500000).mul(new BN(LAMPORTS_PER_SOL));
export const maxTokenAmountPerAddress = new BN(10000).mul(new BN(LAMPORTS_PER_SOL));
export const pricePerToken = new BN(100);       //  100TOKEN / 1SOL
export let startTime = new BN(Date.now());
export const presaleDuration = new BN(100000000);
export let endTime = startTime.add(presaleDuration);

describe("presale-contract", () => {

  it("Presale account is initialized!", async () => {
    // fetching accounts for transaction
    const [presalePDA] = await getPresalePDA();
    console.log(`Presale address: ${presalePDA} is created.`);
    console.log(
      "Balance of admin wallet: ",
      await connection.getBalance(payer.publicKey) / LAMPORTS_PER_SOL
    );

    console.log("mint", mint);

    // preparing transaction
    const tx = await program.methods
      .createPresale(
        mint,
        softCapAmount,
        hardCapAmount,
        maxTokenAmountPerAddress,
        pricePerToken,
        startTime,
        endTime
      )
      .accounts({
        mintUsdc: USDC,
        mintUsdt: USDT,
        authority: payer.publicKey,
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // transcation confirmation stage
    console.log(await connection.simulateTransaction(tx));
    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(
      `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );

    // test result check
    const presaleState = await program.account.presaleInfo.fetch(presalePDA);

    console.log("authority: ", presaleState.authority.toBase58());
    console.log("depositTokenAmount: ", Number(presaleState.depositTokenAmount));
    console.log("endTime: ", Number(presaleState.endTime));
    console.log("hardcapAmount: ", Number(presaleState.hardcapAmount));
    console.log("isHardCapped: ", presaleState.isHardCapped);
    console.log("isLive: ", presaleState.isLive);
    console.log("isSoftCapped: ", presaleState.isSoftCapped);
    console.log("maxTokenAmountPerAddress: ", Number(presaleState.maxTokenAmountPerAddress));
    console.log("pricePerToken: ", Number(presaleState.pricePerToken));
    console.log("softcapAmount: ", Number(presaleState.softcapAmount));
    console.log("soldTokenAmount: ", Number(presaleState.soldTokenAmount));
    console.log("startTime: ", Number(presaleState.startTime));
    console.log("tokenMintAddress: ", presaleState.tokenMintAddress.toBase58());
  });
})