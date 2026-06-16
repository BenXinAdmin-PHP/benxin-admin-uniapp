<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   文章 — 分类筛选 chips + 关键字搜索 + 上拉分页（复用 ArticleCard）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-16
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import {
  getContents,
  getContentCategories,
  type ContentListItem,
  type ContentCategory,
} from '@/api/content'
import ArticleCard from '@/components/ArticleCard.vue'

const categories = ref<ContentCategory[]>([])
const activeCat = ref(0) // 0 = 全部（不传 category_id）
const keyword = ref('')

const list = ref<ContentListItem[]>([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)
const loaded = ref(false)

const catMap = computed(() => {
  const m: Record<number, string> = {}
  categories.value.forEach((c) => (m[c.id] = c.name))
  return m
})
function catName(id: number): string | undefined {
  return catMap.value[id]
}

async function loadCategories() {
  try {
    categories.value = await getContentCategories()
  } catch {
    categories.value = []
  }
}

/** 加载列表；reset=true 重置到第一页（筛选/搜索/下拉刷新/首次）。 */
async function loadList(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  if (finished.value) return
  loading.value = true
  try {
    const res = await getContents({
      page: page.value,
      page_size: pageSize,
      category_id: activeCat.value || undefined,
      keyword: keyword.value.trim() || undefined,
    })
    list.value = reset ? res.list : list.value.concat(res.list)
    if (list.value.length >= res.total || res.list.length === 0) {
      finished.value = true
    } else {
      page.value++
    }
  } catch {
    // 错误已由 request 统一 toast
  } finally {
    loading.value = false
    loaded.value = true
  }
}

function selectCat(id: number) {
  if (activeCat.value === id) return
  activeCat.value = id
  loadList(true)
}

function onSearch() {
  loadList(true)
}

function onClear() {
  if (!keyword.value) return
  keyword.value = ''
  loadList(true)
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/content/detail?id=${id}` })
}

onLoad(() => {
  loadCategories()
  loadList(true)
})

onPullDownRefresh(async () => {
  await Promise.all([loadCategories(), loadList(true)])
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  loadList(false)
})
</script>

<template>
  <view class="page">
    <!-- 工具栏：搜索 + 分类 chips -->
    <view class="toolbar">
      <view class="search">
        <wd-icon name="search" size="36rpx" color="#9aa1ad" />
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          placeholder="搜索文章标题"
          placeholder-class="search-ph"
          confirm-type="search"
          @confirm="onSearch"
        />
        <wd-icon
          v-if="keyword"
          name="close"
          size="32rpx"
          color="#9aa1ad"
          @click="onClear"
        />
      </view>

      <scroll-view class="chips" scroll-x :show-scrollbar="false">
        <view class="chips-row">
          <view
            class="chip"
            :class="{ active: activeCat === 0 }"
            @click="selectCat(0)"
          >
            全部
          </view>
          <view
            v-for="c in categories"
            :key="c.id"
            class="chip"
            :class="{ active: activeCat === c.id }"
            @click="selectCat(c.id)"
          >
            {{ c.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <view v-if="list.length" class="list">
      <ArticleCard
        v-for="item in list"
        :key="item.id"
        :item="item"
        :category-name="catName(item.category_id)"
        @select="goDetail"
      />
    </view>

    <!-- 空态（不破图） -->
    <view v-else-if="loaded && !loading" class="empty">
      <text class="empty-text">没有找到相关文章</text>
      <text class="empty-sub">换个分类或关键字试试</text>
    </view>

    <!-- 状态 -->
    <view class="state">
      <text v-if="loading" class="state-text">加载中…</text>
      <text v-else-if="finished && list.length" class="state-text">没有更多了</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bx-bg;
  padding: 0 $bx-gap-page 32rpx;
}

/* ---- 工具栏 ---- */
.toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 20rpx 0 8rpx;
  background: $bx-bg;
}
.search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: 72rpx;
  padding: 0 24rpx;
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-pill;
}
.search-input {
  flex: 1;
  min-width: 0;
  font-size: 27rpx;
  color: $bx-text;
}
.search-ph {
  color: $bx-text-weak;
}
.chips {
  margin-top: 20rpx;
  white-space: nowrap;
}
.chips-row {
  display: inline-flex;
  gap: 16rpx;
  padding-bottom: 4rpx;
}
.chip {
  flex-shrink: 0;
  padding: 10rpx 28rpx;
  font-size: 25rpx;
  color: $bx-text-sub;
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-pill;
}
.chip.active {
  color: $bx-text-inverse;
  background: $bx-gradient-brand;
  border-color: transparent;
}

/* ---- 列表 ---- */
.list {
  display: flex;
  flex-direction: column;
  gap: $bx-gap-card;
  margin-top: 20rpx;
}

/* ---- 空态 / 状态 ---- */
.empty {
  margin-top: 32rpx;
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  background: $bx-card;
  border: 1rpx dashed $bx-border;
  border-radius: $bx-radius-card;
}
.empty-text {
  font-size: 28rpx;
  color: $bx-text-sub;
}
.empty-sub {
  font-size: 23rpx;
  color: $bx-text-weak;
}
.state {
  text-align: center;
  padding: 28rpx 0;
}
.state-text {
  font-size: 24rpx;
  color: $bx-text-weak;
}
</style>
