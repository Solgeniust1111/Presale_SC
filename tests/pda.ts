import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./config";

// Configure the constants
const PRESALE_SEED = "PRESALE_SEED";
const USER_SEED = "USER_SEED";
const PRESALE_VAULT = "PRESALE_VAULT";

const getUserInfoPDA = async (user: PublicKey) => {
  return (
    await PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), user.toBuffer()],
      PROGRAM_ID
    )
  )[0];
};

// address of presaleinfo PDA
const getPresalePDA = async () => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from(PRESALE_SEED)],
    PROGRAM_ID
  );
};

// address of presalevault PDA
const getVaultPDA = async () => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from(PRESALE_VAULT)],
    PROGRAM_ID
  );
};

export {
  getUserInfoPDA,
  getPresalePDA,
  getVaultPDA
}