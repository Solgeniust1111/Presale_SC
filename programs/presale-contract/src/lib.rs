use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Gis8LkraTr9SZjcvU3xCwaSnhbmxAbvGMAqw7CYy7p4Y");

#[program]
pub mod presale_contract {
    use super::*;

    pub fn create_presale(
        ctx: Context<CreatePresale>,
        token_mint_address: Pubkey,
        softcap_amount: u64,
        hardcap_amount: u64,
        max_token_amount_per_address: u64,
        price_per_token: u64,
        start_time: u64,
        end_time: u64,
        // identifier: u8
    ) -> Result<()> {
        return create_presale::create_presale(
            ctx,
            token_mint_address,
            softcap_amount,
            hardcap_amount,
            max_token_amount_per_address,
            price_per_token,
            start_time,
            end_time,
        );
    }

    pub fn update_presale(
        ctx: Context<UpdatePresale>,
        max_token_amount_per_address: u64,
        price_per_token: u64,
        softcap_amount: u64,
        hardcap_amount: u64,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        return update_presale::update_presale(
            ctx,
            max_token_amount_per_address,
            price_per_token,
            softcap_amount,
            hardcap_amount,
            start_time,
            end_time,
        );
    }

    pub fn deposit_token(
        ctx: Context<DepositToken>,
        amount: u64,
        // identifier: u8,
    ) -> Result<()> {
        return deposit_token::deposit_token(
            ctx, amount,
            // identifier
        );
    }

    pub fn add_referer(ctx: Context<AddReferer>) -> Result<()> {
        return add_referer::add_referer(ctx);
    }

    pub fn start_presale(ctx: Context<StartPresale>, start_time: u64, end_time: u64) -> Result<()> {
        return start_presale::start_presale(ctx, start_time, end_time);
    }

    pub fn buy_token_with_sol(
        ctx: Context<BuyTokenWithSol>,
        token_amount: u64,
        quote_amount: u64,
    ) -> Result<()> {
        return buy_token_with_sol::buy_token_with_sol(ctx, token_amount, quote_amount);
    }

    pub fn buy_token_with_token(
        ctx: Context<BuyTokenWithToken>,
        token_amount: u64,
        quote_amount: u64,
    ) -> Result<()> {
        return buy_token_with_token::buy_token_with_token(ctx, token_amount, quote_amount);
    }

    pub fn claim_token(ctx: Context<ClaimToken>, bump: u8) -> Result<()> {
        return claim_token::claim_token(ctx, bump);
    }

    pub fn withdraw_sol(
        ctx: Context<WithdrawSol>,
        amount: u64,
        amount_usdt: u64,
        amount_usdc: u64,
    ) -> Result<()> {
        return withdraw_sol::withdraw_sol(ctx, amount, amount_usdt, amount_usdc);
    }

    pub fn withdraw_token(ctx: Context<WithdrawToken>, amount: u64) -> Result<()> {
        return withdraw_token::withdraw_token(ctx, amount);
    }
}
