import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { connection, payer, program, sleep } from "./config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { adminAta, mint, tokenDecimal } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { presaleDuration } from "./03-create_presale";

// withdraw token setting
const withdrawTokenAmount = new BN(1);

describe("presale-contract", () => {

  it("Withdraw token!", async () => {
    const [presalePDA, bump] = await getPresalePDA();


    const tx = await program.methods
      .withdrawToken(withdrawTokenAmount)
      .accounts({
        presaleTokenMintAccount: mint,
        // presaleAuthority: payer.publicKey,
        adminAuthority: payer.publicKey,
        tokenProgram : TOKEN_2022_PROGRAM_ID
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(
      `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );
  });
})