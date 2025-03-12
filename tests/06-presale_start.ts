import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer, program } from "./config";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { presaleDuration } from "./03-create_presale";

const startTime = new BN(Date.now());
const endTime = startTime.add(presaleDuration);

describe("presale-contract", () => {

  it("Presale start!", async () => {
    // fetching accounts for transaction
    const [presalePDA] = await getPresalePDA();


    // preparing transaction
    const tx = await program.methods
      .startPresale(startTime, endTime)
      .accounts({
        authority: payer.publicKey,
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);

    console.log(
      `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );
    console.log(
      "Start time: ",
      new Date(parseInt(startTime.toString())),
      "----",
      startTime.toNumber()
    );
    console.log(
      "End time: ",
      new Date(parseInt(endTime.toString())),
      "----",
      endTime.toNumber()
    );
  });

})