<template>
  <div class="quiz-page">
    <h2 class="page-title">🧠 术语测验</h2>
    <div class="stats-bar">
      <span class="stat">正确 <strong>{{ correct }}/{{ total }}</strong></span>
      <span class="stat">正确率 <strong>{{ accuracy }}%</strong></span>
    </div>
    <div v-if="currentQ" class="quiz-card">
      <p class="question">{{ currentQ.question }}</p>
      <div class="options">
        <button v-for="(opt, idx) in currentQ.options" :key="idx"
          :class="['opt-btn', optClass(idx)]" :disabled="answered" @click="answer(idx)">{{ opt }}</button>
      </div>
      <div v-if="answered" class="explain"><strong>解析：</strong>{{ currentQ.explain }}</div>
      <button v-if="answered" class="btn-next" @click="next">下一题 →</button>
    </div>
    <div v-else class="complete">
      <p>🎉 全部完成！正确率 {{ accuracy }}%</p>
      <button class="btn-next" @click="reset">重新开始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface QuizItem { question: string; options: string[]; correctIdx: number; explain: string }

const quizData: QuizItem[] = [
  { question: '翻前第一个行动的位置？', options: ['BTN', 'SB', 'UTG', 'CO'], correctIdx: 2, explain: 'UTG在大盲左边翻前最先行动。' },
  { question: '"翻牌"Flop是？', options: ['最后一张公共牌', '前三张公共牌', '你的底牌', '第四张公共牌'], correctIdx: 1, explain: 'Flop是同时翻出的前三张公共牌。' },
  { question: '什么是"坚果"Nuts？', options: ['一种诈唬', '当前最强可能牌型', '口袋对AA', '弃牌术语'], correctIdx: 1, explain: '当前牌面可能的最强牌型。' },
  { question: '底池赔率帮助判断？', options: ['该不该诈唬', '该不该跟注', '该不该全押', '开池大小'], correctIdx: 1, explain: '和equity比较判断跟注是否+EV。' },
  { question: '什么是3-Bet？', options: ['下注三倍池', '对开池加注的再加注', '三张公共牌后下注', '三人跟注'], correctIdx: 1, explain: '大盲=1bet，开池=2bet，再加注=3-bet。' },
  { question: '翻后最后行动的位置？', options: ['UTG', 'BB', 'SB', 'BTN'], correctIdx: 3, explain: 'BTN翻后最后行动信息优势最大。' },
  { question: 'C-Bet是？', options: ['第一次下注', '跟注后下注', '翻前加注者翻牌继续下注', '最强牌下注'], correctIdx: 2, explain: 'Continuation Bet利用翻前主动权。' },
  { question: '什么是EV？', options: ['额外价值', '期望值', '权益变化', '紧急弃牌'], correctIdx: 1, explain: 'Expected Value长期平均收益。' },
  { question: '同花听牌几个Outs？', options: ['4', '6', '8', '9'], correctIdx: 3, explain: '13张同花-已出现4张=9张outs。' },
  { question: '什么是半诈唬？', options: ['下注半池', '用听牌下注施压', '弱对子下注', '弃牌后装强'], correctIdx: 1, explain: '被跟注还有机会做成强牌。' },
  { question: 'Kicker踢脚牌决定？', options: ['谁先行动', '同等牌型胜负', '下注大小', '能否加注'], correctIdx: 1, explain: '同牌型时踢脚决定胜负。' },
  { question: 'Tilt是？', options: ['倾斜桌面', '情绪失控导致差决策', '特殊加注', '翻前弃牌'], correctIdx: 1, explain: '情绪波动导致非理性决策。' },
  { question: '两头顺子听牌几个Outs？', options: ['4', '6', '8', '12'], correctIdx: 2, explain: '两端各4张共8张。' },
  { question: '2-4法则翻牌outs乘以？', options: ['2', '3', '4', '5'], correctIdx: 2, explain: '翻牌outs×4≈两张牌胜率%。' },
  { question: '什么是慢打Slow Play？', options: ['打得慢被罚', '强牌故意示弱', '减少下注', '跟注所有'], correctIdx: 1, explain: '引诱对手后面诈唬或付更多。' },
  { question: '阻隔牌Blocker作用？', options: ['阻止对手下注', '减少对手某些组合', '封锁位置', '挡住公共牌'], correctIdx: 1, explain: '如持A♠降低对手坚果同花概率。' },
  { question: '隐含赔率考虑？', options: ['只看当前底池', '后续能赢额外筹码', '对手手牌', '翻前投入'], correctIdx: 1, explain: '做成强牌后还能赢的筹码。' },
  { question: 'Gutshot卡顺几个Outs？', options: ['2', '4', '8', '9'], correctIdx: 1, explain: '中间缺一张只有4张outs。' },
  { question: '口袋对Pocket Pair是？', options: ['公共牌对子', '底牌是一对', '同花色的牌', '连续两张'], correctIdx: 1, explain: '两张底牌是一对如KK。' },
  { question: '转牌也叫？', options: ['第三街', '第四街', '第五街', '第六街'], correctIdx: 1, explain: 'Turn=4th Street第四张公共牌。' }
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }; return a
}

const questions = ref(shuffle(quizData))
const currentIdx = ref(0)
const answered = ref(false)
const selectedIdx = ref(-1)
const correct = ref(0)
const total = ref(0)

const currentQ = computed(() => questions.value[currentIdx.value] || null)
const accuracy = computed(() => total.value === 0 ? 0 : Math.round((correct.value / total.value) * 100))

function optClass(idx: number): string {
  if (!answered.value) return ''
  if (idx === currentQ.value!.correctIdx) return 'correct'
  if (idx === selectedIdx.value && idx !== currentQ.value!.correctIdx) return 'wrong'
  return 'dim'
}
function answer(idx: number) { selectedIdx.value = idx; answered.value = true; total.value++; if (idx === currentQ.value!.correctIdx) correct.value++ }
function next() { currentIdx.value++; answered.value = false; selectedIdx.value = -1 }
function reset() { questions.value = shuffle(quizData); currentIdx.value = 0; correct.value = 0; total.value = 0; answered.value = false }
</script>

<style scoped>
.quiz-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-family: var(--font-display); font-size: 20px; font-weight: 800; margin-bottom: 12px; }
.stats-bar { display: flex; gap: 16px; margin-bottom: 16px; }
.stat { font-size: 13px; color: var(--text-secondary); }
.stat strong { color: var(--accent-green); }
.quiz-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; }
.question { font-size: 16px; font-weight: 700; margin-bottom: 16px; line-height: 1.5; }
.options { display: flex; flex-direction: column; gap: 8px; }
.opt-btn { padding: 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--bg-glass); color: var(--text-primary); font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; transition: all 0.2s; }
.opt-btn.correct { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4); color: #34d399; }
.opt-btn.wrong { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #f87171; }
.opt-btn.dim { opacity: 0.4; }
.opt-btn:disabled { cursor: default; }
.explain { margin-top: 14px; padding: 12px; background: rgba(251,191,36,0.06); border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.explain strong { color: var(--accent-gold); }
.btn-next { margin-top: 14px; width: 100%; padding: 12px; border: none; border-radius: var(--radius-md); background: var(--accent-green-dim); color: var(--accent-green); font-size: 14px; font-weight: 700; cursor: pointer; }
.complete { text-align: center; padding: 40px 0; color: var(--text-secondary); }
.complete p { margin-bottom: 16px; }
</style>
