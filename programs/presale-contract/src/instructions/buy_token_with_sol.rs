use std::ops::{Div, Mul};

use anchor_lang::{prelude::*, system_program};
use anchor_spl::{associated_token::AssociatedToken, token::Token};

use crate::constants::PRESALE_VAULT;
use crate::constants::{PRESALE_SEED, USER_SEED};
use crate::errors::PresaleError;
use crate::state::PresaleInfo;
use crate::state::UserInfo;

pub fn buy_token_with_sol(
    ctx: Context<BuyTokenWithSol>,
    quote_amount: u64,
    token_amount: u64,
) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let user_info = &mut ctx.accounts.user_info;
    let presale_vault = &mut ctx.accounts.presale_vault;
    let cur_timestamp = u64::try_from(Clock::get()?.unix_timestamp).unwrap();

    // get time and compare with start and end time
    if presale_info.start_time / 1000 > cur_timestamp {
        msg!("current time: {}", cur_timestamp);
        msg!("start time: {}", presale_info.start_time / 1000);
        return Err(PresaleError::PresaleNotStarted.into());
    }

    if presale_info.end_time / 1000 < cur_timestamp {
        msg!("start time: {}", presale_info.start_time / 1000);
        msg!("end time: {}", presale_info.end_time / 1000);
        msg!("current time: {}", cur_timestamp);
        return Err(PresaleError::PresaleEnded.into());
    }

    // compare the rest with the token_amount
    if token_amount > presale_info.deposit_token_amount - presale_info.sold_token_amount {
        msg!("token amount: {}", token_amount);
        msg!(
            "rest token amount in presale: {}",
            presale_info.deposit_token_amount - presale_info.sold_token_amount
        );
        return Err(PresaleError::InsufficientFund.into());
    }

    // limit the token_amount per address
    if presale_info.max_token_amount_per_address < (user_info.buy_token_amount + token_amount) {
        msg!(
            "max token amount per address: {}",
            presale_info.max_token_amount_per_address
        );
        msg!(
            "token amount to buy: {}",
            user_info.buy_token_amount + token_amount
        );
        return Err(PresaleError::InsufficientFund.into());
    }

    // limit the presale to hardcap
    if presale_info.is_hard_capped == true {
        return Err(PresaleError::HardCapped.into());
    }

    msg!(
        "quote_amount {:?}, token_amount {:?}",
        quote_amount,
        token_amount
    );

    // send SOL to contract and update the user info
    user_info.buy_time = cur_timestamp;
    user_info.buy_quote_amount = user_info.buy_quote_amount + quote_amount;
    user_info.buy_token_amount = user_info.buy_token_amount + token_amount;
    presale_info.presale_sol_amount += quote_amount;

    presale_info.sold_token_amount = presale_info.sold_token_amount + token_amount;

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: presale_vault.to_account_info(),
            },
        ),
        quote_amount.mul(65).div(100),
    )?;
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.referer_a.to_account_info(),
            },
        ),
        quote_amount.mul(3).div(10),
    )?;
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.referer_b.to_account_info(),
            },
        ),
        quote_amount.mul(1).div(10),
    )?;
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.referer_c.to_account_info(),
            },
        ),
        quote_amount.mul(5).div(100),
    )?;

    msg!("Presale tokens transferred successfully.");

    // show softcap status
    if presale_info.presale_sol_amount > presale_info.softcap_amount {
        presale_info.is_soft_capped = true;
        msg!("Presale is softcapped");
    }

    // show hardcap status
    if presale_info.presale_sol_amount > presale_info.hardcap_amount {
        presale_info.is_hard_capped = true;
        msg!("Presale is hardcapped");
    }

    Ok(())
}

#[derive(Accounts)]
pub struct BuyTokenWithSol<'info> {
    #[account(
        mut,
        seeds = [PRESALE_SEED],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    /// CHECK: This is not dangerous
    pub presale_authority: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + std::mem::size_of::<UserInfo>(),
        seeds = [USER_SEED , buyer.key().to_bytes().as_ref()],
        bump
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    /// CHECK: This is not dangerous
    #[account(
        mut,
        seeds = [PRESALE_VAULT],
        bump
    )]
    pub presale_vault: AccountInfo<'info>,

    /// CHECK: This is the Refer wallet address
    #[account(mut)]
    pub referer_a: AccountInfo<'info>,

    /// CHECK: This is Refer wallet address
    #[account(mut)]
    pub referer_b: AccountInfo<'info>,

    /// CHECK: This is Refer wallet address
    #[account(mut)]
    pub referer_c: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
