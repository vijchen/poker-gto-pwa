export interface PreflopAdvScenario {
  hand: string; position: string; situation: string; question: string
  options: string[]; correctIdx: number; explain: string; difficulty: '入门' | '进阶' | '困难'
  category?: 'open' | 'vs-open' | 'vs-3bet' | 'squeeze' | 'vs-4bet' | 'sb-vs-bb' | 'cold-call' | 'bb-defense'
}

export const advancedScenarios: PreflopAdvScenario[] = [
  // === 原有 15 题（保留）===
  { hand: 'AJs', position: 'CO', situation: 'UTG开池2.5BB', question: 'CO面对UTG开池AJs？', options: ['弃牌', '跟注', '3-bet 7BB'], correctIdx: 2, difficulty: '进阶', explain: 'AJs有位置3-bet隔离或拿下底池。', category: 'vs-open' },
  { hand: 'KQo', position: 'BTN', situation: 'CO开池2.5BB', question: 'BTN面对CO KQo？', options: ['弃牌', '跟注', '3-bet 8BB'], correctIdx: 2, difficulty: '入门', explain: 'KQo BTN对CO标准3-bet。', category: 'vs-open' },
  { hand: '55', position: 'UTG', situation: '无动作', question: 'UTG位55？', options: ['弃牌', '开池2.5BB'], correctIdx: 0, difficulty: '进阶', explain: '55在UTG边缘solver倾向弃牌。', category: 'open' },
  { hand: 'A5s', position: 'SB', situation: 'fold到SB', question: 'SB A5s？', options: ['弃牌', '完成小盲', '加注3BB'], correctIdx: 2, difficulty: '入门', explain: 'A5s对BB标准开池。', category: 'sb-vs-bb' },
  { hand: 'TT', position: 'BB', situation: 'BTN开池2.5BB SB弃', question: 'BB TT？', options: ['跟注', '3-bet 9BB', '3-bet 12BB'], correctIdx: 1, difficulty: '进阶', explain: 'TT对BTN宽范围标准3-bet。', category: 'bb-defense' },
  { hand: 'QJs', position: 'MP', situation: 'UTG开池2.5BB', question: 'MP QJs？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 1, difficulty: '困难', explain: 'QJs对UTG紧范围跟注更好。', category: 'vs-open' },
  { hand: 'AKo', position: 'UTG', situation: 'UTG开后CO 3-bet 8BB', question: '面对3-bet AKo？', options: ['弃牌', '跟注', '4-bet 20BB'], correctIdx: 2, difficulty: '进阶', explain: 'AKo标准4-bet阻隔AA/KK。', category: 'vs-3bet' },
  { hand: 'JTo', position: 'CO', situation: 'UTG开UTG+1跟', question: 'CO多人入池JTo？', options: ['弃牌', '跟注', 'squeeze'], correctIdx: 0, difficulty: '困难', explain: 'JTo多人隐含赔率不足弃牌。', category: 'squeeze' },
  { hand: '88', position: 'BB', situation: 'UTG开CO跟BTN跟', question: 'BB三人入池88？', options: ['弃牌', '跟注', 'squeeze'], correctIdx: 1, difficulty: '入门', explain: '88有set mining价值跟注。', category: 'bb-defense' },
  { hand: 'A2s', position: 'BTN', situation: 'fold到BTN', question: 'BTN A2s？', options: ['弃牌', '开池2.5BB'], correctIdx: 1, difficulty: '入门', explain: 'BTN标准开池坚果同花潜力。', category: 'open' },
  { hand: 'KK', position: 'SB', situation: 'UTG开CO 3-bet 9BB', question: 'SB KK？', options: ['跟注慢打', '4-bet 25BB', '全押'], correctIdx: 1, difficulty: '进阶', explain: 'KK明确4-bet SB没位置。', category: 'vs-3bet' },
  { hand: '76s', position: 'CO', situation: 'fold到CO', question: 'CO 76s？', options: ['弃牌', '开池2.5BB'], correctIdx: 1, difficulty: '入门', explain: 'CO标准开池好连接性。', category: 'open' },
  { hand: 'AQo', position: 'MP', situation: 'UTG开池', question: 'MP AQo？', options: ['弃牌', '跟注', '3-bet 8BB'], correctIdx: 2, difficulty: '困难', explain: 'AQo对UTG 3-bet有阻隔牌价值。', category: 'vs-open' },
  { hand: 'J9s', position: 'BB', situation: 'SB limp', question: 'BB J9s？', options: ['过牌', '加注3BB'], correctIdx: 1, difficulty: '入门', explain: 'J9s对limp加注惩罚弱范围。', category: 'bb-defense' },
  { hand: 'QQ', position: 'UTG', situation: 'BTN 3-bet后SB cold 4-bet 22BB', question: 'QQ面对cold 4-bet？', options: ['弃牌', '跟注', '5-bet全押'], correctIdx: 1, difficulty: '困难', explain: 'Cold 4-bet极强QQ跟注看翻牌。', category: 'vs-4bet' },

  // === 新增 35 题 ===

  // --- Squeeze 场景 (6 题) ---
  { hand: 'AQs', position: 'BB', situation: 'CO开池2.5BB BTN跟注', question: 'BB AQs squeeze？', options: ['跟注', '3-bet 10BB', '3-bet 14BB'], correctIdx: 2, difficulty: '进阶', explain: 'BB对CO+BTN squeeze，AQs有阻隔+花，3-bet大尺寸14BB。', category: 'squeeze' },
  { hand: 'KJs', position: 'SB', situation: 'HJ开池2.5BB CO跟', question: 'SB KJs squeeze？', options: ['弃牌', '跟注', 'squeeze 12BB'], correctIdx: 2, difficulty: '进阶', explain: 'SB没位置必须squeeze或fold，KJs够强。', category: 'squeeze' },
  { hand: 'T9s', position: 'BB', situation: 'MP开池2.5BB HJ跟CO跟', question: 'BB T9s 4人底池？', options: ['跟注', 'squeeze 16BB', '弃牌'], correctIdx: 0, difficulty: '困难', explain: '多人入池squeeze太冒险，T9s隐含赔率好跟注。', category: 'squeeze' },
  { hand: 'AA', position: 'SB', situation: 'UTG开池2.5BB BTN跟', question: 'SB AA squeeze size？', options: ['跟注(慢打)', '3-bet 10BB', '3-bet 14BB'], correctIdx: 2, difficulty: '入门', explain: 'AA squeeze大尺寸最大化价值，没位置不宜慢打。', category: 'squeeze' },
  { hand: '66', position: 'BB', situation: 'CO开池2.5BB BTN跟', question: 'BB 66？', options: ['squeeze 12BB', '跟注', '弃牌'], correctIdx: 1, difficulty: '入门', explain: '66不够强squeeze，跟注set mine。', category: 'squeeze' },
  { hand: 'A9o', position: 'SB', situation: 'HJ开池BTN跟', question: 'SB A9o？', options: ['弃牌', '跟注', 'squeeze 12BB'], correctIdx: 0, difficulty: '困难', explain: 'A9o没位置squeeze太弱，跟注域外边缘，弃牌最优。', category: 'squeeze' },

  // --- vs 4-bet 场景 (6 题) ---
  { hand: 'JJ', position: 'CO', situation: '你3-bet后BTN 4-bet 22BB', question: 'CO JJ面对BTN 4-bet？', options: ['弃牌', '跟注', '5-bet全押'], correctIdx: 1, difficulty: '进阶', explain: 'JJ对BTN的4-bet跟注看翻牌，不够强5-bet也不够弱fold。', category: 'vs-4bet' },
  { hand: 'AKs', position: 'UTG', situation: '你开池后CO 3-bet BTN 4-bet 25BB', question: 'UTG AKs面对冷4-bet？', options: ['弃牌', '跟注', '5-bet全押'], correctIdx: 1, difficulty: '困难', explain: '冷4-bet极强范围，AKs跟注看翻牌，不急5-bet。', category: 'vs-4bet' },
  { hand: 'TT', position: 'HJ', situation: '你3-bet后UTG 4-bet 20BB', question: 'TT面对UTG 4-bet？', options: ['弃牌', '跟注', '全押'], correctIdx: 0, difficulty: '困难', explain: 'UTG 4-bet范围极紧(AA/KK/QQ/AKs)，TT只有30%胜率，弃牌。', category: 'vs-4bet' },
  { hand: 'AA', position: 'BTN', situation: '你3-bet后SB 4-bet 24BB', question: 'BTN AA面对SB 4-bet？', options: ['跟注(隐藏)', '5-bet 55BB', '全押'], correctIdx: 1, difficulty: '入门', explain: 'AA 5-bet标准大小，全押太大没有需要保护的问题。', category: 'vs-4bet' },
  { hand: 'A5s', position: 'CO', situation: '你3-bet后BTN 4-bet 21BB', question: 'CO A5s面对4-bet？', options: ['弃牌', '跟注', '5-bet全押'], correctIdx: 2, difficulty: '困难', explain: 'A5s是经典5-bet bluff候选：坚果阻隔+跟注不好打。', category: 'vs-4bet' },
  { hand: 'KQs', position: 'BTN', situation: '你3-bet后BB 4-bet 24BB', question: 'BTN KQs面对BB 4-bet？', options: ['弃牌', '跟注', '5-bet'], correctIdx: 1, difficulty: '进阶', explain: 'KQs有位置跟注4-bet是标准打法，有阻隔和可玩性。', category: 'vs-4bet' },

  // --- SB vs BB 场景 (6 题) ---
  { hand: 'K7o', position: 'SB', situation: 'fold到SB', question: 'SB K7o？', options: ['弃牌', '完成小盲', '加注2.5BB'], correctIdx: 2, difficulty: '入门', explain: 'SB对BB标准开池，K高够强。', category: 'sb-vs-bb' },
  { hand: '93o', position: 'SB', situation: 'fold到SB', question: 'SB 93o？', options: ['弃牌', '完成小盲', '加注2.5BB'], correctIdx: 0, difficulty: '入门', explain: '93o太弱即使对BB也弃牌，无连接性无高牌。', category: 'sb-vs-bb' },
  { hand: 'T8s', position: 'SB', situation: 'fold到SB', question: 'SB T8s？', options: ['弃牌', '完成小盲', '加注3BB'], correctIdx: 2, difficulty: '入门', explain: 'T8s有同花和连接性，标准开池。', category: 'sb-vs-bb' },
  { hand: 'Q4s', position: 'SB', situation: 'fold到SB', question: 'SB Q4s？', options: ['弃牌', '完成小盲', '加注2.5BB'], correctIdx: 2, difficulty: '进阶', explain: 'Q4s在SB边缘开池，有同花潜力就够了。', category: 'sb-vs-bb' },
  { hand: 'J6o', position: 'SB', situation: 'fold到SB', question: 'SB J6o？', options: ['弃牌', '完成小盲', '加注2.5BB'], correctIdx: 2, difficulty: '进阶', explain: 'J6o SB对BB仍然开池，solver频率约60%。', category: 'sb-vs-bb' },
  { hand: '72o', position: 'SB', situation: 'fold到SB', question: 'SB 72o？', options: ['弃牌', '完成小盲', '加注2.5BB'], correctIdx: 0, difficulty: '入门', explain: '72o最差起手牌之一，即使SB也弃牌。', category: 'sb-vs-bb' },

  // --- Cold Call 场景 (5 题) ---
  { hand: 'JTs', position: 'BTN', situation: 'UTG开池2.5BB MP跟', question: 'BTN JTs cold call？', options: ['弃牌', '跟注', '3-bet 9BB'], correctIdx: 1, difficulty: '进阶', explain: 'JTs隐含赔率极好，有位置cold call多人底池。', category: 'cold-call' },
  { hand: '99', position: 'CO', situation: 'UTG开池2.5BB', question: 'CO 99 对UTG？', options: ['弃牌', '跟注', '3-bet 8BB'], correctIdx: 1, difficulty: '进阶', explain: '99对UTG紧范围3-bet尴尬，跟注set mine有位置。', category: 'cold-call' },
  { hand: 'ATo', position: 'HJ', situation: 'UTG开池2.5BB', question: 'HJ ATo面对UTG开池？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 0, difficulty: '困难', explain: 'ATo对UTG dominated(AQ/AK在范围内)，果断弃牌。', category: 'cold-call' },
  { hand: 'KJs', position: 'CO', situation: 'MP开池2.5BB', question: 'CO KJs面对MP？', options: ['弃牌', '跟注', '3-bet 8BB'], correctIdx: 2, difficulty: '进阶', explain: 'KJs对MP有位置3-bet隔离，比cold call打得更好。', category: 'cold-call' },
  { hand: '76s', position: 'BTN', situation: 'HJ开池2.5BB CO弃', question: 'BTN 76s面对HJ？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 1, difficulty: '入门', explain: '76s在BTN cold call HJ标准打法，隐含赔率好。', category: 'cold-call' },

  // --- BB Defense 场景 (6 题) ---
  { hand: 'K9o', position: 'BB', situation: 'BTN开池2.5BB SB弃', question: 'BB K9o面对BTN？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 1, difficulty: '入门', explain: 'K9o面对BTN宽范围标准防守跟注。', category: 'bb-defense' },
  { hand: 'A4s', position: 'BB', situation: 'CO开池2.5BB BTN弃SB弃', question: 'BB A4s面对CO？', options: ['弃牌', '跟注', '3-bet 9BB'], correctIdx: 2, difficulty: '进阶', explain: 'A4s对CO 3-bet bluff绝佳：坚果同花阻隔+轮盘不差。', category: 'bb-defense' },
  { hand: 'T7s', position: 'BB', situation: 'HJ开池2.5BB', question: 'BB T7s面对HJ？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 1, difficulty: '进阶', explain: 'T7s面对HJ边缘防守，有同花和连接性跟注。', category: 'bb-defense' },
  { hand: '63o', position: 'BB', situation: 'UTG开池2.5BB', question: 'BB 63o面对UTG？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 0, difficulty: '入门', explain: '63o太弱无法防守UTG紧范围。', category: 'bb-defense' },
  { hand: 'QTs', position: 'BB', situation: 'SB开池3BB(fold到SB)', question: 'BB QTs面对SB开池？', options: ['弃牌', '跟注', '3-bet 10BB'], correctIdx: 2, difficulty: '进阶', explain: 'SB宽范围开池，QTs 3-bet夺回主动权。', category: 'bb-defense' },
  { hand: '54s', position: 'BB', situation: 'BTN开池2.5BB SB跟', question: 'BB 54s多人底池？', options: ['弃牌', '跟注', 'squeeze 12BB'], correctIdx: 1, difficulty: '进阶', explain: '54s不够强squeeze，跟注看翻牌。', category: 'bb-defense' },

  // --- 综合进阶场景 (6 题) ---
  { hand: 'AA', position: 'UTG', situation: '100BB深度 无动作', question: 'UTG AA开池大小？', options: ['2BB', '2.5BB', '3BB'], correctIdx: 1, difficulty: '入门', explain: 'AA标准2.5BB开池不暴露手牌强度。', category: 'open' },
  { hand: '97s', position: 'BTN', situation: 'fold到BTN', question: 'BTN 97s？', options: ['弃牌', '开池2.5BB', '开池3BB'], correctIdx: 1, difficulty: '入门', explain: '97s在BTN属于标准开池范围。', category: 'open' },
  { hand: 'AJo', position: 'UTG1', situation: '无动作', question: 'UTG1 AJo？', options: ['弃牌', '开池2.5BB'], correctIdx: 1, difficulty: '进阶', explain: 'AJo在UTG1边缘开池，solver约50-60%频率。', category: 'open' },
  { hand: 'KTo', position: 'MP', situation: 'UTG开池2.5BB', question: 'MP KTo面对UTG？', options: ['弃牌', '跟注', '3-bet'], correctIdx: 0, difficulty: '进阶', explain: 'KTo对UTG紧范围被dominate，无位置优势弃牌。', category: 'vs-open' },
  { hand: 'JJ', position: 'BB', situation: 'UTG开2.5BB CO 3-bet 8BB', question: 'BB JJ cold call 3-bet？', options: ['弃牌', '跟注', '4-bet 22BB'], correctIdx: 1, difficulty: '困难', explain: 'BB JJ cold call 3-bet，没位置4-bet太aggressive。', category: 'cold-call' },
  { hand: 'T9o', position: 'HJ', situation: 'fold到HJ', question: 'HJ T9o？', options: ['弃牌', '开池2.5BB'], correctIdx: 0, difficulty: '困难', explain: 'T9o在HJ不够强开池，solver弃牌频率高。', category: 'open' }
]
