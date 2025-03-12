import * as anchor from '@coral-xyz/anchor';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { config } from 'dotenv';
import { PresaleContract } from "../target/types/presale_contract";
import { Program } from "@coral-xyz/anchor";
import { getUserInfoPDA, getVaultPDA } from './pda';

config()

const RPC = process.env.RPC;
const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYER));
const connection = new Connection(RPC, "confirmed");

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getReferer = async (addr: PublicKey) => {
  const arry: PublicKey[] = [];
  let temp = addr;

  for (let i = 0; i < 3; i++) {
    try {
      const userStateAddr = await getUserInfoPDA(temp);
      const userState = await program.account.userInfo.fetch(userStateAddr);
      temp = userState.referer;
      if (temp.toBase58() == "11111111111111111111111111111111") throw new Error("No referer found");
      console.log(`Refer${i}: `, temp.toBase58());
      arry.push(temp);
    } catch (error) {
      console.error(`Error fetching referer ${i}:`, error);
      const [pool] = await getVaultPDA()
      arry.push(pool); // Use SystemProgram's ID as a fallback
    }
  }

  return arry;
};

anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.PresaleContract as Program<PresaleContract>;

const PROGRAM_ID = program.programId;

export { RPC, payer, connection, sleep, program, PROGRAM_ID , getReferer};
