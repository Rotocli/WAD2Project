<template>
  <div class="fishtank-view">
    <div class="container-fluid p-4">
      <!-- My Fishes Section -->
      <h2>My Fishes</h2>
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
          <div
            v-for="(cell, idx) in aquariumStore.grid"
            :key="idx"
            class="tank-cell"
            :class="{ 'tank-floor': idx >= 8 }"
          >
            <div v-if="cell.decoration" class="decoration" @click="editDecoration(idx)">
              <span style="font-size:1.5rem;">{{ cell.decoration.icon }}</span>
              <div>{{ cell.decoration.name }}</div>
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
              <label>Name:</label>
              <input v-model="editDecoData.name" />
            </div>
            <div>
              <label>Icon:</label>
              <input v-model="editDecoData.icon" />
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

onMounted(() => {
  fishStore.fetchFish();
  habitStore.fetchHabits && habitStore.fetchHabits();
  // aquariumStore.fetchDecorations && aquariumStore.fetchDecorations();
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

// Decorations
const editDecoIdx = ref(null);
const editDecoData = reactive({ name: "", icon: "" });
function editDecoration(idx) {
  editDecoIdx.value = idx;
  if (aquariumStore.grid[idx].decoration) {
    Object.assign(editDecoData, aquariumStore.grid[idx].decoration);
  } else {
    Object.assign(editDecoData, { name: "", icon: "" });
  }
}
function confirmDeco() {
  aquariumStore.grid[editDecoIdx.value].decoration = { ...editDecoData };
  // Call store action for backend sync if needed!
  closeDeco();
}
function closeDeco() {
  editDecoIdx.value = null;
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
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
.tank-grid {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  grid-template-rows: repeat(3, 80px);
  background: #eaf1f9;
  border: 2px solid #aac;
  border-radius: 8px;
  gap: 0; /* No spacing so borders align */
}
.tank-cell {
  border: 1px solid #bcd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  min-width: 80px;
  min-height: 80px;
  background: #eaf1f9;
  flex-direction: column;
  cursor: pointer;
}
.tank-floor {
  background: #ede6da !important;
}
.add-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
}
.decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.7rem;
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
</style>
