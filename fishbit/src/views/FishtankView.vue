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
        <div v-for="(fish, idx) in fishStore.fish" :key="fish.id" class="fish-card">
          <div class="habit-title">
            {{ habitStore.habits.find(h => h.id === fish.habitId)?.name || '-' }}
          </div>
          <div class="fish-content">
            <div>
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
              <div>
                <b>Type:</b> {{ fishStore.fishSpecies[fish.species]?.name || fish.species }}
              </div>
            </div>
            <div class="fish-img">
              <span style="font-size:2.5rem;">
                {{ fishStore.fishSpecies[fish.species]?.emoji }}
              </span>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2" @click="editFish(idx)">Edit</button>
          </div>
        </div>
      </div>

      </div>
      </div>
      <!-- Edit Fish Modal -->
      <div v-if="editIdx !== null" class="modal-mask">
        <div class="modal-dialog">
          <div class="modal-content">
            <h4>Edit Fish</h4>
            <div>
              <label>Name:</label>
              <input v-model="editFishData.customName" />
            </div>
            <div>
              <label>Habit:</label>
              <select v-model="editFishData.habitId">
                <option v-for="h in habitStore.habits" :value="h.id" :key="h.id">
                  {{ h.name }}
                </option>
              </select>
            </div>
            <div>
              <label>Species:</label>
              <select v-model="editFishData.species">
                <option v-for="(details, sp) in fishStore.fishSpecies" :key="sp" :value="sp">
                  {{ details.name }}
                </option>
              </select>
            </div>
            <div>
              <label>Colour:</label>
              <input type="color" v-model="editFishData.baseColor" />
            </div>
            <div class="modal-footer">
              <button class="btn btn-success btn-sm" @click="confirmEdit">Save</button>
              <button class="btn btn-secondary btn-sm" @click="closeEdit">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- My Fishtank Section -->
      <h2 class="my-4">My Fishtank</h2>
      <div class="tank-grid-container">
        <div class="tank-grid">
          <!-- FIRST ROW: Empty blue cells -->
          <div v-for="idx in 8" :key="'row1-' + idx" class="tank-cell"></div>
          
          <!-- SECOND ROW: Empty blue cells -->
          <div v-for="idx in 8" :key="'row2-' + idx" class="tank-cell"></div>

          <!-- THIRD ROW: Decorations or add buttons -->
          <div
            v-for="(cell, idx) in aquariumStore.grid.slice(0, 8)"
            :key="'row3-' + idx"
            class="tank-cell tank-floor"
          >
            <div v-if="cell.decoration" class="decoration" @click="editDecoration(idx)">
              <span>{{ cell.decoration.icon }}</span>
              <div class="deco-name">{{ cell.decoration.name }}</div>
              <button class="delete-cross" @click.stop="handleDeleteDecoration(idx)" aria-label="Delete decoration">&times;</button>
            </div>
            <button v-else class="add-btn" @click="editDecoration(idx)">+</button>
          </div>
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
import { ref, reactive, onMounted } from "vue";
import { useFishStore } from "../stores/fishStore";
import { useHabitStore } from "../stores/HabitStore";
import { useAquariumStore } from "../stores/aquariumStore";
const fishStore = useFishStore();
const habitStore = useHabitStore();
const aquariumStore = useAquariumStore();
const selectedDecoType = ref("");

// Fishes
onMounted(() => {
  fishStore.fetchFish();
  habitStore.fetchHabits && habitStore.fetchHabits();
  // aquariumStore.fetchDecorations && aquariumStore.fetchDecorations();
  aquariumStore.fetchSettings();
  // ?????
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
  await aquariumStore.updateGridCell(editDecoIdx.value, {
    type,
    name: deco.name,
    icon: deco.icon || "",
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
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.fish-card {
  background: #fff;
  border: 2px solid #bbb;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  min-width: 330px;
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
  align-items: flex-start;
  gap: 1.2rem;
}
.fish-img {
  width: 70px;
  align-self: center;
}

.tank-grid-container {
  margin-top: 2.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}
.tank-grid {
  display: grid;
  grid-template-columns: repeat(8, 100px);
  grid-template-rows: repeat(3, 80px); 
  background: #eaf1f9;
  border-radius: 6px;
  box-shadow: 0 2px 12px #ccd5e388;
  width: 800px;
  align-self: center;
}
.tank-cell {
  position: relative;
  width: 100px;
  height: 80px;
  background: #d7e0ec;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;    
}
.tank-floor {
  background: #ede6da !important;
  border: 1.3px solid #dbdbdb;
  border-collapse: collapse;
}
.add-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;    
  justify-content: center;
  width: 100%;
  height: 100%;
}
.decoration {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;      
  justify-content: center;  
  text-align: center;
  position: relative;
  pointer-events: auto;
  cursor: pointer;
}

.decoration span {
  font-size: 2rem;
  margin-bottom: 3px;
}

.deco-name {
  font-size: 0.7rem;
  max-width: 45px;
  overflow-wrap: break-word;
  margin-top: 1px;
}

.modal-mask {
  position: fixed; left:0; top:0; width:100vw; height:100vh; background:#0004;
  display:flex; align-items:center; justify-content:center; z-index:99;
}
.modal-dialog {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 24px #0004;
  min-width: 320px;
}
.modal-footer {
  margin-top: 1.2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.delete-cross {
  position: absolute;
  top: 5px;
  right: 7px;
  background: rgba(255,255,255,0.88);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1.25rem;
  color: #e11d48;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;         /* Center vertically */
  justify-content: center;     /* Center horizontally */
  padding: 0;
  line-height: 1;              /* Prevent off-center effect */
  font-family: inherit;
  font-weight: bold;
  transition: background 0.2s, color 0.2s, opacity 0.2s;
}

.delete-cross:hover {
  background: #e11d48;
  color: #fff;
  opacity: 1;
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



</style>
