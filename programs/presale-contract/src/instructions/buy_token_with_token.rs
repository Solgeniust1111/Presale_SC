use std::ops::{Div, Mul};

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::mint::USDC;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::constants::{PRESALE_SEED, USER_SEED};
use crate::constants::{PRESALE_VAULT, USDT};
use crate::errors::PresaleError;
use crate::state::PresaleInfo;
use crate::state::UserInfo;

pub fn buy_token_with_token(
    ctx: Context<BuyTokenWithToken>,
    quote_amount: u64,
    token_amount: u64,
) -> Result<()> {
    let price_update = &mut ctx.accounts.price_update;
    // get_price_no_older_than will fail if the price update is more than 30 seconds old
    let maximum_age: u64 = 1000;
    // get_price_no_older_than will fail if the price update is for a different price feed.
    // This string is the id of the BTC/USD feed. See https://pyth.network/developers/price-feed-ids for all available IDs.
    let feed_id: [u8; 32] =
        get_feed_id_from_hex("0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d")?;
    let price = price_update.get_price_no_older_than(&Clock::get()?, maximum_age, &feed_id)?;
    // Sample output:
    // The price is (7160106530699 ± 5129162301) * 10^-8
    msg!(
        "The price is ({} ± {}) * 10^{}",
        price.price,
        price.conf,
        price.exponent
    );
    let sol_price = price.price;

    let presale_info = &mut ctx.accounts.presale_info;
    let user_info = &mut ctx.accounts.user_info;

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

    let quote_amount = quote_amount.mul(10_u64.pow(9)).div(10_u64.pow(6)) as f64
        / (sol_price as f64 / 10_u64.pow(8) as f64);

    msg!(
        "quote_amount {:?}, token_amount {:?}",
        quote_amount,
        token_amount
    );

    // send SOL to contract and update the user info
    user_info.buy_time = cur_timestamp;
    user_info.buy_quote_amount = user_info.buy_quote_amount + quote_amount as u64;
    user_info.buy_token_amount = user_info.buy_token_amount + token_amount;

    presale_info.sold_token_amount = presale_info.sold_token_amount + token_amount;

    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_ata.to_account_info(),
                to: ctx.accounts.presale_vault_ata.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        (quote_amount as u64).mul(65_u64).div(100_u64),
    )?;

    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_ata.to_account_info(),
                to: ctx.accounts.referer_a_ata.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        (quote_amount as u64).mul(30_u64).div(100_u64),
    )?;

    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_ata.to_account_info(),
                to: ctx.accounts.referer_b_ata.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        (quote_amount as u64).mul(10_u64).div(100_u64),
    )?;

    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_ata.to_account_info(),
                to: ctx.accounts.referer_c_ata.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        (quote_amount as u64).mul(5_u64).div(100_u64),
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
pub struct BuyTokenWithToken<'info> {
    #[account(
        mut,
        seeds = [PRESALE_SEED],
        bump
    )]
    pub presale_info: Box<Account<'info, PresaleInfo>>,

    // Add this account to any instruction Context that needs price data.
    pub price_update: Account<'info, PriceUpdateV2>,

    // #[account(constraint = usd_token.key() == USDC || usd_token.key() == USDT)]
    pub usd_token: Account<'info, Mint>,

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

    #[account(
        mut,
        associated_token::mint = usd_token,
        associated_token::authority = presale_vault,
    )]
    pub presale_vault_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = usd_token,
        associated_token::authority = referer_a,
    )]
    pub referer_a_ata: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is the Refer wallet address
    #[account(mut)]
    pub referer_a: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = usd_token,
        associated_token::authority = referer_b,
    )]
    pub referer_b_ata: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is Refer wallet address
    #[account(mut)]
    pub referer_b: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = usd_token,
        associated_token::authority = referer_c,
    )]
    pub referer_c_ata: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is Refer wallet address
    #[account(mut)]
    pub referer_c: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = usd_token,
        associated_token::authority = buyer,
    )]
    pub buyer_ata: Box<Account<'info, TokenAccount>>,

    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
