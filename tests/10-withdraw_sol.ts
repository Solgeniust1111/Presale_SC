import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer, program, sleep } from "./config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal, USDC, USDT } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { presaleDuration } from "./03-create_presale";

  // withdraw sol setting
  const withdrawSolAmount = new BN(1);

describe("presale-contract", () => {

  it("Withdraw sol!", async () => {
    const [presalePDA] = await getPresalePDA();
    const [presaleVault, bump] = await getVaultPDA();

    const tx = await program.methods
      .withdrawSol(withdrawSolAmount , new BN(0) , new BN(0))
      .accounts({
        admin: payer.publicKey,
        mintUsdc:USDC,
        mintUsdt:USDT,
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    // console.log(JSON.stringify(tx));
    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);

    console.log(
      `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );

    const vaultBalance = await connection.getBalance(presaleVault);
    const adminBalance = await connection.getBalance(payer.publicKey);

    console.log("The balance of the presale vault: ", vaultBalance);
    console.log("The balance of the admin: ", adminBalance);
  });
})