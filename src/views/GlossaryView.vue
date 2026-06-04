<template>
  <div class="glossary-page">
    <h2 class="page-title">术语词典</h2>

    <div class="search-box">
      <input v-model="searchQuery" type="text" placeholder="搜索术语..." class="search-input" />
    </div>

    <div class="category-bar">
      <button v-for="cat in categories" :key="cat"
        :class="['cat-btn', { active: activeCategory === cat }]" @click="activeCategory = cat">{{ cat }}</button>
    </div>

    <div class="term-list">
      <div v-for="item in filteredTerms" :key="item.termEn" class="term-card" @click="toggleExpand(item.termEn)">
        <div class="term-header">
          <span class="term-name">{{ item.term }}</span>
          <span class="term-en">{{ item.termEn }}</span>
          <span class="term-cat">{{ item.category }}</span>
        </div>
        <div v-if="expandedTerm === item.termEn" class="term-body">{{ item.definition }}</div>
      </div>
      <div v-if="filteredTerms.length === 0" class="empty-state">没有找到匹配的术语</div>
    </div>

    <div class="term-count">共 {{ filteredTerms.length }} 条术语</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { glossary, CATEGORIES } from '@/data/glossary'

const searchQuery = ref('')
const activeCategory = ref('全部')
const expandedTerm = ref('')
const categories = CATEGORIES

const filteredTerms = computed(() => {
  let result = glossary
  if (activeCategory.value !== '全部') {
    result = result.filter(item => item.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.term.toLowerCase().includes(q) ||
      item.termEn.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q)
    )
  }
  return result
})

function toggleExpand(termEn: string) {
  expandedTerm.value = expandedTerm.value === termEn ? '' : termEn
}
</script>

<style scoped>
.glossary-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.search-box { margin-bottom: 10px; }
.search-input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05);
  color: #eee; font-size: 14px; outline: none;
}
.search-input::placeholder { color: rgba(255,255,255,0.3); }
.search-input:focus { border-color: #4ade80; }
.category-bar { display: flex; gap: 6px; margin-bottom: 14px; overflow-x: auto; scrollbar-width: none; }
.category-bar::-webkit-scrollbar { display: none; }
.cat-btn {
  flex-shrink: 0; padding: 6px 12px; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.15); background: transparent;
  color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; cursor: pointer;
}
.cat-btn.active { background: rgba(74,222,128,0.1); border-color: #4ade80; color: #4ade80; }
.term-list { display: flex; flex-direction: column; gap: 8px; }
.term-card {
  background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 14px; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.06); transition: background 0.15s;
}
.term-card:active { background: rgba(255,255,255,0.08); }
.term-header { display: flex; align-items: center; gap: 8px; }
.term-name { font-size: 15px; font-weight: 700; }
.term-en { font-size: 12px; color: rgba(255,255,255,0.4); }
.term-cat {
  margin-left: auto; font-size: 10px; padding: 2px 6px;
  background: rgba(255,255,255,0.08); border-radius: 6px; color: rgba(255,255,255,0.5);
}
.term-body {
  margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;
}
.empty-state { text-align: center; padding: 40px 0; color: rgba(255,255,255,0.3); font-size: 14px; }
.term-count { text-align: center; margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.3); }
</style>
