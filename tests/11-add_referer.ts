import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, getReferer, payer, program, sleep } from "./config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { presaleDuration } from "./03-create_presale";

  // withdraw sol setting
  const withdrawSolAmount = new BN(1);

describe("presale-contract", () => {
  it("Add Referer", async () => {

    const temp = await getReferer(payer.publicKey)
    
    console.log(temp);

    const userPDA = await getUserInfoPDA(payer.publicKey)
    // preparing transaction
    const tx = await program.methods
      .addReferer()
      .accounts({
        buyer : payer.publicKey,
        referer : Keypair.generate().publicKey,
        // priceUpdate : new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE")
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
})