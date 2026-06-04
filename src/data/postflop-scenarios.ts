export interface PostflopScenario {
  id: number
  title: string
  difficulty: '入门' | '进阶' | '困难'
  category: string
  heroCards: [string, string]
  board: string[]
  situation: string
  options: { label: string; action: string }[]
  correctAction: string
  explanation: string
}

export const scenarios: PostflopScenario[] = [
  {
    id: 1, title: 'C-Bet on 干燥牌面', difficulty: '入门', category: 'C-Bet',
    heroCards: ['Ah', 'Kd'], board: ['7s', '3c', '2d'],
    situation: '你在CO位open，BB跟注。翻牌 7♠3♣2♦ 极干燥牌面。BB过牌到你。',
    options: [{ label: '下注 1/3 pot', action: 'bet-small' }, { label: '下注 2/3 pot', action: 'bet-medium' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-small',
    explanation: '干燥牌面上用小额C-Bet（1/3 pot）是GTO高频策略。你有两张高张overcards，对手很难在这个牌面有强牌。小额下注让大部分弱牌弃牌，同时控制底池。'
  },
  {
    id: 2, title: '湿润牌面是否C-Bet', difficulty: '入门', category: 'C-Bet',
    heroCards: ['Qh', 'Qd'], board: ['Js', 'Ts', '8c'],
    situation: '你在BTN位open，BB跟注。翻牌 J♠T♠8♣ 极湿润牌面。BB过牌到你。',
    options: [{ label: '下注 2/3 pot', action: 'bet-medium' }, { label: '下注全pot', action: 'bet-large' }, { label: '过牌', action: 'check' }],
    correctAction: 'check',
    explanation: '湿润牌面上QQ很脆弱。对手跟注范围连接度高（KQ/Q9/97/JT/同花听牌等）。过牌保护你的过牌范围，避免被check-raise。'
  },
  {
    id: 3, title: '顶对顶踢脚', difficulty: '入门', category: '价值下注',
    heroCards: ['As', 'Jd'], board: ['Jh', '7c', '3s'],
    situation: '你在CO位open，BTN跟注。翻牌 J♥7♣3♠。你先行动。',
    options: [{ label: '下注 1/2 pot', action: 'bet-medium' }, { label: '下注全pot', action: 'bet-large' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-medium',
    explanation: 'TPTK在干燥牌面是明确的价值牌。下注1/2底池可以被更差的对子（KJ/QJ/JT）和中对跟注。'
  },
  {
    id: 4, title: '错过翻牌的AK', difficulty: '入门', category: 'C-Bet',
    heroCards: ['As', 'Ks'], board: ['9h', '6c', '2d'],
    situation: '你在UTG open，HJ跟注。翻牌 9♥6♣2♦。你先行动。',
    options: [{ label: '下注 1/3 pot', action: 'bet-small' }, { label: '下注 2/3 pot', action: 'bet-medium' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-small',
    explanation: 'AK没有击中但有6张outs。干燥低牌面上你的范围优势明显，小额C-Bet既是诈唬也有改进equity。'
  },
  {
    id: 5, title: '同花完成了', difficulty: '入门', category: '价值下注',
    heroCards: ['Ad', '5d'], board: ['Kd', '8d', '3c', '7d'],
    situation: '翻牌K♦8♦3♣你过牌。转牌7♦完成坚果同花。BB再次过牌。',
    options: [{ label: '下注 1/3 pot', action: 'bet-small' }, { label: '下注 3/4 pot', action: 'bet-large' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-large',
    explanation: '坚果同花（A高flush）应该下大注榨取价值。对手可能有Kx、小同花、两对等会跟注的牌。3/4底池是GTO的value sizing。'
  },
  {
    id: 6, title: 'Check-Raise 诈唬', difficulty: '进阶', category: '过牌加注',
    heroCards: ['6s', '5s'], board: ['As', '9s', '2c'],
    situation: '你在BB位防守vs CO open。翻牌 A♠9♠2♣。CO下注1/2底池。',
    options: [{ label: '跟注', action: 'call' }, { label: 'Check-Raise 3x', action: 'raise' }, { label: '弃牌', action: 'fold' }],
    correctAction: 'raise',
    explanation: '同花听牌（9 outs）+ 后门顺子。有坚果同花听牌时check-raise是GTO标准诈唬，可以代表A或暗三，即使被跟注仍有~35% equity。'
  },
  {
    id: 7, title: '面对C-Bet的浮牌', difficulty: '进阶', category: '防守',
    heroCards: ['Jh', 'Th'], board: ['Ac', '8c', '4d'],
    situation: '你在BTN跟注CO的open。翻牌 A♣8♣4♦。CO下注1/3底池。',
    options: [{ label: '跟注（浮牌）', action: 'call' }, { label: '加注', action: 'raise' }, { label: '弃牌', action: 'fold' }],
    correctAction: 'call',
    explanation: '面对小额C-Bet需要足够防守频率。JTs有后门同花和后门顺子，浮牌跟注一条街如果转牌对手过牌可以偷底池。'
  },
  {
    id: 8, title: '河牌该不该诈唬', difficulty: '进阶', category: '诈唬',
    heroCards: ['Qd', 'Jc'], board: ['Ks', '9h', '4c', '2d', '6s'],
    situation: '你在CO open，BTN跟注。翻牌C-Bet被跟注，转牌过牌，河牌到你。',
    options: [{ label: '下注 2/3 pot', action: 'bet-medium' }, { label: '下注全pot', action: 'bet-large' }, { label: '过牌放弃', action: 'check' }],
    correctAction: 'check',
    explanation: 'QJ不阻隔Kx（对手顶对），对手翻牌跟注代表有牌力。QJ有少量showdown value偶尔赢。过牌放弃是正确选择。'
  },
  {
    id: 9, title: '慢打set', difficulty: '进阶', category: '慢打',
    heroCards: ['Kh', 'Kd'], board: ['Kc', '7s', '2h'],
    situation: '3-bet pot，你跟注对手3-bet。翻牌 K♣7♠2♥。你先行动。',
    options: [{ label: '下注 1/3 pot', action: 'bet-small' }, { label: '下注 2/3 pot', action: 'bet-medium' }, { label: '过牌', action: 'check' }],
    correctAction: 'check',
    explanation: '顶暗三极强但板面干燥。3-bet pot中对手代表强牌(AA/QQ/AK)，过牌让对手继续用AA下注或转牌"诈唬"，后续check-raise榨取更多价值。'
  },
  {
    id: 10, title: '多人底池谨慎', difficulty: '进阶', category: '多人底池',
    heroCards: ['Ac', 'Qh'], board: ['Qd', '9s', '5c'],
    situation: '你在MP open，CO和BB都跟注（3人底池）。翻牌 Q♦9♠5♣。BB过牌到你。',
    options: [{ label: '下注 1/2 pot', action: 'bet-medium' }, { label: '下注 1/3 pot', action: 'bet-small' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-medium',
    explanation: 'AQ是TPTK，多人底池中仍足够强。1/2底池保护免受听牌追赶，从Qx弱踢脚和中对获取价值。'
  },
  {
    id: 11, title: '薄价值河牌下注', difficulty: '困难', category: '薄价值',
    heroCards: ['As', 'Ts'], board: ['Ac', '8d', '4h', '3c', '7s'],
    situation: '翻牌你C-Bet对手跟注。转牌过牌过牌。河牌7♠。你先行动。',
    options: [{ label: '下注 1/3 pot', action: 'bet-small' }, { label: '下注 2/3 pot', action: 'bet-medium' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-small',
    explanation: 'AT顶对中等踢脚。小额下注（1/3 pot）可以被A弱踢脚和中对跟注，是经典thin value bet。下大了只被更强的牌跟注。'
  },
  {
    id: 12, title: '面对超池下注', difficulty: '困难', category: '防守',
    heroCards: ['Kh', 'Qh'], board: ['Kd', 'Jc', '5s', '3h', '9c'],
    situation: '翻牌你下注对手跟注，转牌过牌过牌。河牌9♣，对手下注1.5x底池（超池）。',
    options: [{ label: '跟注', action: 'call' }, { label: '弃牌', action: 'fold' }, { label: '加注', action: 'raise' }],
    correctAction: 'fold',
    explanation: '超池下注代表极化范围。对手价值范围有两对+和顺子(QT)。KQ只赢诈唬，但这条线路诈唬频率很低。弃牌正确。'
  },
  {
    id: 13, title: '阻隔牌诈唬', difficulty: '困难', category: '诈唬',
    heroCards: ['Ad', 'Jh'], board: ['Ks', 'Qs', '8c', '4d', 'Ts'],
    situation: '河牌T♠完成同花和顺子。你先行动。',
    options: [{ label: '下注 3/4 pot', action: 'bet-large' }, { label: '下注 1/3 pot', action: 'bet-small' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-large',
    explanation: '经典阻隔牌诈唬。A阻隔了对手坚果同花(As)组合，J完成了Broadway顺子(AKQJT)的代表。大注诈唬可信度高，对手没有同花/顺子时很难用Kx跟注。'
  },
  {
    id: 14, title: '转牌过牌控池', difficulty: '困难', category: '控池',
    heroCards: ['Th', 'Tc'], board: ['Qs', '7c', '3d', 'Jh'],
    situation: '翻牌Q♠7♣3♦你C-Bet 1/3，对手跟注。转牌J♥。你先行动。',
    options: [{ label: '下注 1/3 pot', action: 'bet-small' }, { label: '下注 2/3 pot', action: 'bet-medium' }, { label: '过牌', action: 'check' }],
    correctAction: 'check',
    explanation: 'TT在Q-J高牌面上很尴尬，输给QX和JX。转牌J增加对手的顶对/两对组合。过牌控制底池到摊牌。'
  },
  {
    id: 15, title: '河牌坚果full house', difficulty: '困难', category: '价值下注',
    heroCards: ['Ac', 'Ah'], board: ['Kd', '7h', '2s', '5c', 'Kh'],
    situation: '3-bet pot，翻牌你下注对手跟注，转牌过牌过牌。河牌K♥配对。你先行动。',
    options: [{ label: '下注 1/4 pot', action: 'bet-small' }, { label: '下注全pot', action: 'bet-large' }, { label: '过牌', action: 'check' }],
    correctAction: 'bet-large',
    explanation: 'AA变成full house(AAK)，3-bet pot中你有坚果优势。对手可能有77/55等口袋对会当bluff catcher跟注。全底池榨取最大价值。'
  },
  { id: 16, title: '干燥面小注高频', difficulty: '入门', category: 'C-Bet', heroCards: ['Kd', 'Qd'], board: ['Ah', '7c', '2s'], situation: 'CO open BTN跟。翻牌A♥7♣2♠极干燥。你先行动。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-small', explanation: '干燥A高面你有范围优势。小注高频下注让对手难以应对。' },
  { id: 17, title: '配对面暗三', difficulty: '入门', category: '价值下注', heroCards: ['7h', '7d'], board: ['7s', 'Kc', '3d'], situation: 'MP open CO跟。翻牌7♠K♣3♦。你先行动。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-small', explanation: '底set极强。小注从Kx和中对获取价值。' },
  { id: 18, title: '河牌弱对showdown', difficulty: '入门', category: '控池', heroCards: ['Ah', '9h'], board: ['9c', '5d', '2s', 'Jh', '4c'], situation: '翻牌C-Bet对手跟，转牌J♥过牌过牌。河牌4♣。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'check', explanation: '中对在J出来后变弱。过牌到摊牌。' },
  { id: 19, title: '顶对面对加注', difficulty: '进阶', category: '防守', heroCards: ['As', 'Jc'], board: ['Jh', '8d', '3c'], situation: 'BTN open BB跟。翻牌C-Bet 1/3，BB check-raise 3倍。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '再加注', action: 'raise' }], correctAction: 'call', explanation: 'AJ顶对顶踢不能弃也不值得再加注。跟注看转牌。' },
  { id: 20, title: '两头顺完成', difficulty: '入门', category: '价值下注', heroCards: ['9s', '8s'], board: ['Tc', '7h', '2d', '6c'], situation: '翻牌跟C-Bet。转牌6♣完成顺子。对手再注1/2池。', options: [{ label: '跟注', action: 'call' }, { label: '加注3x', action: 'raise' }, { label: '弃牌', action: 'fold' }], correctAction: 'raise', explanation: '坚果顺子加注榨取价值！' },
  { id: 21, title: '多人底池顶对', difficulty: '进阶', category: '多人底池', heroCards: ['Kh', 'Jh'], board: ['Kd', '9s', '6c'], situation: '3人底池。翻牌K♦9♠6♣。BB过牌到你。', options: [{ label: '下注1/2', action: 'bet-medium' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'bet-medium', explanation: '3人底池KJ顶对好踢够强下注。' },
  { id: 22, title: '翻牌两对大注', difficulty: '进阶', category: '价值下注', heroCards: ['Ks', 'Ts'], board: ['Kh', 'Td', '4c'], situation: 'BTN open BB跟。翻牌K♥T♦4♣。BB过牌。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-medium', explanation: '两对干燥面非常强。2/3池从Kx/Tx获取价值。' },
  { id: 23, title: '全花面无牌力', difficulty: '进阶', category: '弃牌', heroCards: ['Qc', 'Jd'], board: ['As', '8s', '3s'], situation: '翻牌A♠8♠3♠全花面。你先行动。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'check', explanation: 'QJ无黑桃在全花面零equity。过牌放弃。' },
  { id: 24, title: '转牌semi-bluff', difficulty: '进阶', category: '诈唬', heroCards: ['Th', '9h'], board: ['Jh', '5h', '2c', 'Kd'], situation: '翻牌跟C-Bet(花+顺听)。转牌K♦对手过牌。', options: [{ label: '下注2/3', action: 'bet-medium' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'bet-medium', explanation: '对手过牌示弱。12 outs强听牌semi-bluff拿底池或继续追。' },
  { id: 25, title: '河牌set全押', difficulty: '困难', category: '价值下注', heroCards: ['Qh', 'Qc'], board: ['Qd', '8s', '4c', '2h', '7d'], situation: '3-bet pot翻牌下注跟转牌下注跟。河牌7♦对手过牌。', options: [{ label: '下注1/2', action: 'bet-medium' }, { label: '全押', action: 'bet-large' }, { label: '过牌', action: 'check' }], correctAction: 'bet-large', explanation: '顶set极强。对手跟两街有88/44/overpair全押最大化。' },
  { id: 26, title: '面对全押AK', difficulty: '困难', category: '防守', heroCards: ['Ad', 'Kd'], board: ['Ac', 'Ts', '5h', '3d', '9c'], situation: '翻牌下注跟转牌过牌过牌。河牌9♣对手全押(1.2x pot)。', options: [{ label: '跟注', action: 'call' }, { label: '弃牌', action: 'fold' }], correctAction: 'call', explanation: 'AK顶对顶踢强bluff catcher。底池赔率只需30%+。跟。' },
  { id: 27, title: 'Donk bet应对', difficulty: '困难', category: '防守', heroCards: ['Jd', 'Jc'], board: ['8h', '5c', '2d'], situation: 'BB主动donk 3/4池。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '加注', action: 'raise' }], correctAction: 'raise', explanation: 'JJ overpair在低面很强。加注惩罚donk的中等牌力。' },
  { id: 28, title: 'Double barrel', difficulty: '进阶', category: 'C-Bet', heroCards: ['Ah', 'Qh'], board: ['Kc', '7d', '3s', '2h'], situation: '翻牌C-Bet 1/3跟。转牌2♥。', options: [{ label: '下注2/3', action: 'bet-medium' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'bet-medium', explanation: 'AQ overcards+后门花。Double barrel继续施压代表Kx。' },
  { id: 29, title: '河牌错过听牌', difficulty: '困难', category: '弃牌', heroCards: ['6d', '5d'], board: ['9d', '8d', '2c', 'Kh', 'Js'], situation: '翻牌跟(花+顺听)转牌过牌过牌。河牌J♠对手下注1/2。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '加注', action: 'raise' }], correctAction: 'fold', explanation: '65d错过所有听牌0 value。简单弃牌。' },
  { id: 30, title: '小底池偷池', difficulty: '入门', category: '诈唬', heroCards: ['Ac', '2c'], board: ['Kh', 'Jd', '5s', '9c'], situation: '翻牌双方过牌。转牌9♣你先行动。', options: [{ label: '下注2/3', action: 'bet-medium' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'bet-small', explanation: '双方过牌后对手范围弱。小注尝试拿下底池。' },
  { id: 31, title: '坚果花听过牌', difficulty: '进阶', category: '控池', heroCards: ['As', 'Ks'], board: ['Qs', '7s', '3h'], situation: 'BTN open BB跟。翻牌Q♠7♠3♥ BB过牌到你。', options: [{ label: '下注2/3', action: 'bet-medium' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'check', explanation: 'AKs坚果花听+overcards。过牌诱导对手转牌bluff或免费看牌。' },
  { id: 32, title: '河牌thin value', difficulty: '困难', category: '薄价值', heroCards: ['Kd', 'Jd'], board: ['Kh', '9c', '4s', '2d', '6h'], situation: '翻牌下注跟转牌过牌过牌。河牌6♥。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-small', explanation: 'KJ顶对好踢。小注从K弱踢和中对获取薄价值。' },
  { id: 33, title: 'Combo draw加注', difficulty: '进阶', category: '过牌加注', heroCards: ['8c', '7c'], board: ['9c', '6c', '2h'], situation: 'BB防守。CO下注1/3池。你有花+顺combo。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: 'Check-raise', action: 'raise' }], correctAction: 'raise', explanation: '15 outs怪兽听牌！Check-raise最佳：对手常弃直接赢，被跟有60%+equity。' },
  { id: 34, title: '低面overpair', difficulty: '入门', category: '价值下注', heroCards: ['Ts', 'Td'], board: ['6h', '4c', '2d'], situation: 'CO open BB跟。翻牌6♥4♣2♦ BB过牌。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-medium', explanation: 'TT低面overpair。2/3池保护+价值。' },
  { id: 35, title: '三桶放弃', difficulty: '困难', category: '诈唬', heroCards: ['As', '5s'], board: ['Kh', 'Qd', '8c', '3s', 'Js'], situation: '翻牌C-Bet跟转牌下注跟。河牌J♠。', options: [{ label: '下注全pot', action: 'bet-large' }, { label: '下注1/2', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'check', explanation: '对手跟两街有牌力。A5s不阻隔跟注范围三桶风险大。放弃。' },
  { id: 36, title: '小注信号', difficulty: '入门', category: '防守', heroCards: ['Ad', 'Td'], board: ['Ks', '9h', '4c', '7d', '2s'], situation: '全程过牌。河牌对手突然小注1/4池。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '加注', action: 'raise' }], correctAction: 'call', explanation: 'AT A高可能最好。小注通常薄价值/小诈唬。跟注。' },
  { id: 37, title: 'Overbet价值set', difficulty: '困难', category: '价值下注', heroCards: ['9d', '9c'], board: ['9h', '5s', '2c', 'Kd', '3h'], situation: '翻牌小注跟，转牌K♦过牌过牌。河牌3♥。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注全pot', action: 'bet-large' }, { label: '过牌', action: 'check' }], correctAction: 'bet-large', explanation: '暗三极强隐蔽。转牌K让对手Kx觉得好牌。大注榨取。' },
  { id: 38, title: 'Double barrel弃', difficulty: '进阶', category: '防守', heroCards: ['8d', '8c'], board: ['Ac', 'Ks', '4h', '7d'], situation: '翻牌跟C-Bet。转牌7♦对手再注2/3。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '加注', action: 'raise' }], correctAction: 'fold', explanation: '88在AK面极弱。连续两街下注代表Ax/Kx以上。弃牌。' },
  { id: 39, title: '底set保护', difficulty: '入门', category: '过牌加注', heroCards: ['5h', '5d'], board: ['Jc', '8s', '5c'], situation: 'BB防守。CO下注1/3池。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: 'Check-raise', action: 'raise' }], correctAction: 'raise', explanation: '底set在湿面必须加注保护！不让听牌免费看。' },
  { id: 40, title: 'AA bluff catch', difficulty: '困难', category: '防守', heroCards: ['As', 'Ah'], board: ['Kd', 'Qh', '7c', '3s', '5d'], situation: '3-bet pot一路check-call。河牌对手全押(1x pot)。', options: [{ label: '跟注', action: 'call' }, { label: '弃牌', action: 'fold' }], correctAction: 'call', explanation: 'AA强bluff catcher。对手有错过听牌的诈唬。底池赔率33%够格跟。' },
  { id: 41, title: '急转弯A来了', difficulty: '进阶', category: '控池', heroCards: ['Qd', 'Qh'], board: ['Jc', '8h', '4s', 'Ac'], situation: '翻牌C-Bet跟。转牌A♣你先行动。', options: [{ label: '下注2/3', action: 'bet-medium' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'check', explanation: '转牌A对你最差。对手范围很多Ax。QQ现在弱了过牌控池。' },
  { id: 42, title: '后门花完成', difficulty: '困难', category: '价值下注', heroCards: ['Th', '9h'], board: ['Kc', 'Jd', '5h', '3h', 'Qh'], situation: '翻牌C-Bet跟转牌下注跟。河牌Q♥完成后门同花！', options: [{ label: '下注全pot', action: 'bet-large' }, { label: '下注1/2', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-large', explanation: '河牌完成后门同花(T高flush)。大注从Kx和弱牌获取最大价值。' },
  { id: 43, title: 'Squeeze pot OOP', difficulty: '困难', category: 'C-Bet', heroCards: ['Ad', 'Jd'], board: ['Qc', '9h', '4d'], situation: 'BB squeeze只UTG跟。翻牌Q♣9♥4♦你先行动。', options: [{ label: '下注1/3', action: 'bet-small' }, { label: '下注2/3', action: 'bet-medium' }, { label: '过牌', action: 'check' }], correctAction: 'bet-small', explanation: 'Squeeze pot有范围优势。AJ小注C-Bet利用主动权。' },
  { id: 44, title: '坚果顺等C-Bet', difficulty: '进阶', category: '慢打', heroCards: ['6s', '5s'], board: ['7c', '4d', '3h'], situation: 'BB防守翻牌7♣4♦3♥你做成坚果顺子。', options: [{ label: '过牌', action: 'check' }, { label: 'Donk 1/3', action: 'bet-small' }, { label: 'Donk 2/3', action: 'bet-medium' }], correctAction: 'check', explanation: '坚果顺低面极强隐蔽。过牌让对手C-Bet然后check-raise最大化价值。' },
  { id: 45, title: 'Paired board弃', difficulty: '困难', category: '诈唬', heroCards: ['As', 'Qs'], board: ['8h', '8c', '3d', 'Kd', '5s'], situation: '翻牌C-Bet跟转牌下注跟。河牌5♠。', options: [{ label: '下注全pot', action: 'bet-large' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'check', explanation: '配对面对手跟两街可能有8x/Kx。AQ不阻隔跟注范围放弃。' },
  { id: 46, title: 'KQ跟注C-Bet', difficulty: '入门', category: '防守', heroCards: ['Kh', 'Qs'], board: ['Kd', '6c', '2h'], situation: 'BB防守 翻牌K♦6♣2♥ 对手C-Bet 1/3。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: 'Check-raise', action: 'raise' }], correctAction: 'call', explanation: 'KQ顶对好踢足够强跟注。保持对手范围宽后续提取价值。' },
  { id: 47, title: '中对+顺draw', difficulty: '进阶', category: '防守', heroCards: ['Jh', 'Ts'], board: ['Jd', '9c', '3h', 'As'], situation: '翻牌C-Bet跟。转牌A♠你过牌对手下注2/3。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '加注', action: 'raise' }], correctAction: 'call', explanation: 'JT中对+顺draw(Q完成)。跟注看河有4张Q做坚果。' },
  { id: 48, title: '短筹码全押', difficulty: '入门', category: '价值下注', heroCards: ['Ac', 'Kc'], board: ['Ah', '7d', '2c'], situation: '剩余筹码=底池。翻牌A♥7♦2♣对手过牌。', options: [{ label: '全押', action: 'bet-large' }, { label: '下注1/3', action: 'bet-small' }, { label: '过牌', action: 'check' }], correctAction: 'bet-large', explanation: '短筹码SPR=1 + TPTK直接全押。不需多条街。' },
  { id: 49, title: '河牌惊喜set', difficulty: '困难', category: '价值下注', heroCards: ['4s', '4d'], board: ['Th', '8c', '3s', '5d', '4h'], situation: '翻牌过牌转牌小注跟。河牌4♥做成set！', options: [{ label: '下注1/4', action: 'bet-small' }, { label: '下注全pot', action: 'bet-large' }, { label: '过牌', action: 'check' }], correctAction: 'bet-large', explanation: '河牌惊喜set！对手跟转牌有牌力。全pot极化获取最大价值。' },
  { id: 50, title: '面对min-raise', difficulty: '进阶', category: '防守', heroCards: ['Ah', 'Kh'], board: ['As', 'Jc', '5d'], situation: 'C-Bet 1/2池 BB min-raise 2.5倍。', options: [{ label: '弃牌', action: 'fold' }, { label: '跟注', action: 'call' }, { label: '再加注', action: 'raise' }], correctAction: 'call', explanation: 'AK顶对顶踢对min-raise足够强跟。不需弃也不需升级。' }
]
