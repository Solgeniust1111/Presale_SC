import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection, getReferer, payer, program, sleep } from "./config";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
import { mint, tokenDecimal, USDC } from "./02-mint_token";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { pricePerToken } from "./03-create_presale";

// buyToken setting
const quoteSolAmount = new BN(LAMPORTS_PER_SOL);

describe("presale-contract", () => {
  it("Buy token!", async () => {
    await sleep(1000);

    const [presaleVault] = await getVaultPDA();
    const tokenAmount = quoteSolAmount.mul(pricePerToken);

    // get userInfo Address
    const userInfo = await getUserInfoPDA(payer.publicKey);

    const referers = await getReferer(payer.publicKey);

    await checkAndCreateUSDCAccounts(referers)
    // preparing transaction
    const tx = await program.methods
      .buyTokenWithToken(quoteSolAmount, tokenAmount)
      .accounts({
        presaleAuthority: payer.publicKey,
        buyer: payer.publicKey,
        priceUpdate: new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"),
        refererA: referers[0],
        refererB: referers[1],
        refererC: referers[2],
        usdToken: USDC,
        //  @ts-ignore
        tokenProgram : TOKEN_PROGRAM_ID
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

async function ensureUSDCAccountExists(refererPublicKey) {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(USDC, refererPublicKey);
    // Check if the associated token account exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
    if (!accountInfo) {
      console.log(`Creating USDC associated token account for ${refererPublicKey.toBase58()}`);
      await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        USDC,
        refererPublicKey
      );
    } else {
      console.log(`USDC associated token account already exists for ${refererPublicKey.toBase58()}`);
    }
  } catch (error) {
    const associatedTokenAddress = await getAssociatedTokenAddress(USDC, refererPublicKey , true);
    // Check if the associated token account exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
    if (!accountInfo) {
      console.log(`Creating USDC associated token account for ${refererPublicKey.toBase58()}`);
      await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        USDC,
        refererPublicKey
      );
    } else {
      console.log(`USDC associated token account already exists for ${refererPublicKey.toBase58()}`);
    }
  }
}

export async function checkAndCreateUSDCAccounts(referers) {
  await Promise.all(referers.map(ensureUSDCAccountExists));
}
