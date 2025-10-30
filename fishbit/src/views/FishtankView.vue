<template>
  <div class="fishtank-view">
    <div class="container-fluid p-4">
      <h2>My Fishes</h2>
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
                    <b>Colour:</b>
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
              <label>Habit:</label>
              <select v-model="editFishData.habitId" class="form-control">
                <option v-for="h in habitStore.habits" :value="h.id" :key="h.id">
                  {{ h.name }}
                </option>
              </select>
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
                <span class="deco-icon">{{ cell.decoration.icon }}</span>
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
                <option v-for="(deco, key) in aquariumStore.decorationTypes" :key="key" :value="key">
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
import { useHabitStore } from "../stores/HabitStore";
import { useAquariumStore } from "../stores/aquariumStore";
import { useUserStore } from "../stores/userStore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
const fishStore = useFishStore();
const habitStore = useHabitStore();
const aquariumStore = useAquariumStore();
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

// Fishes
onMounted(() => {
  fishStore.fetchFish();
  habitStore.fetchHabits && habitStore.fetchHabits();
  aquariumStore.fetchSettings();
  if (!aquariumStore.grid || aquariumStore.grid.length !== 12) {
    aquariumStore.grid = Array.from({length: 12}, (_,i)=> aquariumStore.grid?.[i] || {});
  }
});

const editIdx = ref(null);
const editFishData = reactive({
  customName: "",
  habitId: "",
  species: "",
  baseColor: "",
});

function editFish(idx) {
  editIdx.value = idx;
  Object.assign(editFishData, fishStore.fish[idx]);
}
async function confirmEdit() {
  const fishObj = fishStore.fish[editIdx.value];
  await fishStore.updateFish(fishObj.id, { ...editFishData });
  closeEdit();
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
  if(aquariumStore.grid[idx].decoration){
    selectedDecoType.value = aquariumStore.grid[idx].decoration.type;
  } else {
    selectedDecoType.value = Object.keys(aquariumStore.decorationTypes)[0];
  }
}

async function confirmDeco() {
  const type = selectedDecoType.value;
  const deco = aquariumStore.decorationTypes[type];
  
  // Calculate x position from grid cell index (8 columns)
  const cellIndex = editDecoIdx.value;
  const column = cellIndex % 8; // 0-7
  const xPosition = (column * 12.5) + 6.25; // Center of each cell (100% / 8 = 12.5% per cell)
  
  await aquariumStore.updateGridCell(editDecoIdx.value, {
    type,
    name: deco.name,
    icon: deco.icon || "",
    x: xPosition, // Add x coordinate
    y: 0, // Decorations sit on the floor
    layer: deco.category === 'plant' ? 0 : 1 // Plants in back, structures in front
  });
  closeDeco();
}

function closeDeco() {
  editDecoIdx.value = null;
}

async function handleDeleteDecoration(idx) {
  await aquariumStore.removeDecoration(idx)
}
</script>

<style scoped>
.fishtank-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

.fish-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
}

.fish-card {
  background: #fff;
  border: 2px solid #bbb;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  min-width: 0; /* allow grid shrink */
  position: relative;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
}

.habit-title {
  font-size: 1.35rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.fish-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

/* Responsive fish card: stack 1 per row on small screens */
@media (max-width: 900px) {
  .fish-list {
    grid-template-columns: repeat(2, minmax(210px, 1fr));
    gap: 1.2rem;
  }
}
@media (max-width: 650px) {
  .fish-list {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
}

/* Aquarium Decoration Editor */
.aquarium-decoration-editor {
  margin-top: 2.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

.aquarium-preview {
  position: relative;
  width: 100%;
  max-width: 900px;
  min-width: 320px;
  height: 400px;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.2), 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

/* Water Surface Effect */
.water-surface-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 3s ease-in-out infinite;
  z-index: 2;
  pointer-events: none;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
}

/* Decoration Grid Overlay - Bottom Row */
.decoration-grid-overlay {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  height: 120px;
  z-index: 3;
  padding: 0 10px;
}

.grid-cell {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  margin: 2px;
}

.grid-cell:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.grid-cell.drag-over {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  border-style: solid;
}

.grid-cell.has-decoration {
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
  cursor: grabbing;
}

.deco-icon {
  font-size: clamp(2rem, 4vw, 3rem);
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  margin-bottom: 4px;
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
  border: 1px solid #c3e1f7;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.modal-dialog {
  background: #fff;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h4 {
  margin: 0 0 1.5rem 0;
  color: #1e3a8a;
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
  background: white;
  color: #1f2937;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
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
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-sm {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
</style>