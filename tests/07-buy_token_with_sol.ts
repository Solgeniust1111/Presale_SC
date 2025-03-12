import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, getReferer, payer, program, sleep } from "./config";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { pricePerToken } from "./03-create_presale";

// buyToken setting
const quoteSolAmount = new BN(LAMPORTS_PER_SOL);

describe("presale-contract", () => {
  it("Buy token!", async () => {
    await sleep(1000);

    const [presaleVault] = await getVaultPDA();
    const tokenAmount = quoteSolAmount.mul(pricePerToken);

    console.log("tokenAmount", Number(tokenAmount));

    // get userInfo Address
    const userInfo = await getUserInfoPDA(payer.publicKey);

    const referers = await getReferer(payer.publicKey);

    console.log(referers);

    // preparing transaction
    const tx = await program.methods
      .buyTokenWithSol(quoteSolAmount, tokenAmount)
      .accounts({
        presaleAuthority: payer.publicKey,
        buyer: payer.publicKey,
        refererA: referers[0],
        refererB: referers[1],
        refererC: referers[2]
      })
      .signers([payer])
      .transaction();

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log(await connection.simulateTransaction(tx));

    const signature = await sendAndConfirmTransaction(connection, tx, [
      payer,
    ]);

    const userState = await program.account.userInfo.fetch(userInfo);
    const vaultBalance = await connection.getBalance(presaleVault);

    console.log(
      `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
    );
    console.log("Presale Vault balance: ", vaultBalance, " address : ", presaleVault);
    console.log("buyQuoteAmount: ", Number(userState.buyQuoteAmount));
    console.log("buyTime: ", Number(userState.buyTime));
    console.log("buyTokenAmount: ", Number(userState.buyTokenAmount));
    console.log("claimTime: ", Number(userState.claimTime));
    console.log("referer: ", userState.referer.toBase58());
  });

})