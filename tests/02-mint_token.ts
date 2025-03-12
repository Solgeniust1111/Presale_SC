import { ASSOCIATED_TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { connection, payer } from "./config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export let mint: PublicKey;
export let USDC: PublicKey;
export let USDT: PublicKey;
export let adminAta: PublicKey;
export const tokenDecimal = 9;
export const amount = new BN(1000000000).mul(new BN(10 ** tokenDecimal));

describe("presale-contract", () => {
  it("Mint token to admin wallet", async () => {
    console.log("Trying to create and mint token to admin's wallet.");
    console.log(payer.publicKey.toBase58(), " : ", (await connection.getBalance(payer.publicKey)) / LAMPORTS_PER_SOL, " SOL");

    // create mint
    try {
      mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        tokenDecimal,
        Keypair.generate(),
        { commitment: "confirmed" },
        TOKEN_2022_PROGRAM_ID
      );

      console.log("token mint address: " + mint.toBase58());
      adminAta = (
        await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint,
          payer.publicKey,
          false,
          "confirmed",
          {commitment : "confirmed"},
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      ).address;
      console.log(
        "Admin associated token account address: " + adminAta.toBase58()
      );

      // minting specific number of new tokens to the adminAta we just created
      await mintTo(
        connection,
        payer,
        mint,
        adminAta,
        payer.publicKey,
        BigInt(amount.toString()),
        [],
        {commitment : "confirmed"},
        TOKEN_2022_PROGRAM_ID
      );

      // balance of token in adminAta
      const tokenBalance = await connection.getTokenAccountBalance(adminAta);

      console.log("tokenBalance in adminAta: ", tokenBalance.value.uiAmount);
      console.log("-----token successfully minted!!!-----");
    } catch (error) {
      console.log("-----Token creation error----- \n", error);
    }
  });
  it("Mint token to admin wallet", async () => {
    console.log("Trying to create and mint token to admin's wallet.");
    console.log(payer.publicKey.toBase58(), " : ", (await connection.getBalance(payer.publicKey)) / LAMPORTS_PER_SOL, " SOL");

    // create mint
    try {
      USDC = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        6,
      );

      console.log("token mint address: " + USDC.toBase58());
      adminAta = (
        await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          USDC,
          payer.publicKey,
          true,
        )
      ).address;
      console.log(
        "Admin associated token account address: " + adminAta.toBase58()
      );

      // minting specific number of new tokens to the adminAta we just created
      await mintTo(
        connection,
        payer,
        USDC,
        adminAta,
        payer.publicKey,
        BigInt(amount.toString()),
      );

      // balance of token in adminAta
      const tokenBalance = await connection.getTokenAccountBalance(adminAta);

      console.log("tokenBalance in adminAta: ", tokenBalance.value.uiAmount);
      console.log("-----token successfully minted!!!-----");
    } catch (error) {
      console.log("-----Token creation error----- \n", error);
    }
  });
  it("Mint token to admin wallet", async () => {
    console.log("Trying to create and mint token to admin's wallet.");
    console.log(payer.publicKey.toBase58(), " : ", (await connection.getBalance(payer.publicKey)) / LAMPORTS_PER_SOL, " SOL");

    // create mint
    try {
      USDT = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        6,
      );

      console.log("token mint address: " + USDT.toBase58());
      adminAta = (
        await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          USDT,
          payer.publicKey,
        )
      ).address;
      console.log(
        "Admin associated token account address: " + adminAta.toBase58()
      );

      // minting specific number of new tokens to the adminAta we just created
      await mintTo(
        connection,
        payer,
        USDT,
        adminAta,
        payer.publicKey,
        BigInt(amount.toString()),
      );

      // balance of token in adminAta
      const tokenBalance = await connection.getTokenAccountBalance(adminAta);

      console.log("tokenBalance in adminAta: ", tokenBalance.value.uiAmount);
      console.log("-----token successfully minted!!!-----");
    } catch (error) {
      console.log("-----Token creation error----- \n", error);
    }
  });
})