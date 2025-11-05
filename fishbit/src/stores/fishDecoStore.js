import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  doc, 
  getDoc,
  setDoc, 
  updateDoc
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from './userStore'



export const useFishDecoStore = defineStore('fishdeco', () => {
  const fishDecorations = {
    head: {
      crown: { 
        name: 'Crown', 
        icon: '../assets/crown.svg'
, 
        cost: 200, 
        effect: 'prestige',
        svg: 'crown',
        color: '#FFD700',
        position: { x: 40, y: -5 },
        scale: 1.2
      },
      topHat: { 
        name: 'Top Hat', 
        icon: '🎩', 
        cost: 150, 
        effect: 'prestige',
        svg: 'tophat',
        color: '#1a1a1a',
        position: { x: 40, y: -8 },
        scale: 1.0
      },
      bow: { 
        name: 'Bow', 
        icon: '🎀', 
        cost: 100, 
        effect: 'cute',
        svg: 'bow',
        color: '#FF69B4',
        position: { x: 40, y: -2 },
        scale: 0.8
      },
      none: { 
        name: 'None', 
        icon: '', 
        cost: 0, 
        effect: null 
      }
    },
    eye: {
      sunglasses: { 
        name: 'Sunglasses', 
        icon: '🕶️', 
        cost: 120, 
        effect: 'cool',
        svg: 'sunglasses',
        color: '#2a2a2a',
        position: { x: 55, y: 26 },
        scale: 1.0
      },
      monocle: { 
        name: 'Monocle', 
        icon: '🧐', 
        cost: 100, 
        effect: 'classy',
        svg: 'monocle',
        color: '#D4AF37',
        position: { x: 55, y: 26 },
        scale: 1.1
      },
      starEyes: { 
        name: 'Star Eyes', 
        icon: '🌟', 
        cost: 80, 
        effect: 'cute',
        svg: 'stareyes',
        color: '#FFD700',
        position: { x: 55, y: 26 },
        scale: 0.9
      },
      none: { 
        name: 'None', 
        icon: '', 
        cost: 0, 
        effect: null 
      }
    },
    body: {
      stripes: { 
        name: 'Stripes', 
        icon: '', 
        cost: 50, 
        effect: 'pattern',
        svg: 'stripes',
        type: 'pattern'
      },
      spots: { 
        name: 'Spots', 
        icon: '', 
        cost: 50, 
        effect: 'pattern',
        svg: 'spots',
        type: 'pattern'
      },
      glitter: { 
        name: 'Glitter', 
        icon: '', 
        cost: 150, 
        effect: 'sparkle',
        svg: 'glitter',
        type: 'pattern',
        animate: true
      },
      none: { 
        name: 'None', 
        icon: '', 
        cost: 0, 
        effect: null 
      }
    },
    trail: {
      rainbow: { 
        name: 'Rainbow Trail', 
        icon: '', 
        cost: 200, 
        effect: 'sparkle',
        svg: 'rainbow',
        colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
        animate: true
      },
      bubbles: { 
        name: 'Bubbles Trail', 
        icon: '', 
        cost: 100, 
        effect: 'bubbly',
        svg: 'bubbles',
        color: '#87CEEB',
        count: 5,
        animate: true
      },
      fire: { 
        name: 'Fire Trail', 
        icon: '', 
        cost: 250, 
        effect: 'cool',
        svg: 'fire',
        colors: ['#FF4500', '#FF8C00', '#FFD700'],
        animate: true
      },
      none: { 
        name: 'None', 
        icon: '', 
        cost: 0, 
        effect: null 
      }
    }
  }

  

  // User's equipped decorations
  const equippedDecorations = ref({
    head: 'none',
    eye: 'none',
    body: 'none',
    trail: 'none'
  })

  // Owned decorations (unlocked by purchase)
  const ownedDecorations = ref({
    head: ['none'],
    eye: ['none'],
    body: ['none'],
    trail: ['none']
  })

  // Get decoration details
  const getDecoration = (slot, decoId) => {
    return fishDecorations[slot][decoId] || null
  }



  // Get equipped decoration for a slot
  const getEquippedDecoration = (slot) => {
    const decoId = equippedDecorations.value[slot]
    return getDecoration(slot, decoId)
  }

  // Check if decoration is owned
  const isOwned = (slot, decoId) => {
    return ownedDecorations.value[slot].includes(decoId)
  }

  // Purchase decoration
  const purchaseDecoration = async (slot, decoId) => {
    const userStore = useUserStore()
    const deco = getDecoration(slot, decoId)
    
    if (!deco || isOwned(slot, decoId)) {
      return { success: false, message: 'Already owned or invalid decoration' }
    }

    if (userStore.userProfile.coins < deco.cost) {
      return { success: false, message: 'Not enough coins' }
    }

    // Deduct coins and add to owned
    await userStore.updateCoins(-deco.cost)
    ownedDecorations.value[slot].push(decoId)
    
    // Save to Firebase
    await saveDecorationsToFirebase()
    
    return { success: true, message: `${deco.name} purchased!` }
  }

  // Equip decoration
  const equipDecoration = async (slot, decoId) => {
    if (!isOwned(slot, decoId)) {
      return { success: false, message: 'Decoration not owned' }
    }

    equippedDecorations.value[slot] = decoId
    await saveDecorationsToFirebase()
    
    return { success: true }
  }

  // Save to Firebase
  const saveDecorationsToFirebase = async () => {
    const userStore = useUserStore()
    if (!userStore.userId) return

    const docRef = doc(db, 'fishDecorations', userStore.userId)
    await setDoc(docRef, {
      equipped: equippedDecorations.value,
      owned: ownedDecorations.value,
      updatedAt: new Date()
    }, { merge: true })
  }

  // Load from Firebase
  const loadDecorationsFromFirebase = async () => {
    const userStore = useUserStore()
    if (!userStore.userId) return

    const docRef = doc(db, 'fishDecorations', userStore.userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      equippedDecorations.value = data.equipped || equippedDecorations.value
      ownedDecorations.value = data.owned || ownedDecorations.value
    }
  }

  return {
    fishDecorations,
    equippedDecorations,
    ownedDecorations,
    getDecoration,
    getEquippedDecoration,
    isOwned,
    purchaseDecoration,
    equipDecoration,
    loadDecorationsFromFirebase
  }
})
