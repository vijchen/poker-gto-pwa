export interface PreflopAdvScenario {
  hand: string; position: string; situation: string; question: string
  options: string[]; correctIdx: number; explain: string; difficulty: '入门' | '进阶' | '困难'
}

export const advancedScenarios: PreflopAdvScenario[] = [
  { hand: 'AJs', position: 'CO', situation: 'UTG开池2.5BB', question: 'CO面对UTG开池AJs？', options: ['弃牌', '跟注', '3-bet 7BB'], correctIdx: 2, difficulty: '进阶', explain: 'AJs有位置3-bet隔离或拿下底池。' },
  { hand: 'KQo', position: 'BTN', situation: 'CO开池2.5BB', question: 'BTN面对CO KQo？', options: ['弃牌', '跟注', '3-bet 8BB'], correctIdx: 2, difficulty: '入门', explain: 'KQo BTN对CO标准3-bet。' },
  { hand: '55', position: 'UTG', situation: '无动作', question: 'UTG位55？', options: ['弃牌', '开池2.5BB'], correctIdx: 0, difficulty: '进阶', explain: '55在UTG边缘solver倾向弃牌。' },
  { hand: 'A5s', position: 'SB', situation: 'fold到SB', question: 'SB A5s？', options: ['弃牌', '完成小盲', '加注3BB'], correctIdx: 2, difficulty: '入门', explain: 'A5s对BB标准开池。' },
  { hand: 'TT', position: 'BB', situation: 'BTN开池2.5BB SB弃', question: 'BB TT？', options: ['跟注', '3-bet 9BB', '3-bet 12BB'], correctIdx: 1, difficulty: '进阶', explain: 'TT对BTN宽范围标准3-bet。' },
  { hand: 'QJs', position: 'MP', situation: 'UTG开池2.5BB', question: 'MP QJs？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 1, difficulty: '困难', explain: 'QJs对UTG紧范围跟注更好。' },
  { hand: 'AKo', position: 'UTG', situation: 'UTG开后CO 3-bet 8BB', question: '面对3-bet AKo？', options: ['弃牌', '跟注', '4-bet 20BB'], correctIdx: 2, difficulty: '进阶', explain: 'AKo标准4-bet阻隔AA/KK。' },
  { hand: 'JTo', position: 'CO', situation: 'UTG开UTG+1跟', question: 'CO多人入池JTo？', options: ['弃牌', '跟注', 'squeeze'], correctIdx: 0, difficulty: '困难', explain: 'JTo多人隐含赔率不足弃牌。' },
  { hand: '88', position: 'BB', situation: 'UTG开CO跟BTN跟', question: 'BB三人入池88？', options: ['弃牌', '跟注', 'squeeze'], correctIdx: 1, difficulty: '入门', explain: '88有set mining价值跟注。' },
  { hand: 'A2s', position: 'BTN', situation: 'fold到BTN', question: 'BTN A2s？', options: ['弃牌', '开池2.5BB'], correctIdx: 1, difficulty: '入门', explain: 'BTN标准开池坚果同花潜力。' },
  { hand: 'KK', position: 'SB', situation: 'UTG开CO 3-bet 9BB', question: 'SB KK？', options: ['跟注慢打', '4-bet 25BB', '全押'], correctIdx: 1, difficulty: '进阶', explain: 'KK明确4-bet SB没位置。' },
  { hand: '76s', position: 'CO', situation: 'fold到CO', question: 'CO 76s？', options: ['弃牌', '开池2.5BB'], correctIdx: 1, difficulty: '入门', explain: 'CO标准开池好连接性。' },
  { hand: 'AQo', position: 'MP', situation: 'UTG开池', question: 'MP AQo？', options: ['弃牌', '跟注', '3-bet 8BB'], correctIdx: 2, difficulty: '困难', explain: 'AQo对UTG 3-bet有阻隔牌价值。' },
  { hand: 'J9s', position: 'BB', situation: 'SB limp', question: 'BB J9s？', options: ['过牌', '加注3BB'], correctIdx: 1, difficulty: '入门', explain: 'J9s对limp加注惩罚弱范围。' },
  { hand: 'QQ', position: 'UTG', situation: 'BTN 3-bet后SB cold 4-bet 22BB', question: 'QQ面对cold 4-bet？', options: ['弃牌', '跟注', '5-bet全押'], correctIdx: 1, difficulty: '困难', explain: 'Cold 4-bet极强QQ跟注看翻牌。' }
]
