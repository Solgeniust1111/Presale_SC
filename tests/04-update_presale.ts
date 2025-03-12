import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer, program } from "./config";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA } from "./pda";
import { mint } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";

const softCapAmount = new BN(300000);
const hardCapAmount = new BN(500000);
const maxTokenAmountPerAddress = new BN(1000);
const pricePerToken = new BN(100);
let startTime = new BN(Date.now());
const presaleDuration = new BN(50000);
let endTime = startTime.add(presaleDuration);

describe("presale-contract", () => {

  it("Presale is updated!", async () => {
    // fetching accounts for transaction
    const [presalePDA] = await getPresalePDA();

    // preparing transaction
    const tx = await program.methods
      .updatePresale(
        maxTokenAmountPerAddress,
        pricePerToken,
        softCapAmount,
        hardCapAmount,
        startTime,
        endTime
      )
      .accounts({
        authority: payer.publicKey,
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
    const presaleState = await program.account.presaleInfo.fetch(presalePDA);
    console.log("presale state: ", presaleState);
    console.log("presale soft cap: ", presaleState.softcapAmount.toString());
  });
})