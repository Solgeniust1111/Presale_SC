// import { BN } from "bn.js";
// import {
//   Keypair,
//   LAMPORTS_PER_SOL,
//   PublicKey,
//   sendAndConfirmTransaction,
// } from "@solana/web3.js";
// import { connection, payer, program, PROGRAM_ID, sleep } from "./config";
// import {
//   createMint,
//   getAssociatedTokenAddress,
//   getOrCreateAssociatedTokenAccount,
//   mintTo,
// } from "@solana/spl-token";
// import { getPresalePDA, getUserInfoPDA, getVaultPDA } from "./pda";
// import { adminAta, mint, tokenDecimal } from "./02-mint_token";

// describe("presale-contract", () => {

  

//   // presale setting
//   const softCapAmount = new BN(300000);
//   const hardCapAmount = new BN(500000);
//   const maxTokenAmountPerAddress = new BN(1000);
//   const pricePerToken = new BN(100);
//   // const startTime = new BN(1717497786561);
//   let startTime = new BN(Date.now());
//   const presaleDuration = new BN(5000);
//   let endTime = startTime.add(presaleDuration);

//   // deposit setting
//   const presaleAmount = new BN(300000000).mul(new BN(10 ** tokenDecimal));

//   // buyToken setting
//   const quoteSolAmount = new BN(10000);

//   // withdraw sol setting
//   const withdrawSolAmount = new BN(1);

//   // withdraw token setting
//   const withdrawTokenAmount = new BN(1);

//   // address of userinfo PDA

//   console.clear()

 

//   it("Presale account is initialized!", async () => {
//     // fetching accounts for transaction
//     const [presalePDA] = await getPresalePDA();
//     console.log(`Presale address: ${presalePDA} is created.`);
//     console.log(
//       "Balance of admin wallet: ",
//       await connection.getBalance(payer.publicKey) / LAMPORTS_PER_SOL
//     );

//     // preparing transaction
//     const tx = await program.methods
//       .createPresale(
//         mint,
//         softCapAmount,
//         hardCapAmount,
//         maxTokenAmountPerAddress,
//         pricePerToken,
//         startTime,
//         endTime
//       )
//       .accounts({
//         authority: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     // transcation confirmation stage
//     console.log(await connection.simulateTransaction(tx));
//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
//     console.log(
//       `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );

//     // test result check
//     const presaleState = await program.account.presaleInfo.fetch(presalePDA);
//     console.log("presale state: ", presaleState);
//     // console.log("presale hard cap: ", presaleState.hardcapAmount.toString());
//   });

//   it("Add Referer", async () => {
    
//     const userPDA = await getUserInfoPDA(payer.publicKey)
//     // preparing transaction
//     const tx = await program.methods
//       .addReferer()
//       .accounts({
//         buyer : payer.publicKey,
//         referer : Keypair.generate().publicKey,
//         // priceUpdate : new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE")
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
//     console.log(
//       `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );

//     // test result check
//     const userState = await program.account.userInfo.fetch(userPDA);
//     console.log("userState : ", userState);
//   })

//   it("Presale is updated!", async () => {
//     // fetching accounts for transaction
//     const [presalePDA] = await getPresalePDA();

//     // preparing transaction
//     const tx = await program.methods
//       .updatePresale(
//         maxTokenAmountPerAddress,
//         pricePerToken,
//         softCapAmount,
//         hardCapAmount,
//         startTime,
//         endTime
//       )
//       .accounts({
//         authority: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
//     console.log(
//       `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );

//     // test result check
//     const presaleState = await program.account.presaleInfo.fetch(presalePDA);
//     console.log("presale state: ", presaleState);
//     console.log("presale soft cap: ", presaleState.softcapAmount.toString());
//   });

//   it("Token is deposited!", async () => {
//     // fetching accounts for transaction
//     const [presalePDA] = await getPresalePDA();
//     const [presaleVault] = await getVaultPDA();

//     // get associatedTokenAddress
//     const toAssociatedTokenAccount = await getAssociatedTokenAddress(mint, presalePDA, true);

//     // preparing transaction
//     const tx = await program.methods
//       .depositToken(presaleAmount)
//       .accounts({
//         mintAccount: mint,
//         fromAuthority: payer.publicKey,
//         admin: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
//     console.log(
//       `Transaction succcess: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );
//     console.log("Token mint address: ", mint.toBase58());
//     console.log(
//       "Token balance of presaleAta: ",
//       await connection.getTokenAccountBalance(toAssociatedTokenAccount)
//     );
//     console.log(
//       "Sol balance of presale vault: ",
//       await connection.getBalance(presaleVault)
//     );
//   });

//   it("Presale start!", async () => {
//     // fetching accounts for transaction
//     const [presalePDA] = await getPresalePDA();

//     startTime = new BN(Date.now());
//     endTime = startTime.add(presaleDuration);

//     // preparing transaction
//     const tx = await program.methods
//       .startPresale(startTime, endTime)
//       .accounts({
//         authority: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);

//     console.log(
//       `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );
//     console.log(
//       "Start time: ",
//       new Date(parseInt(startTime.toString())),
//       "----",
//       startTime.toNumber()
//     );
//     console.log(
//       "End time: ",
//       new Date(parseInt(endTime.toString())),
//       "----",
//       endTime.toNumber()
//     );
//   });

//   it("Buy token!", async () => {
//     await sleep(1000);

//     const [presalePDA] = await getPresalePDA();
//     const [presaleVault] = await getVaultPDA();
//     const tokenAmount = quoteSolAmount.div(pricePerToken);

