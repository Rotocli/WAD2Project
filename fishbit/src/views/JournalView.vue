<template>
  <div class="journal-view">
    <!-- Book on Table - Landing View -->
    <div class="container mb-4 table-container" v-if="!openbook">
      <img class="table_img" src="../assets/table.svg" alt="">
      <div class="book-wrapper">
        <img class="book_img" src="../assets/book.svg" @click="openJournal" alt="">
        <div class="click-hint">Click to Open</div>
      </div>
    </div>


    <div class="journal-container" v-else>
      <div class="container ">
        <button class="btn btn-outline-secondary mb-3 back-btn" @click="closeJournal">
          <i class="bi bi-arrow-left"></i> Back to Table
        </button>
        
        <div class="row g-4">
          <div class="col-lg-7 order-lg-1 order-2 ">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h3 class="mb-0"> Past Journal Entries</h3>
                <span class="badge  rounded-pill">{{ pastEntries.length }} entries</span>
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
                        <div class="fw-bold date">{{ formatDate(entry.date) }}</div>
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
          <div class="col-lg-5 order-lg-2 order-1">
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
                  <button class="btn btn-edit w-100" @click="startEditing">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useJournalStore } from '../stores/journalStore'
import { summarizeText } from '../services/llmService'
import { timeService } from '../services/timeService'
import {alertSuccess,alertError,alertInfo,promptSwal} from '@/services/alert';

const userStore = useUserStore()
const journalStore = useJournalStore()

const todayEntry = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const generatingSummary = ref(false)
const loadingMore = ref(false)
const summariesUsedToday = ref(0)
const openbook = ref(false)

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

function openJournal() {
  const bookWrapper = document.querySelector('.book-wrapper')
  if (bookWrapper) {
    bookWrapper.classList.add('opening')
    setTimeout(() => {
      openbook.value = true
    }, 600)
  }
}

function closeJournal() {
  openbook.value = false
}

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
    alertSuccess('Entry saved successfully!')
  } catch (err) {
    alertError('Failed to save entry: ' + err.message)
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
    alertError('You have reached the daily limit of 3 summaries')
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
    
    alertSuccess(' AI Summary generated!')
  } catch (err) {
    alertError(' Failed to generate summary: ' + err.message)
  } finally {
    generatingSummary.value = false
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
  padding: 2rem;
  min-height: 100vh;
  background: #547da7;
  display: flex;
  flex-direction: column;
}

.badge{
  background: #547da7;
}
.date{
  color: #547da7;
}
.btn-edit{
  background: #223243;
  color: white;
}
.btn-edit:hover{
   background: #547da7;

}
.table-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  perspective: 800px;
  margin: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.table_img {
  width: 100%;
  display: block;
  position: absolute;
  top: 350px;
}

.book-wrapper {
  position: absolute;
  top: 370px;
  left: 50%;
  transform: translateX(-50%) rotateX(60deg);
  transform-style: preserve-3d;
  cursor: pointer;
  transition: all 0.4s ease;
}

.book-wrapper:hover {
  transform: translateX(-50%) rotateX(45deg) translateY(-10px) scale(1.05);
}

.book-wrapper:hover .click-hint {
  opacity: 1;
  transform: translateY(0);
}

.book-wrapper.opening {
  animation: bookOpen 0.6s ease forwards;
}

@keyframes bookOpen {
  0% {
    transform: translateX(-50%) rotateX(60deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) rotateX(30deg) translateY(-30px) scale(1.2);
  }
  100% {
    transform: translateX(-50%) rotateX(0deg) translateY(-50px) scale(1.5) rotateY(90deg);
    opacity: 0;
  }
}

.book_img {
  width: 120px;
  display: block;
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.3));
  transition: filter 0.3s ease;
}

.book-wrapper:hover .book_img {
  filter: drop-shadow(4px 8px 16px rgba(0, 0, 0, 0.5));
}

.click-hint {
  position: absolute;
  bottom: -30px;
  transform: translateX(-50%) translateY(10px) rotateX(0deg);
  backface-visibility: hidden;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.journal-container {
  animation: fadeIn 0.8s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
}

.back-btn {
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  color: #fff;
  border: 2px solid #fff;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #6c757d;
  color: white;
  transform: translateX(-5px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card {
  border-radius: 15px;
  border: none;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  border-bottom: 2px solid #e9ecef;
  padding: 1.25rem;
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


@media (max-width: 600px) {
  .journal-view {
  padding: 0.5rem;
  min-height: 100vh;
  background: #547da7;
  display: flex;
  flex-direction: column;
}


  .table-container {
    max-width: 300px;
  }

  .book_img {
    width: 90px;
  }
  .book-wrapper{
    bottom: 53%;
  }

  .click-hint {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    bottom: -25px;
  }
}

@media (max-width: 992px) {
  .journal-container {
    padding: 1rem;
  }
}
</style>