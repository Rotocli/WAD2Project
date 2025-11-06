<template>
  <div class="fishtank-view">
    <div class="container-fluid p-4">
      <h2>My Fishes</h2>
      <p>Customise your fish and tank:</p>
      
      <div>
        <div v-if="!fishStore.fish || fishStore.fish.length === 0" class="no-fish-msg">
          <div class="no-fish-card">
            <span class="no-fish-emoji">🐟</span>
            <span class="no-fish-text">You do not have any fishes yet</span>
          </div>
        </div>
        <div v-else>
          <div class="fish-list">
            <div 
              v-for="(fish, idx) in fishStore.fish" 
              :key="fish.id" 
              class="fish-card"
            >
              <div class="habit-title">
                {{ habitStore.habits.find(h => h.id === fish.habitId)?.name || '-' }}
              </div>
              <div class="fish-content">
                <div class="fish-details">
                  <div><b>Name:</b> {{ fish.customName }}</div>
                  <div>
                    <b>Colour: </b>
                    <span
                      :style="{
                        display:'inline-block',
                        verticalAlign:'middle',
                        width:'18px',
                        height:'18px',
                        background: fish.baseColor,
                        borderRadius:'3px',
                        border:'1px solid #bbb'
                      }"
                    ></span>
                  </div>
                </div>
                <div class="fish-img">
                  <svg 
                    width="80" 
                    height="60" 
                    viewBox="0 0 80 60"
                    class="fish-svg-static"
                  >
                    <ellipse 
                      cx="40" 
                      cy="30" 
                      rx="30" 
                      ry="18" 
                      :fill="fish.baseColor"
                    />
                    <g v-if="fish.pattern === 'stripes' || fish.pattern === 'default'">
                      <ellipse cx="25" cy="30" rx="8" ry="12" :fill="fish.stripeColor || fish.baseColor" opacity="0.8"/>
                      <ellipse cx="45" cy="30" rx="8" ry="12" :fill="fish.stripeColor || fish.baseColor" opacity="0.8"/>
                    </g>
                    <circle cx="55" cy="26" r="5" fill="white"/>
                    <circle cx="55" cy="26" r="3" fill="#000"/>
                    <ellipse 
                      cx="12" 
                      cy="30" 
                      rx="15" 
                      ry="12" 
                      :fill="fish.baseColor"
                      opacity="0.9"
                    />
                    <path 
                      d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" 
                      :fill="fish.baseColor"
                      opacity="0.7"
                    />
                    <ellipse 
                      cx="40" 
                      cy="12" 
                      rx="15" 
                      ry="6" 
                      :fill="fish.stripeColor || fish.baseColor"
                      opacity="0.7"
                    />
                    <ellipse 
                      cx="40" 
                      cy="48" 
                      rx="15" 
                      ry="6" 
                      :fill="fish.stripeColor || fish.baseColor"
                      opacity="0.7"
                    />
                    <path 
                      d="M 75 30 L 78 28 L 75 26" 
                      stroke="#000" 
                      stroke-width="1" 
                      fill="none"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-primary mt-2 w-100" @click="editFish(idx)">Edit</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Edit Fish Modal -->
      <div v-if="editIdx !== null" class="modal-mask" @click.self="closeEdit">
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <h4>Edit Fish</h4>
            <div class="form-group">
              <label>Name:</label>
              <input v-model="editFishData.customName" class="form-control" type="text" />
            </div>
            <div class="form-group">
              <label>Species:</label>
              <select v-model="editFishData.species" class="form-control">
                <option v-for="(details, sp) in fishStore.fishSpecies" :key="sp" :value="sp">
                  {{ details.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Head:</label>
              <select v-model="editFishData.decorations.head" class="form-control">
                <option v-for="(deco,key) in getOwnedFishDecos('head')" :key="key" :value="key">
                  {{ deco.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Eye:</label>
              <select v-model="editFishData.decorations.eye" class="form-control">
                <option v-for="(deco,key) in getOwnedFishDecos('eye')" :key="key" :value="key">
                  {{ deco.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Body:</label>
              <select v-model="editFishData.decorations.body" class="form-control">
                <option v-for="(deco,key) in getOwnedFishDecos('body')" :key="key" :value="key">
                  {{ deco.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Trail:</label>
              <select v-model="editFishData.decorations.trail" class="form-control">
                <option v-for="(deco,key) in getOwnedFishDecos('trail')" :key="key" :value="key">
                  {{ deco.name }}
                </option>
              </select>
            </div>
             <div class="form-group">
              <label>Colour:</label>
              <input type="color" v-model="editFishData.baseColor" class="form-control color-input" />
            </div>
            <div class="modal-footer">
              <button class="btn btn-success" @click="confirmEdit">Save</button>
              <button class="btn btn-secondary" @click="closeEdit">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- My Fishtank Section -->
      <h2 class="my-4">My Fishtank</h2>
      <div class="aquarium-decoration-editor">
        <div class="aquarium-preview" :style="aquariumPreviewStyle">
          <!-- Water Surface Effect -->
          <div class="water-surface-preview"></div>
          
          <!-- Decoration Grid - Last Row Only -->
          <div class="decoration-grid-overlay">
            <div
              v-for="(cell, idx) in aquariumStore.grid.slice(0, 8)"
              :key="'deco-' + idx"
              class="grid-cell"
              :class="{ 'has-decoration': cell.decoration, 'drag-over': dragOverIndex === idx }"
              @click="editDecoration(idx)"
              @dragover.prevent="handleDragOver(idx)"
              @dragleave="handleDragLeave"
              @drop="handleDrop(idx)"
            >
              <div 
                v-if="cell.decoration" 
                class="decoration-item"
                draggable="true"
                @dragstart="handleDragStart(idx, $event)"
                @dragend="handleDragEnd"
              >
                <span ><img class="deco-icon" :src=" cell.decoration.icon" alt=""></span>
                <div class="deco-label">{{ cell.decoration.name }}</div>
                <button 
                  class="delete-btn" 
                  @click.stop="handleDeleteDecoration(idx)" 
                  aria-label="Delete decoration"
                >
                  &times;
                </button>
              </div>
              <button v-else class="add-decoration-btn" @click="editDecoration(idx)">
                <span class="plus-icon">+</span>
              </button>
            </div>
          </div>
          
          <!-- Substrate -->
          <div class="substrate-preview" :style="substratePreviewStyle"></div>
        </div>
      </div>
      <!-- Edit Decoration Modal -->
      <div v-if="editDecoIdx !== null" class="modal-mask">
        <div class="modal-dialog">
          <div class="modal-content">
            <h4>{{ aquariumStore.grid[editDecoIdx].decoration ? 'Edit' : 'Add' }} Decoration</h4>
            <div>
              <label>Decoration:</label>
              <select v-model="selectedDecoType">
                <option v-for="(deco, key) in getOwnedAquariumDecos()" :key="key" :value="key">
                  {{ deco.name }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-success btn-sm" @click="confirmDeco">Save</button>
              <button class="btn btn-secondary btn-sm" @click="closeDeco">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useFishStore } from "../stores/fishStore";
import { useHabitStore } from "../stores/habitStore";
import { useAquariumStore } from "../stores/aquariumStore";
import { useUserStore } from "../stores/userStore";
import { useFishDecoStore } from "../stores/fishDecoStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const fishStore = useFishStore();
const habitStore = useHabitStore();
const aquariumStore = useAquariumStore();
const fishDecoStore = useFishDecoStore();
const inventoryStore = useInventoryStore();
const selectedDecoType = ref("");

// Drag and drop state
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

// Computed styles for aquarium preview
const aquariumPreviewStyle = computed(() => ({
  background: aquariumStore.currentLighting.gradient,
  filter: aquariumStore.currentLighting.filter
}));

const substratePreviewStyle = computed(() => ({
  background: `linear-gradient(180deg, 
    ${aquariumStore.currentSubstrate.color}40 0%, 
    ${aquariumStore.currentSubstrate.color}80 50%,
    ${aquariumStore.currentSubstrate.color} 100%)`
}));

// Ensure inventory is loaded and provide a fast ownership lookup
onMounted(() => {
  fishStore.fetchFish();
  habitStore.fetchHabits && habitStore.fetchHabits();
  aquariumStore.fetchSettings();
  inventoryStore.fetchInventory && inventoryStore.fetchInventory();

  if (!aquariumStore.grid || aquariumStore.grid.length !== 12) {
    aquariumStore.grid = Array.from({ length: 12 }, (_, i) => aquariumStore.grid?.[i] || {});
  }
});

// Build a Set of owned item identifiers (cover common id shapes)
const ownedItemIds = computed(() => {
  const items = inventoryStore.inventoryItems || [];
  const ids = new Set();
  for (const it of items) {
    if (!it) continue;
    if (it.id) ids.add(String(it.id));
    if (it._id) ids.add(String(it._id));
    if (it.itemId) ids.add(String(it.itemId));
    if (it.key) ids.add(String(it.key));
    if (it.decoId) ids.add(String(it.decoId));
    // If inventory items store a nested item object
    if (it.item && (it.item.id || it.item._id || it.item.key)) {
      if (it.item.id) ids.add(String(it.item.id));
      if (it.item._id) ids.add(String(it.item._id));
      if (it.item.key) ids.add(String(it.item.key));
    }
  }
  return ids;
});

// simple helper to check ownership
function userOwns(id) {
  if (!id) return false;
  return ownedItemIds.value.has(String(id));
}

const editIdx = ref(null);
const editFishData = reactive({
  id: "",
  customName: "",
  habitId: "",
  species: "",
  baseColor: "",
  decorations: {
    head: "",
    eye: "",
    body: "",
    trail: ""
  }
});

// Helper: return list of decoration options for a given slot filtered by inventory ownership.
// Always include the currently-selected decoration for that fish (so user isn't forced to lose it).
function getOwnedFishDecos(slot) {
  const decosObj = fishDecoStore.fishDecorations?.[slot] || {}
  const current = editFishData.decorations?.[slot]
  const result = {}
  
  for (const [key, deco] of Object.entries(decosObj)) {
    if (key === 'none' || deco.name === 'None') {
      result[key] = deco
      continue
    }
    
    // Check if user has this item (not in use OR currently equipped)
    const hasItem = inventoryStore.inventoryItems.some(
      i => i.originalItemId === key && i.category === slot && (!i.inUse || String(current) === String(key))
    )
    
    if (hasItem) {
      result[key] = deco
    }
  }
  return result
}
// Helper: return list of aquarium decorations filtered by inventory ownership
// Always include the currently-selected decoration at this grid position
function getOwnedAquariumDecos() {
  const decosObj = aquariumStore.decorationTypes || {}
  const currentCell = aquariumStore.grid[editDecoIdx.value]
  const currentType = currentCell?.decoration?.type
  const result = {}
  
  for (const [key, deco] of Object.entries(decosObj)) {
    // Check if user has this item (not in use OR currently placed)
    const hasItem = inventoryStore.inventoryItems.some(
      i => i.originalItemId === key && i.itemType === 'aquarium' && (!i.inUse || String(currentType) === String(key))
    )
    
    if (hasItem) {
      result[key] = deco
    }
  }
  return result
}

function editFish(idx) {
  editIdx.value = idx;
  const f = fishStore.fish[idx] || {};
  // copy known fields and deep copy decorations so editing doesn't mutate store directly
  editFishData.id = f.id || f._id || "";
  editFishData.customName = f.customName || f.name || "";
  editFishData.habitId = f.habitId || "";
  editFishData.species = f.species || "";
  editFishData.baseColor = f.baseColor || "";
  editFishData.decorations = { ...(f.decorations || {}) };
}

// Client-side ownership check before sending update
async function confirmEdit() {
  const fishObj = fishStore.fish[editIdx.value] || {}
  const slots = ['head', 'eye', 'body', 'trail']

  // Free up old decorations
  for (const s of slots) {
    const oldDeco = fishObj?.decorations?.[s]
    const newDeco = editFishData.decorations?.[s]
    
    if (oldDeco && oldDeco !== newDeco) {
      await freeDecoFromUse(oldDeco, s)
    }
  }

  const payload = {
    customName: editFishData.customName,
    species: editFishData.species,
    baseColor: editFishData.baseColor,
    decorations: { ...editFishData.decorations }
  }

  try {
    await fishStore.updateFish(editFishData.id || fishObj.id, payload)
    
    // Mark new decorations as in use
    for (const s of slots) {
      const newDeco = editFishData.decorations?.[s]
      if (newDeco && newDeco !== 'none') {
        await markDecoAsUsed(newDeco, s)
      }
    }
    
    closeEdit()
  } catch (err) {
    console.error('Failed to update fish', err)
    alert('Unable to update fish. Try again.')
  }
}

// UPDATE confirmDeco for aquarium decorations:

async function markAquariumDecoAsUsed(decoId) {
  if (!decoId) return
  
  const item = inventoryStore.inventoryItems.find(
    i => i.originalItemId === decoId && !i.inUse && i.itemType === 'aquarium'
  )
  
  if (item) {
    await inventoryStore.markItemInUse(item.itemId, true)
  }
}

async function freeAquariumDecoFromUse(decoId) {
  if (!decoId) return
  
  const item = inventoryStore.inventoryItems.find(
    i => i.originalItemId === decoId && i.inUse && i.itemType === 'aquarium'
  )
  
  if (item) {
    await inventoryStore.markItemInUse(item.itemId, false)
  }
}

async function markDecoAsUsed(decoId, slot) {
  if (!decoId || decoId === 'none' || decoId === '') return
  
  // Find inventory item by originalItemId that matches and is not in use
  const item = inventoryStore.inventoryItems.find(
    i => i.originalItemId === decoId && !i.inUse && i.category === slot
  )
  
  if (item) {
    await inventoryStore.markItemInUse(item.itemId, true)
  }
}

// ADD this function to free up decoration when removed:
async function freeDecoFromUse(decoId, slot) {
  if (!decoId || decoId === 'none' || decoId === '') return
  
  // Find the in-use item
  const item = inventoryStore.inventoryItems.find(
    i => i.originalItemId === decoId && i.inUse && i.category === slot
  )
  
  if (item) {
    await inventoryStore.markItemInUse(item.itemId, false)
  }
}

function closeEdit() {
  editIdx.value = null;
}

// Drag and Drop handlers
function handleDragStart(idx, event) {
  draggedIndex.value = idx;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target);
}

function handleDragOver(idx) {
  dragOverIndex.value = idx;
}

function handleDragLeave() {
  dragOverIndex.value = null;
}

function handleDragEnd() {
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

async function handleDrop(targetIdx) {
  if (draggedIndex.value === null || draggedIndex.value === targetIdx) {
    dragOverIndex.value = null;
    return;
  }

  const sourceCell = aquariumStore.grid[draggedIndex.value];
  const targetCell = aquariumStore.grid[targetIdx];

  // Swap decorations
  const temp = sourceCell.decoration;
  
  // Update positions
  if (temp) {
    const column = targetIdx % 8;
    const xPosition = (column * 12.5) + 6.25;
    temp.x = xPosition;
    temp.gridIndex = targetIdx;
  }
  
  if (targetCell.decoration) {
    const sourceColumn = draggedIndex.value % 8;
    const sourceXPosition = (sourceColumn * 12.5) + 6.25;
    targetCell.decoration.x = sourceXPosition;
    targetCell.decoration.gridIndex = draggedIndex.value;
  }

  aquariumStore.grid[targetIdx].decoration = temp;
  aquariumStore.grid[draggedIndex.value].decoration = targetCell.decoration;

  // Sync to store
  aquariumStore.syncGridToDecorations();
  
  // Save to database
  const userStore = useUserStore();
  const userId = userStore.currentUserId;
  const docRef = doc(db, 'aquariumSettings', userId);
  await updateDoc(docRef, { decorations: aquariumStore.settings.decorations });

  draggedIndex.value = null;
  dragOverIndex.value = null;
}

// Decoration
const editDecoIdx = ref(null);

function editDecoration(idx) {
  editDecoIdx.value = idx;
  if (aquariumStore.grid[idx].decoration) {
    selectedDecoType.value = aquariumStore.grid[idx].decoration.type;
  } else {
    const ownedDecos = getOwnedAquariumDecos();
    const firstOwned = Object.keys(ownedDecos)[0];
    selectedDecoType.value = firstOwned || "";
  }
}

async function confirmDeco() {
  const type = selectedDecoType.value
  if (!type) {
    alert('Please select a decoration.')
    return
  }
  
  const deco = aquariumStore.decorationTypes[type]
  if (!deco) {
    alert('Invalid decoration selected.')
    return
  }
  
  // Free up old decoration if replacing
  const currentCell = aquariumStore.grid[editDecoIdx.value]
  if (currentCell?.decoration?.type) {
    await freeAquariumDecoFromUse(currentCell.decoration.type)
  }
  
  const cellIndex = editDecoIdx.value
  const column = cellIndex % 8
  const xPosition = (column * 12.5) + 6.25
  
  await aquariumStore.updateGridCell(editDecoIdx.value, {
    type,
    name: deco.name,
    icon: deco.icon || "",
    x: xPosition,
    y: 0,
    layer: deco.category === 'plant' ? 0 : 1
  })
  
  // Mark new decoration as in use
  await markAquariumDecoAsUsed(type)
  
  closeDeco()
}

function closeDeco() {
  editDecoIdx.value = null;
}

async function handleDeleteDecoration(idx) {
  const cell = aquariumStore.grid[idx]
  if (cell?.decoration?.type) {
    await freeAquariumDecoFromUse(cell.decoration.type)
  }
  await aquariumStore.removeDecoration(idx)
}
</script>

<style scoped>
.fishtank-view {
  min-height: calc(100vh - 70px);
  background: #547da7;
  color: white;
  padding: 2rem;
}

.fish-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
}

.fish-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  min-width: 0; 
  position: relative;
  box-shadow: 0 2px 8px rgba(79, 8, 8, 0.067);
  display: flex;
  flex-direction: column;
}

.habit-title {
  font-size: 1.35rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: black;
}
.fish-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: black;
}

.fish-details {
  width: 100%;
}

.fish-img {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fish-svg-static {
  display: block;
}

@media (max-width: 1024px) {
  .fish-list {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 650px) {
  .fish-list {
    grid-template-columns: 1fr;
  }
  .fish-card {
    max-width: 400px;
    margin: 0 auto;
  }
}

/* Aquarium Preview */
.aquarium-decoration-editor {
  margin-top: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.aquarium-preview {
  position: relative;
  width: 100%;
  height: 450px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
/* Decoration Grid Overlay */
.decoration-grid-overlay {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  height: 120px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 0 10px;
  z-index: 3;
}

.grid-cell {
  position: relative;
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.grid-cell:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.grid-cell.has-decoration {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.grid-cell.drag-over {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

/* Decoration Item */
.decoration-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  cursor: grab;
  padding: 8px;
}

.decoration-item:active {
  cursor: pointer;
}

.deco-icon {
  width: clamp(40px, 8vw, 120px);  /* scales between 40px and 120px */
  height: auto;                     /* keep aspect ratio */
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  margin-bottom: 4px;
  display: block;
}
.deco-label {
  font-size: clamp(0.65rem, 1vw, 0.85rem);
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  font-weight: 500;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Add Decoration Button */
.add-decoration-btn {
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-decoration-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.plus-icon {
  font-weight: 300;
  line-height: 1;
}

/* Delete Button */
.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1.2rem;
  color: #e11d48;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  font-weight: bold;
  opacity: 0.8;
}

.delete-btn:hover {
  background: #e11d48;
  color: #fff;
  opacity: 1;
  transform: scale(1.1);
}

/* Substrate Preview */
.substrate-preview {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 1;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 900px) {
  .aquarium-preview {
    height: 350px;
  }
  
  .decoration-grid-overlay {
    height: 100px;
    bottom: 35px;
  }
}

@media (max-width: 650px) {
  .aquarium-preview {
    height: 300px;
  }
  
  .decoration-grid-overlay {
    grid-template-columns: repeat(4, 1fr);
    height: 200px;
    bottom: 30px;
  }
  
  .deco-icon {
    font-size: 1.8rem;
  }
}
.no-fish-msg {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0 1.5rem 0;
}
.no-fish-card {
  background: #eef7fb;
  border: 1px solid #547da7;
  border-radius: 14px;
  padding: 1.3rem 2rem;
  box-shadow: 0 2px 10px rgba(50,130,182,0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
}
.no-fish-emoji {
  font-size: 2.2rem;
}
.no-fish-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #49708a;
}

.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-dialog {
  border-radius: 15px;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  margin: auto;
}

body.modal-open {
  overflow: hidden;
}

.modal-content h4 {
  margin: 0 0 1.5rem 0;
  color: #070e21;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.modal-content label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: #ffffff;
  color: #1f2937;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:hover {
  border-color: #cbd5e1;
}

.color-input {
  height: 50px;
  cursor: pointer;
  padding: 0.25rem;
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-success {
  background: #547da7;
  color: white;
}

.btn-success:hover {
    background: white;
    color: #547da7;
}

.btn-secondary {
  background: #022b3a;
  color: white;
}

.btn-secondary:hover {
  background: white;
  color: #022b3a;

}

.btn-sm {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-outline-primary {
  background: white;
  color: #547da7;
}

.btn-outline-primary:hover {
  background: #547da7;
  color: white;
}
</style>