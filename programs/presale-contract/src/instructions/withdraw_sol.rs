use anchor_lang::{prelude::*, system_program};
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::constants::{PRESALE_SEED, PRESALE_VAULT};
use crate::state::PresaleInfo;

pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64 , amount_usdt: u64 , amount_usdc: u64) -> Result<()> {
    msg!(
        "Vault: {:?} Send Amount {:?}",
        ctx.accounts.presale_vault.to_account_info().lamports(),
        amount
    );
    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.presale_vault.to_account_info(),
                to: ctx.accounts.admin.to_account_info(),
            },
            &[&[
                PRESALE_VAULT,
                /*ctx.accounts.presale_info.key().as_ref(),*/ &[ctx.bumps.presale_vault],
            ][..]],
        ),
        amount,
    )?;

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.to_associated_usdc_account.to_account_info(),
                to: ctx.accounts.admin_usdc_account.to_account_info(),
                authority: ctx.accounts.presale_vault.to_account_info(),
            },
            &[&[
                PRESALE_VAULT,
                /*ctx.accounts.presale_info.key().as_ref(),*/ &[ctx.bumps.presale_vault],
            ][..]],
        ),
        amount_usdc,
    )?;
    
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.to_associated_usdt_account.to_account_info(),
                to: ctx.accounts.admin_usdt_account.to_account_info(),
                authority: ctx.accounts.presale_vault.to_account_info(),
            },
            &[&[
                PRESALE_VAULT,
                /*ctx.accounts.presale_info.key().as_ref(),*/ &[ctx.bumps.presale_vault],
            ][..]],
        ),
        amount_usdt,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        seeds = [PRESALE_SEED],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    /// CHECK:
    #[account(
        mut,
        seeds = [PRESALE_VAULT, /* presale_info.key().as_ref() */],
        bump
    )]
    pub presale_vault: AccountInfo<'info>,

    // #[account(mut, address=USDC)]
    pub mint_usdc: Box<Account<'info, Mint>>,

    // #[account(mut, address=USDT)]
    pub mint_usdt: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_usdc,
        associated_token::authority = presale_vault,
    )]
    pub to_associated_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = mint_usdt,
        associated_token::authority = presale_vault,
    )]
    pub to_associated_usdt_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_usdc,
        associated_token::authority = admin,
    )]
    pub admin_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = mint_usdt,
        associated_token::authority = admin,
    )]
    pub admin_usdt_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = admin.key() == presale_info.authority
    )]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
