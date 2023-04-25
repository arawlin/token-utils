# token-utils

## eventToken

transfer event

`npx hardhat eventToken --t tokenAddress --b 18955400 --s 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef --p aaa,bbb;ccc --network inconfig`

## mevLike

sell faster than him when he approve a token, so we need to approve immediately after bought a token

check `removeLiquidity` `removeLiquidityWithPermit` etc in mempool, and sell all token with **more gasPrice than remove liquidity**.

create mongodb index:

`idx_hashTransaction`
`idx_blockNumber`
