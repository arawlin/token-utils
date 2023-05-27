# token-utils

## eventToken

transfer event

`npx hardhat eventToken --t tokenAddress --b 18955400 --s 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef --p aaa,bbb;ccc --network inconfig`

## mevLike

### config

- create mongodb index

`idx_hashTransaction`
`idx_blockNumber`

### process

- target
- buy

  - when
  - which token
  - how
    - check safety
    - how many amounts

- sell in v2

  - when

    - mev sell

    - `removeLiquidity` `removeLiquidityWithPermit` etc of router

      - check token address

    - contract token that be called to `any method`
      - not approve
      - not transfer
