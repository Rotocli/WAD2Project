<template>
  <div class="journal-view">
    <!-- Insights Section -->

    <div class="container mb-4" v-if="insightsYes">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="mb-4">Your Insights</h2>
          
          <!-- Weekly Insights -->
          <div class="insight-card mb-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0">Weekly Insights (Last 7 Days)</h4>
              <button 
                class="btn btn-sm btn-primary" 
                @click="handleGenerateWeeklyInsights"
                :disabled="generatingWeekly || pastEntries.length < 3"
              >
                {{ generatingWeekly ? 'Generating...' : 'Generate Weekly Insights' }}
              </button>
            </div>
            <div v-if="weeklyInsightsText" class="insight-content">
              {{ weeklyInsightsText }}
            </div>
            <div v-else class="insight-placeholder">
              Write at least 3 entries to unlock weekly insights
            </div>
          </div>

          <!-- Monthly Insights -->
          <div class="insight-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0">Monthly Insights (Last 30 Days)</h4>
              <button 
                class="btn btn-sm btn-success" 
                @click="handleGenerateMonthlyInsights"
                :disabled="generatingMonthly || pastEntries.length < 7"
              >
                {{ generatingMonthly ? 'Generating...' : 'Generate Monthly Insights' }}
              </button>
            </div>
            <div v-if="monthlyInsightsText" class="insight-content">
              {{ monthlyInsightsText }}
            </div>
            <div v-else class="insight-placeholder">
              Write at least 7 entries to unlock monthly insights
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mb-4 " v-else>
      <img class="table_img mt-5" src="../assets/table.svg" alt="">




    </div>

    <div class="container">
      <div class="row g-4">
        <!-- Left: Past Entries -->
        <div class="col-lg-7">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h3 class="mb-0"> Past Journal Entries</h3>
              <span class="badge bg-primary rounded-pill">{{ pastEntries.length }} entries</span>
            </div>
            
            <div class="card-body" style="max-height: 600px; overflow-y: auto;">
              <div v-if="pastEntries.length === 0" class="text-center py-5 text-muted">
                <div style="font-size: 4rem;">📝</div>
                <p>No past entries yet. Start writing today!</p>
              </div>
              
              <div v-else>
                <div v-for="entry in displayedEntries" :key="entry.id" class="card mb-3 border">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div class="fw-bold text-primary">{{ formatDate(entry.date) }}</div>
                      <div v-if="entry.mood" style="font-size: 1.2rem;">{{ entry.mood }}</div>
                    </div>
                    <div class="mb-2" style="white-space: pre-wrap; line-height: 1.6;">{{ entry.entry }}</div>
                    <div v-if="entry.summary" class="alert alert-warning mb-0">
                      <strong>✨ AI Summary:</strong> {{ entry.summary }}
                    </div>
                  </div>
                </div>
                
                <button 
                  v-if="hasMore" 
                  class="btn btn-outline-primary w-100" 
                  @click="loadMore"
                  :disabled="loadingMore"
                >
                  {{ loadingMore ? 'Loading...' : 'Load More Entries' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right: Today's Entry -->
        <div class="col-lg-5">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h3 class="mb-0"> Today's Entry</h3>
              <span class="text-muted small">{{ formatDate(todayString) }}</span>
            </div>
            
            <div class="card-body">
              <!-- View Mode -->
              <div v-if="!isEditing && todayEntry">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Mood</label>
                  <div class="p-2 bg-light rounded text-center" style="font-size: 1.5rem;">
                    {{ todayEntry.mood || 'Not specified' }}
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Entry</label>
                  <div class="p-3 bg-light rounded border" style="white-space: pre-wrap; line-height: 1.6; max-height: 300px; overflow-y: auto;">
                    {{ todayEntry.entry }}
                  </div>
                </div>
                <button class="btn btn-primary w-100" @click="startEditing">
                  <i class="bi bi-pencil"></i> Edit Entry
                </button>
              </div>
              
              <!-- Edit/Create Mode -->
              <div v-else>
                <div class="mb-3">
                  <label for="mood" class="form-label">How are you feeling today?</label>
                  <select id="mood" class="form-select" v-model="entryForm.mood">
                    <option value="">Select your mood...</option>
                    <option value="😊 Happy">😊 Happy</option>
                    <option value="😌 Calm">😌 Calm</option>
                    <option value="😐 Neutral">😐 Neutral</option>
                    <option value="😔 Sad">😔 Sad</option>
                    <option value="😰 Anxious">😰 Anxious</option>
                    <option value="😤 Frustrated">😤 Frustrated</option>
                    <option value="🥳 Excited">🥳 Excited</option>
                    <option value="😴 Tired">😴 Tired</option>
                    <option value="🤔 Thoughtful">🤔 Thoughtful</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="entry" class="form-label">Journal Entry</label>
                  <textarea 
                    id="entry" 
                    class="form-control" 
                    rows="10" 
                    v-model="entryForm.entry"
                    placeholder="Write about your day, thoughts, feelings..."
                  ></textarea>
                  <small class="form-text text-muted">
                    {{ entryForm.entry.length }} characters
                  </small>
                </div>
                
                <div class="d-flex gap-2 mb-3">
                  <button 
                    class="btn btn-success flex-grow-1" 
                    @click="saveEntry"
                    :disabled="!entryForm.entry.trim() || saving"
                  >
                    <i class="bi bi-check-circle"></i> {{ saving ? 'Saving...' : 'Save Entry' }}
                  </button>
                  
                  <button 
                    v-if="todayEntry" 
                    class="btn btn-secondary" 
                    @click="cancelEditing"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <!-- Summary Section -->
              <div v-if="todayEntry" class="pt-3 border-top">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="mb-0">🤖 AI Summary</h5>
                  <span class="badge" :class="summariesUsedToday >= 3 ? 'bg-danger' : 'bg-success'">
                    {{ 3 - summariesUsedToday }}/3 remaining today
                  </span>
                </div>
                
                <button 
                  class="btn btn-warning w-100 mb-2" 
                  @click="generateSummary"
                  :disabled="generatingSummary || summariesUsedToday >= 3 || !todayEntry.entry"
                >
                  <i class="bi bi-stars"></i>
                  <span v-if="generatingSummary">Generating Summary...</span>
                  <span v-else-if="summariesUsedToday >= 3">Daily Limit Reached</span>
                  <span v-else>Generate AI Summary</span>
                </button>
                
                <div v-if="todayEntry.summary" class="alert alert-info">
                  <strong>Summary:</strong>
                  <p class="mb-0 mt-2">{{ todayEntry.summary }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useJournalStore } from '../stores/journalStore'
import { summarizeText, weeklyInsights, monthlyInsights } from '../services/llmService'
import { timeService } from '../services/timeService'

const userStore = useUserStore()
const journalStore = useJournalStore()

const weeklyInsightsText = ref(null)
const monthlyInsightsText = ref(null)
const todayEntry = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const generatingSummary = ref(false)
const generatingWeekly = ref(false)
const generatingMonthly = ref(false)
const loadingMore = ref(false)
const summariesUsedToday = ref(0)
const insightYes=ref (false)

const entryForm = ref({
  entry: '',
  mood: ''
})

const pastEntries = ref([])
const displayedEntries = ref([])
const currentPage = ref(0)
const entriesPerPage = 7

const todayString = computed(() => timeService.getTodayString())

const hasMore = computed(() => {
  return displayedEntries.value.length < pastEntries.value.length
})

async function loadTodayEntry() {
  todayEntry.value = await journalStore.getTodayEntry()
  
  if (todayEntry.value) {
    entryForm.value = {
      entry: todayEntry.value.entry || '',
      mood: todayEntry.value.mood || ''
    }
    isEditing.value = false
  } else {
    isEditing.value = true
    entryForm.value = { entry: '', mood: '' }
  }
}

async function loadPastEntries() {
  const entries = await journalStore.getLast30Entries()
  const today = todayString.value
  
  pastEntries.value = entries.filter(e => e.date !== today)
  displayedEntries.value = pastEntries.value.slice(0, entriesPerPage)
  currentPage.value = 1
}

function loadMore() {
  loadingMore.value = true
  const start = currentPage.value * entriesPerPage
  const end = start + entriesPerPage
  const moreEntries = pastEntries.value.slice(start, end)
  
  displayedEntries.value = [...displayedEntries.value, ...moreEntries]
  currentPage.value++
  loadingMore.value = false
}

async function saveEntry() {
  if (!entryForm.value.entry.trim()) return
  
  saving.value = true
  
  try {
    if (todayEntry.value) {
      await journalStore.updateEntry(entryForm.value, todayEntry.value.id)
      todayEntry.value = { ...todayEntry.value, ...entryForm.value }
    } else {
      const newId = await journalStore.createEntry(entryForm.value)
      todayEntry.value = { 
        id: newId, 
        ...entryForm.value, 
        date: todayString.value 
      }
    }
    
    isEditing.value = false
    alert('Entry saved successfully!')
  } catch (err) {
    alert('❌ Failed to save entry: ' + err.message)
  } finally {
    saving.value = false
  }
}

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  if (todayEntry.value) {
    entryForm.value = {
      entry: todayEntry.value.entry || '',
      mood: todayEntry.value.mood || ''
    }
  }
}

async function generateSummary() {
  if (!todayEntry.value || summariesUsedToday.value >= 3) {
    alert('You have reached the daily limit of 3 summaries')
    return
  }
  
  generatingSummary.value = true
  
  try {
    const summary = await summarizeText(todayEntry.value.entry)
    await journalStore.updateSummary(summary, todayEntry.value.id)
    
    todayEntry.value.summary = summary
    summariesUsedToday.value++
    
    localStorage.setItem(
      `summaries_${todayString.value}`, 
      summariesUsedToday.value.toString()
    )
    
    
  } catch (err) {
    alert(' Failed to generate summary: ' + err.message)
  } finally {
    generatingSummary.value = false
  }
}

async function handleGenerateWeeklyInsights() {
  if (pastEntries.value.length < 3) {
    alert(' Write at least 3 entries to get weekly insights')
    return
  }
  
  generatingWeekly.value = true
  
  try {
    const last7 = await journalStore.getLast7Entries()
    const texts = last7.map(e => e.entry)
    
    weeklyInsightsText.value = await weeklyInsights(texts)
    alert('✅ Weekly insights generated!')
  } catch (err) {
    alert(' Failed to generate weekly insights: ' + err.message)
  } finally {
    generatingWeekly.value = false
  }
}

async function handleGenerateMonthlyInsights() {
  if (pastEntries.value.length < 7) {
    alert('Write at least 7 entries to get monthly insights')
    return
  }
  
  generatingMonthly.value = true
  
  try {
    const last30 = await journalStore.getLast30Entries()
    const texts = last30.map(e => e.entry)
    
    monthlyInsightsText.value = await monthlyInsights(texts)
    alert(' Monthly insights generated!')
  } catch (err) {
    alert('Failed to generate monthly insights: ' + err.message)
  } finally {
    generatingMonthly.value = false
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function loadSummaryCount() {
  const today = todayString.value
  const saved = localStorage.getItem(`summaries_${today}`)
  summariesUsedToday.value = saved ? parseInt(saved) : 0
}

onMounted(async () => {
  await loadTodayEntry()
  await loadPastEntries()
  loadSummaryCount()
})
</script>

<style scoped>
.journal-view {
  min-height: calc(100vh - 70px);
  
  padding: 2rem 0;
  background: linear-gradient(#f1d884,#decd94);
}

.insight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
}

.insight-card h4 {
  font-size: 1.1rem;
  color: white;
}

.insight-content {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
}

.insight-placeholder {
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-style: italic;
}
.table_img{
  width: 25%;
}
</style>