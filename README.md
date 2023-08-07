# token-utils

## uniswap

### formula

$$ r_i \cdot r_o = K $$

$r_i \cdot r_o = (r_i + a_i) \cdot (r_o - a_o)$

expands to find $a_o$

$a_o = \frac{a_i \cdot r_o}{r_i + a_i}$

the fee of uniswap is 0.3%, so $a_i = a_i^` \cdot 0.997$

```js
function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
    require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
    require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
    uint amountInWithFee = amountIn.mul(997);
    uint numerator = amountInWithFee.mul(reserveOut);
    uint denominator = reserveIn.mul(1000).add(amountInWithFee);
    amountOut = numerator / denominator;
}
```

that is:

$a_o = \frac{a_i \cdot 997 \cdot r_o}{r_i \cdot 1000 + a_i \cdot 997}$

## eventToken

transfer event

`npx hardhat eventToken --t tokenAddress --b 18955400 --s 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef --p aaa,bbb;ccc --network inconfig`

## mevLike

### todo

- [ ] mempool

  - listen the mev address, i.e. from address

    - check buy
    - check sell

  - listen the token address(i.e. to address)

    - check any operate to the contract of token
    - no check
      - approve
      - transfer
      - transferFrom

  - I must be on the alert if I bought, I will sell as soon as possible
    - the token address **must** be sent to the mempool that monitor it
    - sell command **must** be sent to the sell task
    - use sync message to the pulsar mq

- [ ] pulsar mq

- [ ] decouple the logic tasks
  - [ ] a buy task
  - [ ] a sell task

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
