use anchor_spl::{
token_interface::{transfer_checked, TransferChecked , Mint, TokenAccount, TokenInterface}
};

use anchor_lang::prelude::*;

use crate::constants::PRESALE_SEED;
use crate::errors::PresaleError;
use crate::state::PresaleInfo;

pub fn withdraw_token(ctx: Context<WithdrawToken>, amount: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;

    if presale_info.deposit_token_amount < amount {
        return Err(PresaleError::InsufficientFund.into());
    }

    presale_info.deposit_token_amount = presale_info.deposit_token_amount - amount;

    msg!(
        "Transferring presale tokens to buyer {}...",
        &ctx.accounts.admin_authority.key()
    );
    msg!(
        "Mint: {}",
        &ctx.accounts.presale_token_mint_account.to_account_info().key()
    );
    msg!(
        "From Token Address: {}",
        &ctx.accounts.presale_associated_token_account.key()
    );
    msg!(
        "To Token Address: {}",
        &ctx.accounts.admin_associated_token_account.key()
    );

    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                authority: ctx.accounts.presale_info.to_account_info(),
                from: ctx
                    .accounts
                    .presale_associated_token_account
                    .to_account_info(),
                to: ctx
                    .accounts
                    .admin_associated_token_account
                    .to_account_info(),
                mint: ctx.accounts.presale_token_mint_account.to_account_info(),
            },
            &[&[PRESALE_SEED, &[ctx.bumps.presale_info]][..]],
        ),
        amount,
        ctx.accounts.presale_token_mint_account.decimals,
    )?;

    msg!("Withdrew presale tokens successfully.");

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawToken<'info> {
    
    #[account(
        mut,
        associated_token::mint = presale_token_mint_account,
        associated_token::authority = admin_authority,
        associated_token::token_program = token_program,
    )]
    pub admin_associated_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = presale_token_mint_account,
        associated_token::authority = presale_info,
        associated_token::token_program = token_program,
    )]
    pub presale_associated_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub presale_token_mint_account: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [PRESALE_SEED],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    // pub presale_authority: SystemAccount<'info>,

    // #[account(
    // mut,
    // constraint = admin_authority.key() == presale_info.authority.key()
    // )]
    pub admin_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}
