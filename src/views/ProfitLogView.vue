<template>
  <div class="profit-page">
    <h2 class="page-title">💰 扑克记账</h2>
    <p class="page-desc">现在按场次记录，每条就是一场 poker 的最终净输赢，统计会自动汇总到近 7 天、本月和今年。</p>

    <div class="storage-note">
      数据保存在当前设备本地。刷新页面、重启项目、应用内“清除缓存”都不会删除；只有你手动删除记录或点击“清空盈亏记账”才会移除。
    </div>

    <div class="summary-grid">
      <div class="summary-card emphasis">
        <span class="summary-label">当前总盈亏</span>
        <strong :class="['summary-value', netTone]">{{ formatSigned(stats.netProfit) }}</strong>
        <span class="summary-hint">{{ netLabel }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">今年盈亏</span>
        <strong :class="['summary-value', yearTone]">{{ formatSigned(stats.currentYearNet) }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">本月盈亏</span>
        <strong :class="['summary-value', monthTone]">{{ formatSigned(stats.currentMonthNet) }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">近 7 天</span>
        <strong :class="['summary-value', recentTone]">{{ formatSigned(stats.recent7DaysNet) }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">盈利记录</span>
        <strong class="summary-value positive">{{ stats.positiveCount }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">亏损记录</span>
        <strong class="summary-value negative">{{ stats.negativeCount }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">平均每笔</span>
        <strong :class="['summary-value', averageTone]">{{ formatSigned(stats.averagePerRecord) }}</strong>
      </div>
    </div>

    <section class="trend-card">
      <div class="section-head">
        <h3 class="section-title">累计盈亏趋势</h3>
        <div class="mini-switch">
          <button :class="['mini-btn', { active: trendMode === 'day' }]" @click="trendMode = 'day'">按天</button>
          <button :class="['mini-btn', { active: trendMode === 'month' }]" @click="trendMode = 'month'">按月</button>
          <button :class="['mini-btn', { active: trendMode === 'year' }]" @click="trendMode = 'year'">按年</button>
        </div>
      </div>

      <div v-if="trendPoints.length === 0" class="empty-chart">
        还没有趋势数据，新增几条记录后这里会生成累计盈利曲线。
      </div>

      <div v-else class="chart-wrap">
        <svg viewBox="0 0 320 180" class="trend-chart" aria-label="累计盈亏趋势图">
          <line x1="20" y1="20" x2="20" y2="150" class="axis-line" />
          <line x1="20" y1="150" x2="300" y2="150" class="axis-line" />
          <path :d="areaPath" class="area-path" />
          <path :d="linePath" class="line-path" />
          <circle
            v-for="point in chartPoints"
            :key="point.x"
            :cx="point.x"
            :cy="point.y"
            r="3.5"
            class="point-dot"
          />
        </svg>

        <div class="chart-labels">
          <span>{{ trendPoints[0]?.label }}</span>
          <span>{{ trendPoints[Math.floor((trendPoints.length - 1) / 2)]?.label }}</span>
          <span>{{ trendPoints[trendPoints.length - 1]?.label }}</span>
        </div>

        <div class="chart-extremes">
          <span>最低 {{ formatSigned(minTrendValue) }}</span>
          <span>最高 {{ formatSigned(maxTrendValue) }}</span>
        </div>
        <div class="chart-note">{{ trendHint }}</div>
      </div>
    </section>

    <section class="yearly-card">
      <div class="section-head">
        <h3 class="section-title">年度汇总</h3>
      </div>

      <div v-if="yearlySummaries.length === 0" class="empty-card">
        还没有年度数据，录入场次后这里会自动汇总每年的总输赢。
      </div>

      <div v-else class="yearly-list">
        <div v-for="item in yearlySummaries" :key="item.year" :class="['year-row', { active: selectedYear === item.year }]">
          <div class="year-main">
            <strong class="year-title">{{ item.year }}</strong>
            <span class="year-meta">{{ item.recordCount }} 场 · 盈 {{ item.positiveCount }} / 亏 {{ item.negativeCount }}</span>
          </div>
          <div class="year-side">
            <strong :class="['year-profit', item.netProfit >= 0 ? 'positive' : 'negative']">{{ formatSigned(item.netProfit) }}</strong>
            <span class="year-meta">场均 {{ formatSigned(item.averagePerRecord) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="entry-card">
      <div class="section-head">
        <h3 class="section-title">新增场次</h3>
      </div>

      <div class="field-grid single">
        <label class="field">
          <span class="field-label">日期</span>
          <input v-model="form.date" class="field-input" type="date" />
        </label>
      </div>

      <label class="field">
        <span class="field-label">净输赢金额</span>
        <input
          v-model="form.amount"
          class="field-input"
          type="number"
          step="0.01"
          placeholder="赢钱填正数，例如 300；输钱填负数，例如 -120"
        />
      </label>

      <label class="field">
        <span class="field-label">备注</span>
        <input
          v-model="form.note"
          class="field-input"
          type="text"
          maxlength="40"
          placeholder="可选：1/2 现金局 / 锦标赛 / 线上 Zoom"
        />
      </label>

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <button class="submit-btn" @click="submitEntry">保存场次记录</button>
    </section>

    <section class="history-section">
      <div class="history-header">
        <h3 class="section-title">历史记录</h3>
        <span class="history-tip">按日期倒序显示</span>
      </div>

      <div v-if="availableYears.length > 0" class="year-filter">
        <button :class="['filter-chip', { active: selectedYear === 'all' }]" @click="selectedYear = 'all'">全部</button>
        <button
          v-for="year in availableYears"
          :key="year"
          :class="['filter-chip', { active: selectedYear === year }]"
          @click="selectedYear = year"
        >
          {{ year }}
        </button>
      </div>

      <div v-if="entries.length === 0" class="empty-card">
        还没有记账记录，先录入第一笔扑克盈亏吧。
      </div>

      <div v-else-if="filteredEntries.length === 0" class="empty-card">
        {{ selectedYear }} 年还没有记录。
      </div>

      <div v-else class="history-list">
        <div v-for="entry in filteredEntries" :key="entry.id" class="history-item">
          <div v-if="editingId === entry.id" class="history-main edit-mode">
            <div class="field-grid single compact">
              <label class="field">
                <span class="field-label">日期</span>
                <input v-model="editForm.date" class="field-input" type="date" />
              </label>
            </div>
            <label class="field compact">
              <span class="field-label">净输赢金额</span>
              <input v-model="editForm.amount" class="field-input" type="number" step="0.01" placeholder="正数=赢，负数=输" />
            </label>
            <label class="field compact">
              <span class="field-label">备注</span>
              <input v-model="editForm.note" class="field-input" type="text" maxlength="40" />
            </label>
            <p v-if="editError" class="form-error compact">{{ editError }}</p>
            <div class="edit-actions">
              <button class="action-btn primary" @click="saveEdit(entry.id)">保存</button>
              <button class="action-btn" @click="cancelEdit">取消</button>
            </div>
          </div>
          <div v-else class="history-main">
            <div class="history-top">
              <span class="history-date">{{ entry.date }}</span>
              <span :class="['entry-tag', entry.mode]">{{ entry.mode === 'session' ? '场次' : '旧流水' }}</span>
            </div>
            <div class="history-bottom">
              <span class="history-note">{{ entry.note || defaultNote(entry) }}</span>
              <strong :class="['history-amount', getEntryNet(entry) >= 0 ? 'positive' : 'negative']">
                {{ formatSigned(getEntryNet(entry)) }}
              </strong>
            </div>
          </div>
          <div v-if="editingId !== entry.id" class="item-actions">
            <button class="action-btn" @click="startEdit(entry)">编辑</button>
            <button class="delete-btn" @click="removeEntry(entry.id)">删除</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  useProfitStore,
  type ProfitEntry,
  type YearFilter,
  type YearlySummary,
  type TrendMode
} from '@/stores/profitStore'

const profitStore = useProfitStore()
const stats = computed(() => profitStore.stats)
const entries = computed(() => profitStore.sortedEntries)
const availableYears = computed(() => profitStore.availableYears)
const yearlySummaries = computed<YearlySummary[]>(() => profitStore.yearlySummaries)
const trendMode = ref<TrendMode>('day')
const selectedYear = ref<YearFilter>('all')
const formError = ref('')
const editingId = ref('')
const editError = ref('')

const form = reactive<{
  date: string
  amount: string
  note: string
}>({
  date: profitStore.getToday(),
  amount: '',
  note: ''
})

const editForm = reactive<{
  date: string
  amount: string
  note: string
}>({
  date: '',
  amount: '',
  note: ''
})

const netTone = computed(() => getTone(stats.value.netProfit))
const yearTone = computed(() => getTone(stats.value.currentYearNet))
const monthTone = computed(() => getTone(stats.value.currentMonthNet))
const recentTone = computed(() => getTone(stats.value.recent7DaysNet))
const averageTone = computed(() => getTone(stats.value.averagePerRecord))
const trendPoints = computed(() => profitStore.buildTrend(trendMode.value, selectedYear.value))
const filteredEntries = computed(() => {
  if (selectedYear.value === 'all') return entries.value
  return entries.value.filter(entry => entry.date.startsWith(selectedYear.value))
})
const minTrendValue = computed(() => trendPoints.value.length === 0 ? 0 : Math.min(...trendPoints.value.map(point => point.value)))
const maxTrendValue = computed(() => trendPoints.value.length === 0 ? 0 : Math.max(...trendPoints.value.map(point => point.value)))

const chartPoints = computed(() => {
  if (trendPoints.value.length === 0) return []

  const width = 280
  const height = 130
  const minValue = minTrendValue.value
  const maxValue = maxTrendValue.value
  const span = maxValue === minValue ? 1 : maxValue - minValue

  return trendPoints.value.map((point, index) => {
    const x = 20 + (trendPoints.value.length === 1 ? width / 2 : (index / (trendPoints.value.length - 1)) * width)
    const y = 20 + height - (((point.value - minValue) / span) * height)
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), value: point.value }
  })
})

const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  return chartPoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
})

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  const first = chartPoints.value[0]
  const last = chartPoints.value[chartPoints.value.length - 1]
  return `${linePath.value} L ${last.x} 150 L ${first.x} 150 Z`
})

const netLabel = computed(() => {
  if (stats.value.netProfit > 0) return '目前整体在盈利'
  if (stats.value.netProfit < 0) return '目前整体在亏损'
  return '目前打平'
})
const trendHint = computed(() => {
  if (selectedYear.value === 'all') return '当前展示全部年份范围'
  if (trendMode.value === 'day') return `当前展示 ${selectedYear.value} 年最近 14 天累计走势`
  if (trendMode.value === 'month') return `当前展示 ${selectedYear.value} 年逐月累计走势`
  return `当前展示截至 ${selectedYear.value} 年的跨年累计走势`
})

function getTone(value: number) {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function getEntryNet(entry: ProfitEntry) {
  if (entry.mode === 'session') return entry.result
  return entry.type === 'income' ? entry.amount : -entry.amount
}

function defaultNote(entry: ProfitEntry) {
  if (entry.mode === 'session') return '场次净输赢'
  return entry.type === 'income' ? '资金流入' : '资金流出'
}

function formatCurrency(value: number) {
  return `¥${Math.abs(value).toFixed(2)}`
}

function formatSigned(value: number) {
  if (value > 0) return `+${formatCurrency(value)}`
  if (value < 0) return `-${formatCurrency(value)}`
  return '¥0.00'
}

function normalizeSignedAmount(raw: string): number {
  const amount = Number(raw)
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('净输赢不能为 0')
  }
  return Math.round(amount * 100) / 100
}

function submitEntry() {
  try {
    const signedAmount = normalizeSignedAmount(form.amount)
    profitStore.addSessionEntry({
      date: form.date,
      result: signedAmount,
      note: form.note
    })

    formError.value = ''
    form.amount = ''
    form.note = ''
    form.date = profitStore.getToday()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '保存失败，请重试'
  }
}

function startEdit(entry: ProfitEntry) {
  editingId.value = entry.id
  editError.value = ''
  editForm.date = entry.date
  editForm.amount = String(getEntryNet(entry))
  editForm.note = entry.note
}

function cancelEdit() {
  editingId.value = ''
  editError.value = ''
  editForm.date = ''
  editForm.amount = ''
  editForm.note = ''
}

function saveEdit(id: string) {
  try {
    const amount = normalizeSignedAmount(editForm.amount)
    profitStore.updateEntry(id, {
      date: editForm.date,
      amount,
      note: editForm.note
    })
    cancelEdit()
  } catch (error) {
    editError.value = error instanceof Error ? error.message : '保存失败，请重试'
  }
}

function removeEntry(id: string) {
  if (!confirm('确定删除这条盈亏记录吗？')) return
  profitStore.removeEntry(id)
  if (editingId.value === id) cancelEdit()
}
</script>

<style scoped>
.profit-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-family: var(--font-display); font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.page-desc { color: var(--text-secondary); font-size: 12px; line-height: 1.6; margin-bottom: 12px; }
.storage-note {
  padding: 12px 14px;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  color: #bfdbfe;
  font-size: 12px;
  line-height: 1.6;
}
.summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.summary-card,
.trend-card,
.entry-card,
.empty-card,
.history-item {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
}
.summary-card.emphasis { grid-column: 1 / -1; }
.summary-label { font-size: 11px; color: var(--text-muted); }
.summary-value { font-family: var(--font-display); font-size: 22px; font-weight: 900; }
.summary-hint { font-size: 11px; color: var(--text-secondary); }
.positive { color: var(--accent-green); }
.negative { color: var(--accent-red); }
.neutral { color: var(--accent-gold); }
.trend-card,
.yearly-card,
.entry-card { padding: 16px; margin-bottom: 18px; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.section-title { font-size: 15px; font-weight: 700; }
.mini-switch { display: flex; gap: 8px; }
.mini-btn {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.mini-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.empty-chart {
  padding: 28px 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}
.chart-wrap { display: flex; flex-direction: column; gap: 8px; }
.trend-chart {
  width: 100%;
  height: 180px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(52, 211, 153, 0.08), rgba(17, 24, 39, 0.02));
}
.axis-line { stroke: rgba(241, 245, 249, 0.18); stroke-width: 1; }
.line-path {
  fill: none;
  stroke: var(--accent-green);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.area-path { fill: rgba(52, 211, 153, 0.14); }
.point-dot { fill: #fbbf24; }
.chart-labels,
.chart-extremes {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
}
.chart-note { font-size: 11px; color: var(--text-secondary); }
.field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.field-grid.single { grid-template-columns: 1fr; }
.field-grid.compact { gap: 0; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.field.compact { margin-bottom: 10px; }
.field-label { font-size: 11px; color: var(--text-muted); }
.field-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
  color: var(--text-primary);
  font-size: 14px;
}
.type-switch { display: flex; gap: 8px; }
.type-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  font-weight: 700;
  cursor: pointer;
}
.type-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.form-error {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(239,68,68,0.12);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 12px;
}
.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: var(--accent-green);
  color: #052e16;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}
.history-section { display: flex; flex-direction: column; gap: 10px; }
.history-header { display: flex; align-items: center; justify-content: space-between; }
.history-tip { color: var(--text-muted); font-size: 11px; }
.yearly-list { display: flex; flex-direction: column; gap: 8px; }
.year-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.year-row.active {
  margin: 0 -8px;
  padding: 14px 8px;
  border-radius: 12px;
  background: rgba(52, 211, 153, 0.08);
}
.year-row:last-child { border-bottom: none; padding-bottom: 0; }
.year-main,
.year-side { display: flex; flex-direction: column; gap: 4px; }
.year-side { text-align: right; }
.year-title { font-size: 16px; font-weight: 800; }
.year-profit { font-size: 16px; font-weight: 800; }
.year-meta { font-size: 11px; color: var(--text-muted); }
.year-filter { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-chip {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.filter-chip.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.empty-card { padding: 20px 16px; text-align: center; color: var(--text-secondary); font-size: 13px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
}
.history-main { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.history-main.edit-mode { gap: 0; }
.history-top,
.history-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.history-date { font-size: 12px; color: var(--text-secondary); }
.entry-tag {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.entry-tag.cashflow { background: rgba(96, 165, 250, 0.14); color: #93c5fd; }
.entry-tag.session { background: rgba(251, 191, 36, 0.14); color: #fcd34d; }
.history-note {
  color: var(--text-primary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-amount { font-size: 15px; font-weight: 800; flex-shrink: 0; }
.item-actions,
.edit-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.edit-actions { margin-top: 2px; }
.action-btn,
.delete-btn {
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.action-btn.primary {
  background: var(--accent-green);
  color: #052e16;
}
</style>
