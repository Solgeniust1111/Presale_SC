use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::mint::USDC;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::constants::{PRESALE_SEED, PRESALE_VAULT, USDT};
use crate::state::PresaleInfo;

// Edit the details for a presale
pub fn create_presale(
    ctx: Context<CreatePresale>,
    token_mint_address: Pubkey,
    softcap_amount: u64,
    hardcap_amount: u64,
    max_token_amount_per_address: u64,
    price_per_token: u64,
    start_time: u64,
    end_time: u64,
) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let authority = &ctx.accounts.authority;

    presale_info.token_mint_address = token_mint_address;
    presale_info.softcap_amount = softcap_amount;
    presale_info.hardcap_amount = hardcap_amount;
    presale_info.deposit_token_amount = 0;
    presale_info.sold_token_amount = 0;
    presale_info.start_time = start_time;
    presale_info.end_time = end_time;
    presale_info.max_token_amount_per_address = max_token_amount_per_address;
    presale_info.price_per_token = price_per_token;
    presale_info.is_live = false;
    presale_info.authority = authority.key();
    presale_info.is_soft_capped = false;
    presale_info.is_hard_capped = false;
    presale_info.presale_sol_amount = 0;

    msg!(
        "Presale has created for token: {}",
        presale_info.token_mint_address
    );

    Ok(())
}

#[derive(Accounts)]
pub struct CreatePresale<'info> {
    #[account(
        init_if_needed,
        seeds = [PRESALE_SEED],
        bump,
        payer = authority,
        space = 8 + std::mem::size_of::<PresaleInfo>(),
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    /// CHECK: This is not dangerous
    #[account(
            mut,
            // init_if_needed,
            // payer = payer,
            seeds = [PRESALE_VAULT],
            bump,
            // space = 0
        )]
    pub presale_vault: AccountInfo<'info>,

    // #[account(mut, address=USDC)]
    pub mint_usdc: Box<Account<'info, Mint>>,

    // #[account(mut, address=USDT)]
    pub mint_usdt: Box<Account<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint_usdc,
        associated_token::authority = presale_vault,
    )]
    pub to_associated_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint_usdt,
        associated_token::authority = presale_vault,
    )]
    pub to_associated_usdt_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
