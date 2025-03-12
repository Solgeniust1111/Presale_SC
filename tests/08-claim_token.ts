import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer, program, sleep } from "./config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { presaleDuration } from "./03-create_presale";

describe("presale-contract", () => {
 
  it("Claim token!", async () => {
    console.log("waiting for some seconds for presale to end");
    await sleep(6000); // wait for 50 seconds
    const [presalePDA, bump] = await getPresalePDA();

    // get associatedTokenAddress
    const presalePresaleTokenAssociatedTokenAccount =
      await getAssociatedTokenAddress(mint, presalePDA, true);
    console.log("presale ATA: ", presalePresaleTokenAssociatedTokenAccount);
    console.log(
      "token balance: ",
      await connection.getTokenAccountBalance(
        presalePresaleTokenAssociatedTokenAccount
      )
    );

    const buyerPresaleTokenAssociatedTokenAccount =
      await getAssociatedTokenAddress(mint, payer.publicKey, true);
    console.log("buyer ATA: ", presalePresaleTokenAssociatedTokenAccount);
    console.log(
      "token balance: ",
      await connection.getTokenAccountBalance(
        presalePresaleTokenAssociatedTokenAccount
      )
    );

    const userInfo = await getUserInfoPDA(payer.publicKey);
    const [presaleInfo] = await getPresalePDA();

    const tx = await program.methods
      .claimToken(bump)
      .accounts({
        presaleTokenMintAccount: mint,
        presaleAuthority: payer.publicKey,
        buyer: payer.publicKey,
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    const signature = await sendAndConfirmTransaction(connection, tx, [
      payer as Keypair,
    ]);

    const presaleTokenBalance = await connection.getTokenAccountBalance(
      presalePresaleTokenAssociatedTokenAccount
    );
    const buyerTokenBalance = await connection.getTokenAccountBalance(
      buyerPresaleTokenAssociatedTokenAccount
    );

    console.log(
      `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );

    console.log(
      "The balance of the token of the presale: ",
      presaleTokenBalance
    );
    console.log("The balance of the token of the user: ", buyerTokenBalance);
  });
})