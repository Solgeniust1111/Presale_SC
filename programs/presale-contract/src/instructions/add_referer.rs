use anchor_lang::prelude::{Pubkey, *};

use crate::constants::USER_SEED;
use crate::errors::PresaleError;
use crate::state::UserInfo;

pub fn add_referer(ctx: Context<AddReferer>) -> Result<()> {

    if ctx.accounts.user_info.referer == System::id() {
        ctx.accounts.user_info.referer = ctx.accounts.referer.key();
    } else {
        return Err(PresaleError::RefererFilled.into()); 
    }

    Ok(())
}

#[derive(Accounts)]
pub struct AddReferer<'info> {
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + std::mem::size_of::<UserInfo>(),
        seeds = [USER_SEED, buyer.key().to_bytes().as_ref()],
        bump
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    /// CHECK: This is Refer wallet address
    pub referer: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
