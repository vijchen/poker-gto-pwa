<template>
  <div class="handlog-page">
    <h2 class="page-title">📝 记牌本</h2>
    <div class="record-form">
      <div class="form-row"><label>手牌</label><div class="card-inputs"><select v-model="newHand.card1" class="card-select"><option v-for="c in cardOptions" :key="c" :value="c">{{ c }}</option></select><select v-model="newHand.card2" class="card-select"><option v-for="c in cardOptions" :key="c" :value="c">{{ c }}</option></select></div></div>
      <div class="form-row"><label>位置</label><div class="pos-options"><button v-for="p in positions" :key="p" :class="['pos-opt', { active: newHand.position === p }]" @click="newHand.position = p">{{ p }}</button></div></div>
      <div class="form-row"><label>行动</label><div class="action-options"><button v-for="a in actions" :key="a.value" :class="['action-opt', { active: newHand.action === a.value }]" @click="newHand.action = a.value">{{ a.label }}</button></div></div>
      <div class="form-row"><label>结果</label><div class="result-options"><button :class="['result-opt','win',{active:newHand.result==='win'}]" @click="newHand.result='win'">赢</button><button :class="['result-opt','lose',{active:newHand.result==='lose'}]" @click="newHand.result='lose'">输</button><button :class="['result-opt','fold',{active:newHand.result==='fold'}]" @click="newHand.result='fold'">弃牌</button></div></div>
      <button class="btn-save" @click="saveHand">保存这手牌</button>
    </div>
    <div class="history"><div class="history-header"><h3>历史记录 ({{ hands.length }})</h3><button v-if="hands.length" class="btn-clear" @click="clearAll">清空</button></div>
      <div v-if="hands.length===0" class="empty">还没有记录</div>
      <div v-for="(h,idx) in hands" :key="idx" class="hand-item"><div class="hand-cards">{{ h.card1 }} {{ h.card2 }}</div><span class="hand-pos">{{ h.position }}</span><span class="hand-action">{{ h.action }}</span><span :class="['hand-result',h.result]">{{ h.result==='win'?'赢':h.result==='lose'?'输':'弃' }}</span></div>
    </div>
    <div v-if="hands.length>=5" class="stats-summary">
      <div class="stat-item"><span class="stat-label">总手数</span><span class="stat-val">{{ hands.length }}</span></div>
      <div class="stat-item"><span class="stat-label">赢率</span><span class="stat-val green">{{ winRate }}%</span></div>
      <div class="stat-item"><span class="stat-label">VPIP</span><span class="stat-val">{{ vpip }}%</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { POSITIONS } from '@/types/poker'
interface HandRecord { card1: string; card2: string; position: string; action: string; result: string; time: number }
const STORAGE_KEY = 'poker-gto-hand-log'
const positions = POSITIONS
const actions = [{label:'Open',value:'open'},{label:'Call',value:'call'},{label:'3-Bet',value:'3bet'},{label:'Fold',value:'fold'}]
const cardOptions = (() => { const r=['A','K','Q','J','T','9','8','7','6','5','4','3','2'],s=['♠','♥','♦','♣'],c:string[]=[]; for(const x of r)for(const y of s)c.push(x+y); return c })()
const hands = ref<HandRecord[]>([])
const newHand = ref({card1:'A♠',card2:'K♥',position:'BTN',action:'open',result:'win'})
const winRate = computed(()=>{const w=hands.value.filter(h=>h.result==='win').length,p=hands.value.filter(h=>h.result!=='fold').length;return p===0?0:Math.round((w/p)*100)})
const vpip = computed(()=>{const p=hands.value.filter(h=>h.action!=='fold').length;return hands.value.length===0?0:Math.round((p/hands.value.length)*100)})
function saveHand(){hands.value.unshift({...newHand.value,time:Date.now()});localStorage.setItem(STORAGE_KEY,JSON.stringify(hands.value))}
function clearAll(){hands.value=[];localStorage.removeItem(STORAGE_KEY)}
onMounted(()=>{try{const r=localStorage.getItem(STORAGE_KEY);if(r)hands.value=JSON.parse(r)}catch{}})
</script>

<style scoped>
.handlog-page{padding:16px;padding-bottom:80px}.page-title{font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:14px}
.record-form{background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:16px;margin-bottom:16px}
.form-row{margin-bottom:12px}.form-row label{font-size:11px;color:var(--text-muted);display:block;margin-bottom:6px}
.card-inputs{display:flex;gap:8px}.card-select{flex:1;padding:8px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-primary);color:var(--text-primary);font-size:14px}
.pos-options,.action-options,.result-options{display:flex;gap:4px;flex-wrap:wrap}
.pos-opt,.action-opt,.result-opt{padding:6px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font-size:11px;font-weight:600;cursor:pointer}
.pos-opt.active,.action-opt.active{background:var(--accent-green-dim);border-color:var(--border-active);color:var(--accent-green)}
.result-opt.win.active{background:rgba(34,197,94,0.15);border-color:rgba(34,197,94,0.4);color:#34d399}
.result-opt.lose.active{background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);color:#f87171}
.result-opt.fold.active{background:rgba(255,255,255,0.08);color:var(--text-secondary)}
.btn-save{width:100%;padding:12px;border:none;border-radius:var(--radius-md);background:var(--accent-green);color:#000;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px}
.history-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.history-header h3{font-size:14px;font-weight:700}
.btn-clear{padding:4px 10px;border:1px solid rgba(239,68,68,0.3);border-radius:8px;background:transparent;color:#f87171;font-size:11px;cursor:pointer}
.empty{text-align:center;padding:24px;color:var(--text-muted);font-size:13px}
.hand-item{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border-subtle);font-size:13px}
.hand-cards{font-weight:800;min-width:50px}.hand-pos{font-size:10px;padding:2px 6px;background:var(--accent-green-dim);color:var(--accent-green);border-radius:6px}
.hand-action{font-size:10px;color:var(--text-secondary)}.hand-result{margin-left:auto;font-weight:700;font-size:12px}
.hand-result.win{color:#34d399}.hand-result.lose{color:#f87171}.hand-result.fold{color:var(--text-muted)}
.stats-summary{display:flex;gap:12px;margin-top:16px}.stat-item{flex:1;text-align:center;padding:12px;background:var(--bg-card);border-radius:var(--radius-md);border:1px solid var(--border-subtle)}
.stat-label{font-size:10px;color:var(--text-muted);display:block}.stat-val{font-size:18px;font-weight:800;font-family:var(--font-display)}.stat-val.green{color:var(--accent-green)}
</style>
