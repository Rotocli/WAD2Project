import { ref } from 'vue'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'

const userAchievements = ref({})

export function useAchievements() {
  const userStore = useUserStore()
  const habitStore = useHabitStore()

  async function loadAchievements() {
    if (!userStore.currentUserId) return
    
    try {
      const docRef = doc(db, 'achievements', userStore.currentUserId)
      const docSnap = await getDoc(docRef)
     
      if (docSnap.exists()) {
        userAchievements.value = docSnap.data()
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
      if (error.code === 'permission-denied') {
        console.log('No achievements yet - will be created on first unlock')
        userAchievements.value = {}
      }
    }
  }

  async function checkAchievements() {
    if (!userStore.currentUserId) return

    const achievements = [
      {
        id: 'first-habit',
        name: 'Getting Started',
        points: 10,
        attained: habitStore.habits.length >= 1,
      },
      {
        id: 'habit-5',
        name: 'Habit Builder',
        points: 25,
        attained: habitStore.habits.length >= 5,
      },
      {
        id: 'first-complete',
        name: 'First Step',
        points: 15,
        attained: habitStore.habits.some(h => h.completedCount >= 1),
      },
      {
        id: 'streak-3',
        name: 'On a Roll',
        points: 20,
        attained: userStore.currentStreak >= 3,
      },
      {
        id: 'streak-7',
        name: 'Week Warrior',
        points: 35,
        attained: userStore.currentStreak >= 7,
      },
      {
        id: 'streak-30',
        name: 'Monthly Master',
        points: 100,
        attained: userStore.currentStreak >= 30,
      },
      {
        id: 'habit-50',
        name: 'Half Century',
        points: 100,
        attained: habitStore.habits.some(h => h.completedCount >= 50),
      },
      {
        id: 'habit-100',
        name: 'Centurion',
        points: 300,
        attained: habitStore.habits.some(h => h.completedCount >= 100),
      },
      {
        id: 'points-100',
        name: 'Point Collector',
        points: 20,
        attained: userStore.totalPoints >= 100,
      },
      {
        id: 'points-500',
        name: 'Point Hoarder',
        points: 100,
        attained: userStore.totalPoints >= 500,
      },
    ]

    const newUnlocks = []
    let totalPointsEarned = 0

    for (const achievement of achievements) {
      if (userAchievements.value[achievement.id]) continue

      if (achievement.attained) {
        newUnlocks.push(achievement.id)
        totalPointsEarned += achievement.points
        userAchievements.value[achievement.id] = {
          unlockedAt: new Date(),
          name: achievement.name,
          pointsAwarded: achievement.points
        }
      }
    }

    if (newUnlocks.length > 0) {
      try {
        await setDoc(
          doc(db, 'achievements', userStore.currentUserId),
          userAchievements.value,
          { merge: true }
        )

        await userStore.addPoints(totalPointsEarned)
     
        console.log('🏆 New achievements unlocked:', newUnlocks)
        console.log(`💰 Points earned: ${totalPointsEarned}`)
      } catch (error) {
        console.error('Error saving achievements:', error)
      }
    }
  }

  return {
    userAchievements,
    loadAchievements,
    checkAchievements
  }
}