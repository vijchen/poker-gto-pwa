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
  }
]
