export interface GlossaryItem {
  term: string
  termEn: string
  category: string
  definition: string
}

export const CATEGORIES = ['全部', '基础', '位置', '行动', '牌型', '策略', '数学']

export const glossary: GlossaryItem[] = [
  { term: '底池', termEn: 'Pot', category: '基础', definition: '桌面上所有玩家已下注的筹码总和。' },
  { term: '盲注', termEn: 'Blind', category: '基础', definition: '强制下注，小盲(SB)和大盲(BB)在发牌前必须放入底池。' },
  { term: '买入', termEn: 'Buy-in', category: '基础', definition: '参加牌局所需的筹码量，通常以大盲注倍数表示（如100BB）。' },
  { term: '筹码深度', termEn: 'Stack Depth', category: '基础', definition: '玩家当前拥有的筹码量，以BB为单位。影响策略选择。' },
  { term: '摊牌', termEn: 'Showdown', category: '基础', definition: '最后一轮下注后，剩余玩家亮牌比较大小决定胜负。' },
  { term: '翻前', termEn: 'Preflop', category: '基础', definition: '公共牌翻出前的下注轮，玩家只看到自己的两张底牌。' },
  { term: '翻牌', termEn: 'Flop', category: '基础', definition: '前三张公共牌同时翻出的阶段。' },
  { term: '转牌', termEn: 'Turn', category: '基础', definition: '第四张公共牌翻出的阶段。' },
  { term: '河牌', termEn: 'River', category: '基础', definition: '第五张（最后一张）公共牌翻出的阶段。' },
  { term: 'UTG', termEn: 'Under The Gun', category: '位置', definition: '大盲注左边第一个行动的玩家，位置最差，范围最紧。' },
  { term: 'MP', termEn: 'Middle Position', category: '位置', definition: '中间位置，介于前位和后位之间。' },
  { term: 'HJ', termEn: 'Hijack', category: '位置', definition: 'CO左边的位置，开始进入后位区域。' },
  { term: 'CO', termEn: 'Cutoff', category: '位置', definition: '按钮位左边，倒数第二好的位置。' },
  { term: 'BTN', termEn: 'Button', category: '位置', definition: '庄家位，翻后最后行动，位置优势最大。' },
  { term: 'SB', termEn: 'Small Blind', category: '位置', definition: '小盲注位置，翻后第一个行动，位置劣势。' },
  { term: 'BB', termEn: 'Big Blind', category: '位置', definition: '大盲注位置，翻前最后行动但翻后较早行动。' },
  { term: '位置优势', termEn: 'Position', category: '位置', definition: '后行动的玩家拥有更多信息，可以做出更好的决策。' },
  { term: '加注', termEn: 'Raise', category: '行动', definition: '在前一个下注基础上增加下注金额。' },
  { term: '跟注', termEn: 'Call', category: '行动', definition: '匹配前一个玩家的下注金额。' },
  { term: '弃牌', termEn: 'Fold', category: '行动', definition: '放弃本手牌，不再参与本局竞争。' },
  { term: '过牌', termEn: 'Check', category: '行动', definition: '不下注也不弃牌，将行动权传给下一个玩家（仅当无人下注时）。' },
  { term: '全下', termEn: 'All-in', category: '行动', definition: '将所有筹码推入底池。' },
  { term: '开池', termEn: 'Open', category: '行动', definition: '翻前第一个加注的动作（之前无人加注）。' },
  { term: '3-Bet', termEn: '3-Bet', category: '行动', definition: '对第一个加注的再加注。名字来源于盲注算第1注，开池算第2注。' },
  { term: '4-Bet', termEn: '4-Bet', category: '行动', definition: '对3-Bet的再加注。通常代表极强的牌力。' },
  { term: 'C-Bet', termEn: 'Continuation Bet', category: '行动', definition: '翻前加注者在翻牌继续下注，无论是否击中。' },
  { term: '过牌加注', termEn: 'Check-Raise', category: '行动', definition: '先过牌，等对手下注后再加注。表示强牌或诈唬。' },
  { term: '慢打', termEn: 'Slow Play', category: '行动', definition: '拿着强牌故意示弱（过牌或小额跟注），诱导对手下注。' },
  { term: '同花', termEn: 'Flush', category: '牌型', definition: '五张相同花色的牌。' },
  { term: '顺子', termEn: 'Straight', category: '牌型', definition: '五张连续的牌（不限花色）。' },
  { term: '葫芦', termEn: 'Full House', category: '牌型', definition: '三条加一对，如 KKK-JJ。' },
  { term: '三条', termEn: 'Three of a Kind', category: '牌型', definition: '三张相同面值的牌。' },
  { term: '两对', termEn: 'Two Pair', category: '牌型', definition: '两组不同面值的对子。' },
  { term: '暗三', termEn: 'Set', category: '牌型', definition: '手持口袋对（如99），翻牌出9组成三条。隐蔽性强。' },
  { term: '明三', termEn: 'Trips', category: '牌型', definition: '手持一张牌与公共牌两张相同组成三条。' },
  { term: '坚果', termEn: 'Nuts', category: '牌型', definition: '当前牌面能组成的最强牌型。' },
  { term: '听牌', termEn: 'Draw', category: '牌型', definition: '差一张牌就能组成顺子或同花。' },
  { term: 'GTO', termEn: 'Game Theory Optimal', category: '策略', definition: '博弈论最优策略，一种不可被剥削的平衡打法。' },
  { term: '剥削策略', termEn: 'Exploitative', category: '策略', definition: '针对对手的弱点偏离GTO，最大化利润。' },
  { term: '范围', termEn: 'Range', category: '策略', definition: '一个玩家在特定情况下可能持有的所有手牌组合。' },
  { term: '平衡', termEn: 'Balance', category: '策略', definition: '在同一行动中包含价值牌和诈唬牌，让对手无法准确判断。' },
  { term: '频率', termEn: 'Frequency', category: '策略', definition: '某个行动在特定场景中被执行的比例（如raise 70%）。' },
  { term: '诈唬', termEn: 'Bluff', category: '策略', definition: '用弱牌下注/加注，试图让对手弃掉更好的牌。' },
  { term: '薄价值', termEn: 'Thin Value', category: '策略', definition: '用中等强度的牌下注，期望被更差的牌跟注。' },
  { term: '阻隔牌', termEn: 'Blocker', category: '策略', definition: '你手中的牌减少了对手持有某些组合的可能性。' },
  { term: '底池赔率', termEn: 'Pot Odds', category: '数学', definition: '跟注金额与底池总额的比值。决定是否值得跟注。' },
  { term: '补牌', termEn: 'Outs', category: '数学', definition: '能让你的牌变成最强牌的剩余牌数量。' },
  { term: '2-4法则', termEn: 'Rule of 2 and 4', category: '数学', definition: '补牌数×2≈一条街的胜率；补牌数×4≈两条街的胜率。' },
  { term: '期望值', termEn: 'EV', category: '数学', definition: '长期来看某个决策的平均收益。正EV=赚钱，负EV=亏钱。' },
  { term: '隐含赔率', termEn: 'Implied Odds', category: '数学', definition: '除了当前底池，预期后续还能从对手那里赢到的额外筹码。' },
  { term: '弃牌权益', termEn: 'Fold Equity', category: '数学', definition: '通过下注/加注让对手弃牌所获得的价值。' },
  { term: 'SPR', termEn: 'Stack-to-Pot Ratio', category: '数学', definition: '有效筹码与底池的比值。SPR越小，越倾向于全下。' }
]
