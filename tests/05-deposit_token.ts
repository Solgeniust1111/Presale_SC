import { ASSOCIATED_TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection, payer, program } from "./config";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal, USDC, USDT } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";

const presaleAmount = new BN(300000000).mul(new BN(10 ** tokenDecimal));

describe("presale-contract", () => {

  it("Token is deposited!", async () => {
    // fetching accounts for transaction
    const [presalePDA] = await getPresalePDA();
    const [presaleVault] = await getVaultPDA();

    // get associatedTokenAddress
    // const toAssociatedTokenAccount = await getAssociatedTokenAddress(mint, presalePDA, true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

    console.log(mint);
    // preparing transaction
    const tx = await program.methods
      .depositToken(presaleAmount)
      .accounts({
        mintAccount: mint,
        fromAuthority: payer.publicKey,
        admin: payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID
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
    console.log("Token mint address: ", mint.toBase58());
    // console.log(
    //   "Token balance of presaleAta: ",
    //   await connection.getTokenAccountBalance(toAssociatedTokenAccount)
    // );
    console.log(
      "Sol balance of presale vault: ",
      await connection.getBalance(presaleVault)
    );
  });
})