//     // get userInfo Address
//     const userInfo = await getUserInfoPDA(payer.publicKey);

//     // preparing transaction
//     const tx = await program.methods
//       .buyToken(quoteSolAmount, tokenAmount)
//       .accounts({
//         presaleAuthority: payer.publicKey,
//         buyer: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [
//       payer,
//     ]);

//     const userState = await program.account.userInfo.fetch(userInfo);
//     const vaultBalance = await connection.getBalance(presaleVault);

//     console.log(
//       `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );
//     console.log(
//       "Presale Vault balance: ",
//       vaultBalance,
//       " address : ",
//       presaleVault
//     );
//     console.log("User state: ", userState);
//   });

//   it("Claim token!", async () => {
//     console.log("waiting for some seconds for presale to end");
//     await sleep(6000); // wait for 50 seconds
//     const [presalePDA, bump] = await getPresalePDA();

//     // get associatedTokenAddress
//     const presalePresaleTokenAssociatedTokenAccount =
//       await getAssociatedTokenAddress(mint, presalePDA, true);
//     console.log("presale ATA: ", presalePresaleTokenAssociatedTokenAccount);
//     console.log(
//       "token balance: ",
//       await connection.getTokenAccountBalance(
//         presalePresaleTokenAssociatedTokenAccount
//       )
//     );

//     const buyerPresaleTokenAssociatedTokenAccount =
//       await getAssociatedTokenAddress(mint, payer.publicKey, true);
//     console.log("buyer ATA: ", presalePresaleTokenAssociatedTokenAccount);
//     console.log(
//       "token balance: ",
//       await connection.getTokenAccountBalance(
//         presalePresaleTokenAssociatedTokenAccount
//       )
//     );

//     const userInfo = await getUserInfoPDA(payer.publicKey);
//     const [presaleInfo] = await getPresalePDA();

//     const tx = await program.methods
//       .claimToken(bump)
//       .accounts({
//         presaleTokenMintAccount: mint,
//         presaleAuthority: payer.publicKey,
//         buyer: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [
//       payer as Keypair,
//     ]);

//     const presaleTokenBalance = await connection.getTokenAccountBalance(
//       presalePresaleTokenAssociatedTokenAccount
//     );
//     const buyerTokenBalance = await connection.getTokenAccountBalance(
//       buyerPresaleTokenAssociatedTokenAccount
//     );

//     console.log(
//       `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );

//     console.log(
//       "The balance of the token of the presale: ",
//       presaleTokenBalance
//     );
//     console.log("The balance of the token of the user: ", buyerTokenBalance);
//   });

//   it("Withdraw token!", async () => {
//     const [presalePDA, bump] = await getPresalePDA();

//     const presaleAssociatedTokenAccount = await getAssociatedTokenAddress(
//       mint,
//       presalePDA,
//       true
//     );

//     const tx = await program.methods
//       .withdrawToken(withdrawTokenAmount, bump)
//       .accounts({
//         mintAccount: mint,
//         presaleTokenMintAccount: mint,
//         // presaleAuthority: payer.publicKey,
//         adminAuthority: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
//     console.log(
//       `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );
//     const presaleTokenBalance = await connection.getTokenAccountBalance(
//       presaleAssociatedTokenAccount
//     );
//     const adminTokenBalance = await connection.getTokenAccountBalance(adminAta);

//     console.log(
//       "The token balance of the presale vault: ",
//       presaleTokenBalance
//     );
//     console.log("The token balance of the admin: ", adminTokenBalance);
//   });

//   it("Withdraw sol!", async () => {
//     const [presalePDA] = await getPresalePDA();
//     const [presaleVault, bump] = await getVaultPDA();

//     const tx = await program.methods
//       .withdrawSol(withdrawSolAmount, bump)
//       .accounts({
//         admin: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     // console.log(JSON.stringify(tx));
//     const signature = await sendAndConfirmTransaction(connection, tx, [payer]);

//     console.log(
//       `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );

//     const vaultBalance = await connection.getBalance(presaleVault);
//     const adminBalance = await connection.getBalance(payer.publicKey);

//     console.log("The balance of the presale vault: ", vaultBalance);
//     console.log("The balance of the admin: ", adminBalance);
//   });

  
//   it("Buy token!", async () => {
//     await sleep(1000);

//     const [presalePDA] = await getPresalePDA();
//     const [presaleVault] = await getVaultPDA();
//     const tokenAmount = quoteSolAmount.div(pricePerToken);

//     // get userInfo Address
//     const userInfo = await getUserInfoPDA(payer.publicKey);

//     // preparing transaction
//     const tx = await program.methods
//       .buyToken(quoteSolAmount, tokenAmount)
//       .accounts({
//         presaleAuthority: payer.publicKey,
//         buyer: payer.publicKey,
//       })
//       .signers([payer])
//       .transaction();

//     tx.feePayer = payer.publicKey;
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     console.log(await connection.simulateTransaction(tx));

//     const signature = await sendAndConfirmTransaction(connection, tx, [
//       payer,
//     ]);

//     const userState = await program.account.userInfo.fetch(userInfo);
//     const vaultBalance = await connection.getBalance(presaleVault);

//     console.log(
//       `Transaction success: \n https://solscan.io/tx/${signature}?cluster=localnet`
//     );
//     console.log(
//       "Presale Vault balance: ",
//       vaultBalance,
//       " address : ",
//       presaleVault
//     );
//     console.log("User state: ", userState);
//   });

// });
