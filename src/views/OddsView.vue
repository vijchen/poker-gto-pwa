<template>
  <div class="odds-page">
    <h2 class="page-title">底池赔率</h2>
    <div class="mode-tabs">
      <button :class="['mode-btn', { active: mode === 'calc' }]" @click="mode = 'calc'">计算器</button>
      <button :class="['mode-btn', { active: mode === 'quiz' }]" @click="mode = 'quiz'">训练题 ({{ quizCorrect }}/{{ quizTotal }})</button>
    </div>

    <template v-if="mode === 'calc'">
      <div class="input-section">
        <div class="input-group"><label>底池大小</label><div class="input-row"><button class="adj-btn" @click="adjustPot(-1)">-</button><span class="input-value">{{ pot }} BB</span><button class="adj-btn" @click="adjustPot(1)">+</button></div></div>
        <div class="input-group"><label>需要跟注</label><div class="input-row"><button class="adj-btn" @click="adjustBet(-0.5)">-</button><span class="input-value">{{ bet }} BB</span><button class="adj-btn" @click="adjustBet(0.5)">+</button></div></div>
        <div class="input-group"><label>补牌数 (Outs)</label><div class="input-row"><button class="adj-btn" @click="adjustOuts(-1)">-</button><span class="input-value">{{ outs }}</span><button class="adj-btn" @click="adjustOuts(1)">+</button></div></div>
      </div>
      <div class="results">
        <div class="result-card"><span class="result-label">底池赔率</span><span class="result-value">{{ potOdds }}%</span></div>
        <div class="result-card"><span class="result-label">你的胜率 (2-4法则)</span><span class="result-value">{{ equity }}%</span></div>
        <div :class="['decision-card', canCall ? 'positive' : 'negative']"><span class="decision-icon">{{ canCall ? '✓' : '✗' }}</span><span class="decision-text">{{ canCall ? '可以跟注 (正EV)' : '应该弃牌 (负EV)' }}</span></div>
      </div>
      <div class="outs-reference"><h3>常见补牌数</h3><div class="outs-grid"><div class="outs-item" v-for="item in outsRef" :key="item.name" @click="outs = item.outs"><span class="outs-num">{{ item.outs }}</span><span class="outs-name">{{ item.name }}</span></div></div></div>
    </template>

    <template v-if="mode === 'quiz'">
      <div v-if="currentQuiz" class="quiz-card">
        <p class="quiz-desc">{{ currentQuiz.desc }}</p>
        <div class="quiz-info"><span>底池: <strong>{{ currentQuiz.pot }}BB</strong></span><span>下注: <strong>{{ currentQuiz.bet }}BB</strong></span><span>Outs: <strong>{{ currentQuiz.outs }}</strong></span><span>{{ currentQuiz.street === 'flop' ? '翻牌' : '转牌' }}</span></div>
        <p class="quiz-question">该跟注吗？</p>
        <div v-if="!quizAnswered" class="quiz-options"><button class="qbtn call" @click="answerQuiz(true)">✓ 跟注</button><button class="qbtn fold" @click="answerQuiz(false)">✗ 弃牌</button></div>
        <div v-else class="quiz-result">
          <div :class="['qresult', quizIsCorrect ? 'correct' : 'wrong']">{{ quizIsCorrect ? '✓ 正确' : '✗ 错误' }}</div>
          <div class="quiz-explain">赔率={{ quizPotOdds }}% | 胜率={{ quizEquity }}% → <strong>{{ quizEquity >= quizPotOdds ? '跟注' : '弃牌' }}</strong></div>
          <button class="btn-next" @click="nextQuiz">下一题 →</button>
        </div>
      </div>
      <div v-else class="complete"><p>🎉 完成！</p><button class="btn-next" @click="resetQuiz">重来</button></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const mode = ref<'calc'|'quiz'>('calc')
const pot = ref(6), bet = ref(2), outs = ref(9)
const potOdds = computed(()=>{const t=pot.value+bet.value;return t===0?0:Math.round((bet.value/t)*100)})
const equity = computed(()=>Math.min(outs.value*4,100))
const canCall = computed(()=>equity.value>=potOdds.value)
const outsRef=[{name:'同花听牌',outs:9},{name:'两头顺听',outs:8},{name:'卡顺听牌',outs:4},{name:'两高张',outs:6},{name:'同花+顺',outs:15},{name:'一对变三条',outs:2}]
function adjustPot(d:number){pot.value=Math.max(0,pot.value+d)}
function adjustBet(d:number){bet.value=Math.max(0.5,bet.value+d)}
function adjustOuts(d:number){outs.value=Math.max(0,Math.min(20,outs.value+d))}

