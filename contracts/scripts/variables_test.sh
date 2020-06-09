export DEFAULT_ROUNDLOCKPERIODINBLOCKS=5
export DEFAULT_VALIDPRICEPERIODINBLOCKS=180
export DEFAULT_TRIGGERVALIDPUBLICATIONBLOCKS=30

export DEFAULT_MAXORACLESPERROUND=10
export DEFAULT_BOOTSTRAPPRICE='1000000000000000'
export DEFAULT_MINORACLEOWNERSTAKE='10000000000'
export DEFAULT_NUMIDLEROUNDS=2


CurrencyPair+="BTCUSD;"
  roundLockPeriodInBlocks+="$DEFAULT_ROUNDLOCKPERIODINBLOCKS;"
  validPricePeriodInBlocks+="$DEFAULT_VALIDPRICEPERIODINBLOCKS;"
  triggerValidPublicationBlocks+="$DEFAULT_TRIGGERVALIDPUBLICATIONBLOCKS;"
  minOracleOwnerStake+="$DEFAULT_MINORACLEOWNERSTAKE;"
  maxOraclesPerRound+="$DEFAULT_MAXORACLESPERROUND;"
  bootstrapPrice+="$DEFAULT_BOOTSTRAPPRICE;"
  numIdleRounds+="$DEFAULT_NUMIDLEROUNDS;"


CurrencyPair+="RIFBTC;"
  roundLockPeriodInBlocks+="$DEFAULT_ROUNDLOCKPERIODINBLOCKS;"
  validPricePeriodInBlocks+="$DEFAULT_VALIDPRICEPERIODINBLOCKS;"
  triggerValidPublicationBlocks+="$DEFAULT_TRIGGERVALIDPUBLICATIONBLOCKS;"
  minOracleOwnerStake+="$DEFAULT_MINORACLEOWNERSTAKE;"
  maxOraclesPerRound+="$DEFAULT_MAXORACLESPERROUND;"
  bootstrapPrice+="$DEFAULT_BOOTSTRAPPRICE;"
  numIdleRounds+="$DEFAULT_NUMIDLEROUNDS;"

export CurrencyPair
export roundLockPeriodInBlocks
export validPricePeriodInBlocks
export triggerValidPublicationBlocks
export minOracleOwnerStake
export maxOraclesPerRound
export bootstrapPrice
export numIdleRounds

