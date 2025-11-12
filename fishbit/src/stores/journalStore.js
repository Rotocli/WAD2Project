import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  setDoc,
  getDoc,  
  getDocs,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  limit
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from './userStore'
import { timeService } from '../services/timeService'

export const useJournalStore = defineStore('journal', () => {
  const loading = ref(false)
  const error = ref(null)
  const entries = ref([])

  const getCurrentDate = () => timeService.now()
  const getTodayString = () => timeService.getTodayString()
  const getYesterdayString = () => timeService.getYesterdayString()
  
  const totalNumberOfEntries = computed(() => entries.value.length)
  
  const lastEntryDate = computed(() => {
    if (entries.value.length === 0) return null
    const sorted = [...entries.value].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
    return sorted[0].date
  })

  async function createEntry(entryData) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const newEntry = {
        ...entryData,
        userId: userStore.currentUserId,
        date: getTodayString(),
        createdAt: getCurrentDate(),
        summary: null
      }

      const entriesColRef = collection(db, 'journal', userStore.currentUserId, 'journalEntries')
      const docRef = await addDoc(entriesColRef, newEntry)

      entries.value.push({ id: docRef.id, ...newEntry })

      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getTodayEntry() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return null

    const today = getTodayString()
    
    try {
      const entriesColRef = collection(db, 'journal', userStore.currentUserId, 'journalEntries')
      const q = query(entriesColRef, where('date', '==', today))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    } catch (err) {
      return null
    }
  }

  async function getLast7Entries() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return []

    try {
      const entriesColRef = collection(db, 'journal', userStore.currentUserId, 'journalEntries')
      const q = query(entriesColRef, orderBy('date', 'desc'), limit(7))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      return []
    }
  }

  async function getLast30Entries() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return []

    try {
      const entriesColRef = collection(db, 'journal', userStore.currentUserId, 'journalEntries')
      const q = query(entriesColRef, orderBy('date', 'desc'), limit(30))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      return []
    }
  }

  async function updateEntry(entryData, entryId) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const entryRef = doc(db, 'journal', userStore.currentUserId, 'journalEntries', entryId)
      await updateDoc(entryRef, {
        entry: entryData.entry,
        mood: entryData.mood,
        updatedAt: getCurrentDate()
      })

      const index = entries.value.findIndex(e => e.id === entryId)
      if (index !== -1) {
        entries.value[index] = { ...entries.value[index], ...entryData }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSummary(summaryData, entryId) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const entryRef = doc(db, 'journal', userStore.currentUserId, 'journalEntries', entryId)
      await updateDoc(entryRef, {
        summary: summaryData,
        summaryUpdatedAt: getCurrentDate()
      })

      const index = entries.value.findIndex(e => e.id === entryId)
      if (index !== -1) {
        entries.value[index].summary = summaryData
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAllEntries() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const entriesColRef = collection(db, 'journal', userStore.currentUserId, 'journalEntries')
      const q = query(entriesColRef, orderBy('date', 'desc'))
      const snapshot = await getDocs(q)

      entries.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    entries,
    totalNumberOfEntries,
    lastEntryDate,
    createEntry,
    getTodayEntry,
    getLast7Entries,
    getLast30Entries,
    updateEntry,
    updateSummary,
    fetchAllEntries
  }
})