interface OQ{pot:number;bet:number;outs:number;street:'flop'|'turn';desc:string}
const quizData:OQ[]=[
  {pot:100,bet:50,outs:9,street:'flop',desc:'翻牌同花听牌(9 outs)半池'},
  {pot:80,bet:80,outs:8,street:'turn',desc:'转牌两头顺子(8 outs)全池'},
  {pot:120,bet:40,outs:15,street:'flop',desc:'翻牌combo draw(15 outs)1/3池'},
  {pot:200,bet:100,outs:4,street:'turn',desc:'转牌卡顺(4 outs)半池'},
  {pot:60,bet:60,outs:6,street:'flop',desc:'翻牌两高张(6 outs)全池'},
  {pot:150,bet:50,outs:12,street:'flop',desc:'翻牌中对+花draw(12 outs)1/3池'},
  {pot:90,bet:30,outs:2,street:'turn',desc:'转牌只有2张outs 1/3池'},
  {pot:200,bet:150,outs:9,street:'turn',desc:'转牌花draw(9 outs)3/4池'},
  {pot:60,bet:20,outs:4,street:'flop',desc:'翻牌卡顺(4 outs)1/3池'},
  {pot:300,bet:100,outs:8,street:'flop',desc:'翻牌两头顺大底池1/3'},
  {pot:100,bet:100,outs:15,street:'turn',desc:'转牌combo(15 outs)全池'},
  {pot:50,bet:50,outs:6,street:'turn',desc:'转牌overcard(6 outs)全池'},
  {pot:180,bet:60,outs:10,street:'flop',desc:'翻牌对子+顺draw(10)1/3池'},
  {pot:120,bet:120,outs:12,street:'flop',desc:'翻牌combo(12 outs)全池'},
  {pot:400,bet:200,outs:9,street:'flop',desc:'翻牌花draw深筹码半池'},
  {pot:70,bet:70,outs:4,street:'flop',desc:'翻牌卡顺(4)全池'},
  {pot:150,bet:75,outs:14,street:'flop',desc:'翻牌花+顺(14 outs)半池'},
  {pot:200,bet:200,outs:8,street:'turn',desc:'转牌两头顺超额全池'},
  {pot:100,bet:33,outs:5,street:'turn',desc:'转牌5 outs 1/3池'},
  {pot:250,bet:125,outs:11,street:'flop',desc:'翻牌中对+花(11 outs)半池'}
]
function shuffle<T>(a:T[]):T[]{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]};return b}
const quizzes=ref(shuffle(quizData)),quizIdx=ref(0),quizAnswered=ref(false),quizIsCorrect=ref(false),quizCorrect=ref(0),quizTotal=ref(0)
const currentQuiz=computed(()=>quizzes.value[quizIdx.value]||null)
const quizPotOdds=computed(()=>{if(!currentQuiz.value)return 0;const q=currentQuiz.value;return Math.round((q.bet/(q.pot+q.bet+q.bet))*100)})
const quizEquity=computed(()=>{if(!currentQuiz.value)return 0;const q=currentQuiz.value;return Math.min(q.outs*(q.street==='flop'?4:2),100)})
function answerQuiz(call:boolean){const c=quizEquity.value>=quizPotOdds.value;quizIsCorrect.value=call===c;quizTotal.value++;if(quizIsCorrect.value)quizCorrect.value++;quizAnswered.value=true}
function nextQuiz(){quizIdx.value++;quizAnswered.value=false}
function resetQuiz(){quizzes.value=shuffle(quizData);quizIdx.value=0;quizCorrect.value=0;quizTotal.value=0;quizAnswered.value=false}
</script>

<style scoped>
.odds-page{padding:16px;padding-bottom:80px}.page-title{font-size:20px;font-weight:700;margin-bottom:12px}
.mode-tabs{display:flex;gap:6px;margin-bottom:14px}.mode-btn{flex:1;padding:8px;border-radius:10px;border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font-size:12px;font-weight:700;cursor:pointer}.mode-btn.active{background:var(--accent-green-dim);border-color:var(--border-active);color:var(--accent-green)}
.input-section{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}.input-group label{font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px;display:block}.input-row{display:flex;align-items:center;gap:12px}
.adj-btn{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#eee;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}.input-value{font-size:20px;font-weight:700;min-width:80px;text-align:center}
.results{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}.result-card{background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:2px}.result-label{font-size:12px;color:rgba(255,255,255,0.5)}.result-value{font-size:24px;font-weight:800;color:#4ade80}
.decision-card{padding:16px;border-radius:12px;display:flex;align-items:center;gap:10px}.decision-card.positive{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3)}.decision-card.negative{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3)}.decision-icon{font-size:20px}.decision-text{font-size:15px;font-weight:600}.positive .decision-text{color:#22c55e}.negative .decision-text{color:#ef4444}
.outs-reference h3{font-size:14px;font-weight:600;margin-bottom:8px}.outs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.outs-item{background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;text-align:center;cursor:pointer;display:flex;flex-direction:column;gap:2px}.outs-num{font-size:18px;font-weight:800;color:#eab308}.outs-name{font-size:10px;color:rgba(255,255,255,0.5)}
.quiz-card{background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:18px}.quiz-desc{font-size:14px;font-weight:600;margin-bottom:12px;line-height:1.5}.quiz-info{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;font-size:12px;color:var(--text-secondary)}.quiz-info strong{color:var(--accent-gold)}.quiz-question{font-size:16px;font-weight:800;margin-bottom:12px}
.quiz-options{display:flex;gap:12px}.qbtn{flex:1;padding:14px;border:none;border-radius:12px;font-size:16px;font-weight:800;cursor:pointer}.qbtn.call{background:var(--accent-green);color:#000}.qbtn.fold{background:rgba(255,255,255,0.1);color:var(--text-secondary);border:1px solid var(--border-subtle)}
.quiz-result{display:flex;flex-direction:column;gap:10px}.qresult{padding:10px;border-radius:10px;text-align:center;font-size:16px;font-weight:700}.qresult.correct{background:rgba(34,197,94,0.15);color:#34d399}.qresult.wrong{background:rgba(239,68,68,0.15);color:#f87171}
.quiz-explain{font-size:12px;color:var(--text-secondary);line-height:1.8;background:rgba(255,255,255,0.03);padding:10px;border-radius:8px}.quiz-explain strong{color:var(--accent-green)}
.btn-next{width:100%;padding:12px;border:none;border-radius:10px;background:rgba(255,255,255,0.1);color:#eee;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px}.complete{text-align:center;padding:40px 0;color:var(--text-secondary)}
</style>
